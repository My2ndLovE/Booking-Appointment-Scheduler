import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { bookingId, paymentMethodId } = await req.json();

		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

		const supabase = createClient(supabaseUrl, supabaseKey);

		// Get booking
		const { data: booking } = await supabase
			.from('bookings')
			.select('*, organization:organizations(*)')
			.eq('id', bookingId)
			.single();

		if (!booking) {
			throw new Error('Booking not found');
		}

		// Mock payment processing for demo
		// In production, integrate with Stripe API
		const paymentIntent = {
			id: `pi_${Math.random().toString(36).substring(7)}`,
			status: 'succeeded',
			amount: Math.round(Number(booking.price) * 100)
		};

		// Update booking with payment info
		await supabase
			.from('bookings')
			.update({
				payment_intent_id: paymentIntent.id,
				payment_status: 'paid'
			})
			.eq('id', bookingId);

		return new Response(JSON.stringify({ success: true, paymentIntent }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
});
