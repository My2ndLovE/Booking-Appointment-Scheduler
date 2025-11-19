import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const resendApiKey = Deno.env.get('RESEND_API_KEY');

		const supabase = createClient(supabaseUrl, supabaseKey);

		// Get bookings for tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowStr = tomorrow.toISOString().split('T')[0];

		const { data: bookings } = await supabase
			.from('bookings')
			.select('*, organization:organizations(*), service:services(*)')
			.eq('booking_date', tomorrowStr)
			.eq('status', 'confirmed');

		console.log(`Found ${bookings?.length || 0} bookings for tomorrow`);

		// Send reminder emails if Resend is configured
		if (resendApiKey && bookings) {
			for (const booking of bookings) {
				const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #3b82f6;">Reminder: Upcoming Appointment 🔔</h1>
	<p>Dear ${booking.customer_name},</p>
	<p>This is a reminder about your upcoming appointment tomorrow.</p>

	<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
		<h2>Appointment Details</h2>
		<p><strong>Service:</strong> ${booking.service.name}</p>
		<p><strong>Date:</strong> ${booking.booking_date}</p>
		<p><strong>Time:</strong> ${booking.start_time}</p>
		<p><strong>Location:</strong> ${booking.organization.name}</p>
	</div>

	<p>We look forward to seeing you!</p>
	<p><strong>${booking.organization.name}</strong></p>
</body>
</html>`;

				await fetch('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${resendApiKey}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						from: `${booking.organization.name} <reminders@bookease.app>`,
						to: booking.customer_email,
						subject: 'Reminder: Your Appointment Tomorrow',
						html: emailHtml
					})
				});
			}
		}

		return new Response(
			JSON.stringify({ success: true, count: bookings?.length || 0 }),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
});
