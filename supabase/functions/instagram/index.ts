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
        if (path === 'scheduled') {
          // Get scheduled posts
          const { data, error } = await supabaseClient
            .from('instagram_posts')
            .select('*')
            .eq('status', 'scheduled')
            .gte('scheduled_time', new Date().toISOString())
            .order('scheduled_time')

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // List all posts
          const { data, error } = await supabaseClient
            .from('instagram_posts')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

      case 'POST':
        // Create post
        const newPost = await req.json()
        const { data, error } = await supabaseClient
          .from('instagram_posts')
          .insert([newPost])
          .select()

        if (error) throw error

        // If post is scheduled, set up a background task
        if (newPost.status === 'scheduled' && newPost.scheduled_time) {
          // Here you would typically set up a background task to publish the post
          // This could be done using a separate worker or a cron job
          console.log(`Post ${data[0].id} scheduled for ${newPost.scheduled_time}`)
        }

        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'PUT':
        // Update post
        const postId = path
        const updates = await req.json()
        const { data: updatedPost, error: updateError } = await supabaseClient
          .from('instagram_posts')
          .update(updates)
          .eq('id', postId)
          .select()

        if (updateError) throw updateError

        // Update scheduling if needed
        if (updates.status === 'scheduled' && updates.scheduled_time) {
          console.log(`Post ${postId} rescheduled for ${updates.scheduled_time}`)
        }

        return new Response(JSON.stringify(updatedPost[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      case 'DELETE':
        // Delete post
        const id = path
        const { error: deleteError } = await supabaseClient
          .from('instagram_posts')
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