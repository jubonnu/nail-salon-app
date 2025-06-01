import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.8'

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
        if (path === 'schedule') {
          // Get staff schedule
          const params = url.searchParams
          const staffId = params.get('staffId')
          const date = params.get('date')

          const { data: appointments, error: appointmentsError } = await supabaseClient
            .from('appointments')
            .select(`
              id,
              start_time,
              end_time,
              service_type,
              customers (
                name
              )
            `)
            .eq('staff_id', staffId)
            .gte('start_time', `${date}T00:00:00`)
            .lte('start_time', `${date}T23:59:59`)
            .order('start_time')

          if (appointmentsError) throw appointmentsError
          return new Response(JSON.stringify(appointments), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else if (path === 'performance') {
          // Get staff performance metrics
          const params = url.searchParams
          const staffId = params.get('staffId')
          const startDate = params.get('startDate')
          const endDate = params.get('endDate')

          const { data: sales, error: salesError } = await supabaseClient
            .from('sales_records')
            .select('*')
            .eq('staff_id', staffId)
            .gte('created_at', startDate)
            .lte('created_at', endDate)

          if (salesError) throw salesError

          const { data: appointments, error: appointmentsError } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('staff_id', staffId)
            .gte('start_time', startDate)
            .lte('start_time', endDate)

          if (appointmentsError) throw appointmentsError

          const metrics = {
            totalSales: sales?.reduce((sum, record) => sum + record.amount, 0) || 0,
            totalAppointments: appointments?.length || 0,
            averageServiceValue: sales?.length 
              ? Math.round(sales.reduce((sum, record) => sum + record.amount, 0) / sales.length) 
              : 0,
          }

          return new Response(JSON.stringify(metrics), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // List staff members
          const { data, error } = await supabaseClient
            .from('staff')
            .select('*')
            .order('name')

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create staff member
        const newStaff = await req.json()
        const { data, error } = await supabaseClient
          .from('staff')
          .insert([newStaff])
          .select()

        if (error) throw error
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update staff member
        const staffId = path
        const updates = await req.json()
        const { data: updatedStaff, error: updateError } = await supabaseClient
          .from('staff')
          .update(updates)
          .eq('id', staffId)
          .select()

        if (updateError) throw updateError
        return new Response(JSON.stringify(updatedStaff[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Delete staff member
        const id = path
        
        // Check if staff member has any appointments
        const { data: appointments, error: checkError } = await supabaseClient
          .from('appointments')
          .select('id')
          .eq('staff_id', id)
          .limit(1)

        if (checkError) throw checkError

        if (appointments && appointments.length > 0) {
          throw new Error('Cannot delete staff member with existing appointments')
        }

        const { error: deleteError } = await supabaseClient
          .from('staff')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError
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