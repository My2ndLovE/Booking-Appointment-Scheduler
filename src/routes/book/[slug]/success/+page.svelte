<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { formatDate, formatTime } from '$lib/utils/date';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Booking Confirmed - {data.booking.organization.name}</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-4">
	<div class="w-full max-w-2xl" in:fade={{ duration: 300 }}>
		<!-- Success Icon -->
		<div class="text-center mb-8" in:fly={{ y: -20, duration: 500, delay: 200 }}>
			<div class="text-6xl mb-4">✅</div>
			<h1 class="h1 mb-2">Booking Confirmed!</h1>
			<p class="text-surface-600 dark:text-surface-400">
				We've sent a confirmation email to {data.booking.customer_email}
			</p>
		</div>

		<!-- Booking Details Card -->
		<div class="card p-8 mb-6" in:fly={{ y: 20, duration: 500, delay: 300 }}>
			<h2 class="h2 mb-6">Appointment Details</h2>

			<div class="grid md:grid-cols-2 gap-6">
				<div>
					<p class="text-sm opacity-75 mb-1">Organization</p>
					<p class="font-semibold">{data.booking.organization.name}</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Service</p>
					<p class="font-semibold">{data.booking.service.name}</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Staff Member</p>
					<p class="font-semibold">{data.booking.staff.user.full_name}</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Booking ID</p>
					<p class="font-mono text-sm">{data.booking.id.slice(0, 8)}</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Date</p>
					<p class="font-semibold">{formatDate(new Date(data.booking.booking_date), 'PPP')}</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Time</p>
					<p class="font-semibold">
						{formatTime(data.booking.start_time)} - {formatTime(data.booking.end_time)}
					</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Duration</p>
					<p class="font-semibold">{data.booking.service.duration_minutes} minutes</p>
				</div>

				<div>
					<p class="text-sm opacity-75 mb-1">Price</p>
					<p class="font-semibold">
						${data.booking.price.toFixed(2)} {data.booking.service.currency}
					</p>
				</div>
			</div>

			{#if data.booking.notes}
				<div class="mt-6 pt-6 border-t">
					<p class="text-sm opacity-75 mb-1">Your Notes</p>
					<p>{data.booking.notes}</p>
				</div>
			{/if}
		</div>

		<!-- Next Steps -->
		<div class="card p-6 mb-6" in:fly={{ y: 20, duration: 500, delay: 400 }}>
			<h3 class="h3 mb-4">What's Next?</h3>
			<ul class="space-y-3">
				<li class="flex items-start gap-3">
					<span class="text-xl">📧</span>
					<div>
						<p class="font-semibold">Check Your Email</p>
						<p class="text-sm opacity-75">
							We've sent a confirmation with all the details and calendar invite.
						</p>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="text-xl">🔔</span>
					<div>
						<p class="font-semibold">Get Reminder</p>
						<p class="text-sm opacity-75">You'll receive a reminder 24 hours before your appointment.</p>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="text-xl">📱</span>
					<div>
						<p class="font-semibold">Manage Booking</p>
						<p class="text-sm opacity-75">
							View or modify your booking in your dashboard.
						</p>
					</div>
				</li>
			</ul>
		</div>

		<!-- Actions -->
		<div class="flex flex-wrap gap-4 justify-center" in:fly={{ y: 20, duration: 500, delay: 500 }}>
			<a href="/dashboard" class="btn variant-filled-primary">Go to Dashboard</a>
			<a href="/book/{data.booking.organization.slug}" class="btn variant-ghost">Book Another</a>
			<a href="/" class="btn variant-ghost">Back to Home</a>
		</div>

		<!-- Contact Info -->
		<div class="text-center mt-8 text-sm text-surface-600 dark:text-surface-400">
			<p>
				Need to make changes? Contact {data.booking.organization.name} at
				<a href="mailto:{data.booking.organization.email}" class="text-primary-500 hover:underline">
					{data.booking.organization.email}
				</a>
			</p>
		</div>
	</div>
</div>
