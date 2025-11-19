import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface BookingConfirmationPayload {
	bookingId: string;
}

serve(async (req) => {
	// Handle CORS
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { bookingId }: BookingConfirmationPayload = await req.json();

		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const resendApiKey = Deno.env.get('RESEND_API_KEY');

		const supabase = createClient(supabaseUrl, supabaseKey);

		// Fetch booking details
		const { data: booking, error } = await supabase
			.from('bookings')
			.select(
				`
				*,
				organization:organizations(*),
				service:services(*),
				staff:staff_members(*, user:users(*))
			`
			)
			.eq('id', bookingId)
			.single();

		if (error || !booking) {
			throw new Error('Booking not found');
		}

		// If Resend is configured, send email
		if (resendApiKey) {
			const emailHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Booking Confirmation</title>
</head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #3b82f6;">Booking Confirmed! ✅</h1>
	<p>Dear ${booking.customer_name},</p>
	<p>Your booking has been confirmed at ${booking.organization.name}.</p>

	<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
		<h2>Booking Details</h2>
		<p><strong>Service:</strong> ${booking.service.name}</p>
		<p><strong>Staff:</strong> ${booking.staff.user.full_name}</p>
		<p><strong>Date:</strong> ${booking.booking_date}</p>
		<p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
		<p><strong>Duration:</strong> ${booking.service.duration_minutes} minutes</p>
		<p><strong>Price:</strong> $${booking.price} ${booking.service.currency}</p>
	</div>

	${
		booking.notes
			? `<div style="margin: 20px 0;"><strong>Your Notes:</strong><p>${booking.notes}</p></div>`
			: ''
	}

	<p>If you need to make changes, please contact us at ${booking.organization.email}</p>

	<p>Thank you!</p>
	<p><strong>${booking.organization.name}</strong></p>
</body>
</html>`;

			const emailResponse = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${resendApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: `${booking.organization.name} <bookings@bookease.app>`,
					to: booking.customer_email,
					subject: `Booking Confirmation - ${booking.service.name}`,
					html: emailHtml
				})
			});

			if (!emailResponse.ok) {
				console.error('Failed to send email:', await emailResponse.text());
			}
		}

		return new Response(JSON.stringify({ success: true, bookingId }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
});
