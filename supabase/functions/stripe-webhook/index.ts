import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Simple HMAC verification for webhooks
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(body)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature if webhook secret is provided
    if (webhookSecret && signature) {
      const timestampAndSig = signature.split(',');
      const timestamp = timestampAndSig[0]?.split('=')[1];
      const sig = timestampAndSig[1]?.split('=')[1];
      
      if (!sig || !timestamp) {
        throw new Error('Invalid signature format');
      }

      const payload = `${timestamp}.${body}`;
      const isValid = await verifyWebhookSignature(payload, sig, webhookSecret);
      
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    const event = JSON.parse(body);
    console.log('Received Stripe webhook:', event.type);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;
        
        if (!userId) {
          console.error('No user_id in checkout session metadata');
          break;
        }

        // Add 10 cloud builds to user's account
        await supabase.rpc('add_purchased_builds', {
          user_uuid: userId,
          builds_to_add: 10
        });
        console.log(`Added 10 cloud builds to user ${userId}`);
        break;
      }




      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stripe-webhook:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});