<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { formatDate, formatTime } from '$lib/utils/date';
	import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from '$lib/constants/statuses';
	import type { PageData } from './$types';

	export let data: PageData;

	const statuses = Object.values(BOOKING_STATUS);
	const currentStatus = $page.url.searchParams.get('status');

	async function updateBookingStatus(bookingId: string, newStatus: string) {
		const { error } = await supabase
			.from('bookings')
			.update({ status: newStatus })
			.eq('id', bookingId);

		if (error) {
			toast.error('Failed to update booking status');
		} else {
			toast.success('Booking status updated');
			// Refresh page data
			goto($page.url.pathname + ($page.url.search || ''), { invalidateAll: true });
		}
	}

	function filterByStatus(status: string | null) {
		const url = new URL($page.url);
		if (status) {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Bookings - BookEase</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-8">
		<h1 class="h1">Bookings</h1>
	</div>

	<!-- Status Filters -->
	<div class="flex flex-wrap gap-2 mb-6">
		<button
			class="btn {!currentStatus ? 'variant-filled-primary' : 'variant-ghost'}"
			on:click={() => filterByStatus(null)}
		>
			All
		</button>
		{#each statuses as status}
			<button
				class="btn capitalize {currentStatus === status
					? 'variant-filled-primary'
					: 'variant-ghost'}"
				on:click={() => filterByStatus(status)}
			>
				{status.replace('_', ' ')}
			</button>
		{/each}
	</div>

	<!-- Bookings Table -->
	<div class="card">
		{#if data.bookings.length === 0}
			<div class="p-12 text-center">
				<p class="text-surface-600 dark:text-surface-400 mb-4">No bookings found</p>
				{#if currentStatus}
					<button class="btn variant-ghost" on:click={() => filterByStatus(null)}>
						Clear Filter
					</button>
				{/if}
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>ID</th>
							<th>Customer</th>
							<th>Service</th>
							<th>Staff</th>
							<th>Date & Time</th>
							<th>Status</th>
							<th>Payment</th>
							<th>Price</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.bookings as booking}
							<tr>
								<td class="font-mono text-sm">{booking.id.slice(0, 8)}</td>
								<td>
									<div>
										<p class="font-semibold">{booking.customer_name}</p>
										<p class="text-sm opacity-75">{booking.customer_email}</p>
									</div>
								</td>
								<td>
									<div class="flex items-center gap-2">
										<div
											class="w-3 h-3 rounded-full"
											style="background-color: {booking.service?.color || '#3B82F6'}"
										/>
										<span>{booking.service?.name || 'N/A'}</span>
									</div>
								</td>
								<td>{booking.staff?.user?.full_name || 'N/A'}</td>
								<td>
									<div>
										<p>{formatDate(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
										<p class="text-sm opacity-75">
											{formatTime(booking.start_time)} - {formatTime(booking.end_time)}
										</p>
									</div>
								</td>
								<td>
									<select
										class="select select-sm variant-filled-{BOOKING_STATUS_COLORS[
											booking.status
										]} capitalize"
										value={booking.status}
										on:change={(e) => updateBookingStatus(booking.id, e.currentTarget.value)}
									>
										{#each statuses as status}
											<option value={status} class="capitalize">
												{status.replace('_', ' ')}
											</option>
										{/each}
									</select>
								</td>
								<td>
									<span class="badge variant-soft capitalize">{booking.payment_status}</span>
								</td>
								<td class="font-semibold">${booking.price.toFixed(2)}</td>
								<td>
									<a href="/dashboard/bookings/{booking.id}" class="btn btn-sm variant-ghost">
										View
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
