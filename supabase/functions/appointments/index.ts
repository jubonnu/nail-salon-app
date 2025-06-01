import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.8'
import { format, isOverlapping } from 'npm:date-fns@2.30.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (req.method) {
      case 'GET':
        if (path === 'availability') {
          // Check staff availability
          const params = url.searchParams
          const staffId = params.get('staffId')
          const date = params.get('date')

          const { data: existingAppointments, error: fetchError } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('staff_id', staffId)
            .gte('start_time', `${date}T00:00:00`)
            .lte('start_time', `${date}T23:59:59`)
            .order('start_time')

          if (fetchError) throw fetchError

          // Calculate available time slots
          const workingHours = {
            start: 9, // 9:00
            end: 19,  // 19:00
          }

          const timeSlots = []
          for (let hour = workingHours.start; hour < workingHours.end; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
              const slot = format(
                new Date(date).setHours(hour, minute),
                "yyyy-MM-dd'T'HH:mm:ssXXX"
              )
              
              // Check if slot overlaps with existing appointments
              const isAvailable = !existingAppointments?.some(appointment =>
                isOverlapping(
                  new Date(slot),
                  new Date(new Date(slot).getTime() + 60 * 60 * 1000), // 1 hour duration
                  new Date(appointment.start_time),
                  new Date(appointment.end_time)
                )
              )

              if (isAvailable) {
                timeSlots.push(slot)
              }
            }
          }

          return new Response(JSON.stringify(timeSlots), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // List appointments
          const { data, error } = await supabaseClient
            .from('appointments')
            .select(`
              *,
              customers (
                name,
                email,
                phone
              ),
              staff (
                name,
                email
              )
            `)
            .order('start_time')

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create appointment
        const newAppointment = await req.json()
        
        // Check for overlapping appointments
        const { data: conflicts, error: conflictError } = await supabaseClient
          .from('appointments')
          .select('*')
          .eq('staff_id', newAppointment.staff_id)
          .overlaps('start_time', 'end_time', newAppointment.start_time, newAppointment.end_time)

        if (conflictError) throw conflictError
        if (conflicts && conflicts.length > 0) {
          throw new Error('Selected time slot is already booked')
        }

        const { data, error } = await supabaseClient
          .from('appointments')
          .insert([newAppointment])
          .select(`
            *,
            customers (
              name,
              email,
              phone
            ),
            staff (
              name,
              email
            )
          `)

        if (error) throw error

        // Send confirmation email (implement with your email service)
        // await sendConfirmationEmail(data[0])

        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update appointment
        const appointmentId = path
        const updates = await req.json()

        // Check for overlapping appointments if time is being updated
        if (updates.start_time || updates.end_time) {
          const { data: existingAppointment } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .single()

          const { data: conflicts, error: conflictError } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('staff_id', existingAppointment.staff_id)
            .neq('id', appointmentId)
            .overlaps(
              'start_time',
              'end_time',
              updates.start_time || existingAppointment.start_time,
              updates.end_time || existingAppointment.end_time
            )

          if (conflictError) throw conflictError
          if (conflicts && conflicts.length > 0) {
            throw new Error('Selected time slot is already booked')
          }
        }

        const { data: updatedAppointment, error: updateError } = await supabaseClient
          .from('appointments')
          .update(updates)
          .eq('id', appointmentId)
          .select(`
            *,
            customers (
              name,
              email,
              phone
            ),
            staff (
              name,
              email
            )
          `)

        if (updateError) throw updateError

        // Send update notification if status changed
        if (updates.status) {
          // await sendStatusUpdateNotification(updatedAppointment[0])
        }

        return new Response(JSON.stringify(updatedAppointment[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Cancel appointment
        const id = path
        
        // Get appointment details before deletion
        const { data: appointmentToCancel } = await supabaseClient
          .from('appointments')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .eq('id', id)
          .single()

        const { error: deleteError } = await supabaseClient
          .from('appointments')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        // Send cancellation notification
        // await sendCancellationNotification(appointmentToCancel)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        return new Response('Method not allowed', {
          status: 405,
          headers: corsHeaders,
        })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})