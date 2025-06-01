import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.8'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'npm:date-fns@2.30.0'

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
        if (path === 'summary') {
          // Get sales summary
          const params = url.searchParams
          const period = params.get('period') || 'day'
          const date = new Date(params.get('date') || new Date())

          let startDate, endDate
          switch (period) {
            case 'day':
              startDate = startOfDay(date)
              endDate = endOfDay(date)
              break
            case 'week':
              startDate = startOfWeek(date, { weekStartsOn: 1 })
              endDate = endOfWeek(date, { weekStartsOn: 1 })
              break
            case 'month':
              startDate = startOfMonth(date)
              endDate = endOfMonth(date)
              break
            default:
              throw new Error('Invalid period')
          }

          const { data: salesData, error: salesError } = await supabaseClient
            .from('sales_records')
            .select(`
              *,
              customers (name),
              staff (name),
              appointments (service_type)
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

          if (salesError) throw salesError

          // Calculate summary
          const summary = {
            totalSales: salesData?.reduce((sum, record) => sum + record.amount, 0) || 0,
            totalTransactions: salesData?.length || 0,
            averageTransaction: salesData?.length 
              ? Math.round(salesData.reduce((sum, record) => sum + record.amount, 0) / salesData.length) 
              : 0,
            byPaymentMethod: salesData?.reduce((acc, record) => {
              acc[record.payment_method] = (acc[record.payment_method] || 0) + record.amount
              return acc
            }, {}),
            byService: salesData?.reduce((acc, record) => {
              const service = record.appointments?.service_type || 'その他'
              acc[service] = (acc[service] || 0) + record.amount
              return acc
            }, {}),
            byStaff: salesData?.reduce((acc, record) => {
              const staff = record.staff?.name || 'Unknown'
              acc[staff] = (acc[staff] || 0) + record.amount
              return acc
            }, {})
          }

          return new Response(JSON.stringify({ summary, records: salesData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // List sales records
          const { data, error } = await supabaseClient
            .from('sales_records')
            .select(`
              *,
              customers (name),
              staff (name),
              appointments (service_type)
            `)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create sales record
        const newRecord = await req.json()
        const { data, error } = await supabaseClient
          .from('sales_records')
          .insert([newRecord])
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `)

        if (error) throw error
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update sales record
        const recordId = path
        const updates = await req.json()
        const { data: updatedRecord, error: updateError } = await supabaseClient
          .from('sales_records')
          .update(updates)
          .eq('id', recordId)
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `)

        if (updateError) throw updateError
        return new Response(JSON.stringify(updatedRecord[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Delete sales record
        const id = path
        const { error: deleteError } = await supabaseClient
          .from('sales_records')
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