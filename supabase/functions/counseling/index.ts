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
        if (path === 'search') {
          // Search counseling sheets
          const params = url.searchParams
          const query = params.get('q')
          const status = params.get('status')
          let queryBuilder = supabaseClient
            .from('counseling_sheets')
            .select(`
              *,
              customers (
                name,
                email,
                phone
              )
            `)

          if (status) {
            queryBuilder = queryBuilder.eq('status', status)
          }

          if (query) {
            queryBuilder = queryBuilder.or(
              `customers.name.ilike.%${query}%,customers.email.ilike.%${query}%,customers.phone.ilike.%${query}%`
            )
          }

          const { data, error } = await queryBuilder.order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // List counseling sheets
          const { data, error } = await supabaseClient
            .from('counseling_sheets')
            .select(`
              *,
              customers (
                name,
                email,
                phone
              )
            `)
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create counseling sheet
        const newSheet = await req.json()
        const { data, error } = await supabaseClient
          .from('counseling_sheets')
          .insert([newSheet])
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)

        if (error) throw error
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update counseling sheet
        const sheetId = path
        const updates = await req.json()
        const { data: updatedSheet, error: updateError } = await supabaseClient
          .from('counseling_sheets')
          .update(updates)
          .eq('id', sheetId)
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)

        if (updateError) throw updateError
        return new Response(JSON.stringify(updatedSheet[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Delete counseling sheet
        const id = path
        const { error: deleteError } = await supabaseClient
          .from('counseling_sheets')
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