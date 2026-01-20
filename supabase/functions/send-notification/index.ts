// Supabase Edge Function: Send Notification
// Deploy with: supabase functions deploy send-notification

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: 'message' | 'announcement';
  data?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: NotificationPayload = await req.json();
    const { userId, title, body, type, data } = payload;

    // Validate required fields
    if (!userId || !title || !body || !type) {
      throw new Error('Missing required fields: userId, title, body, type');
    }

    // Get user's notification preferences (future enhancement)
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }

    // Log notification (in production, send to push service)
    console.log(`Sending notification to ${user.email}:`, {
      title,
      body,
      type,
      data,
    });

    // Here you would integrate with:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNS)
    // - Web Push API
    // - Email service (Resend, SendGrid, etc.)

    // For now, we'll just store the notification in a future notifications table
    // and return success

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${user.name}`,
        notification: { title, body, type },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
