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
        
        if (!userId) {
          console.error('No user_id in checkout session metadata');
          break;
        }

        // Update user's subscription plan to pro
        await supabase
          .from('profiles')
          .update({ 
            subscription_plan: 'pro',
            stripe_customer_id: session.customer 
          })
          .eq('user_id', userId);

        console.log(`Updated user ${userId} to pro plan`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get user from customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('No user found for customer:', customerId);
          break;
        }

        // Upsert subscription record
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: profile.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_name: 'pro',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        // Update profile subscription plan based on status
        const isActive = ['active', 'trialing'].includes(subscription.status);
        await supabase
          .from('profiles')
          .update({ 
            subscription_plan: isActive ? 'pro' : 'free'
          })
          .eq('user_id', profile.user_id);

        console.log(`Updated subscription for user ${profile.user_id}:`, subscription.status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get user from customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('No user found for customer:', customerId);
          break;
        }

        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        // Downgrade user to free plan
        await supabase
          .from('profiles')
          .update({ subscription_plan: 'free' })
          .eq('user_id', profile.user_id);

        console.log(`Downgraded user ${profile.user_id} to free plan`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Get user from customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          console.log(`Payment failed for user ${profile.user_id}`);
          // You might want to send an email notification here
        }
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});