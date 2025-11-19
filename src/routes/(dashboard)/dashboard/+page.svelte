<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { formatDate, formatTime } from '$lib/utils/date';
	import { BOOKING_STATUS_COLORS } from '$lib/constants/statuses';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Dashboard - BookEase</title>
</svelte:head>

<div>
	<h1 class="h1 mb-8">Dashboard</h1>

	{#if !data.stats}
		<div class="card p-8 text-center">
			<p class="text-surface-600 dark:text-surface-400">
				Please set up your organization to view dashboard statistics.
			</p>
			<a href="/dashboard/settings" class="btn variant-filled-primary mt-4">
				Setup Organization
			</a>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" in:fade={{ duration: 300 }}>
			<div class="card p-6" in:fly={{ y: 20, duration: 400, delay: 0 }}>
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm opacity-75">Today's Bookings</span>
					<span class="text-2xl">📅</span>
				</div>
				<p class="text-3xl font-bold">{data.stats.todayBookings}</p>
			</div>

			<div class="card p-6" in:fly={{ y: 20, duration: 400, delay: 100 }}>
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm opacity-75">This Week</span>
					<span class="text-2xl">📊</span>
				</div>
				<p class="text-3xl font-bold">{data.stats.weekBookings}</p>
			</div>

			<div class="card p-6" in:fly={{ y: 20, duration: 400, delay: 200 }}>
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm opacity-75">This Month</span>
					<span class="text-2xl">📈</span>
				</div>
				<p class="text-3xl font-bold">{data.stats.monthBookings}</p>
			</div>

			<div class="card p-6" in:fly={{ y: 20, duration: 400, delay: 300 }}>
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm opacity-75">Revenue (Month)</span>
					<span class="text-2xl">💰</span>
				</div>
				<p class="text-3xl font-bold">${data.stats.monthRevenue.toFixed(2)}</p>
			</div>
		</div>

		<!-- Recent Bookings -->
		<div class="card" in:fly={{ y: 20, duration: 400, delay: 400 }}>
			<header class="card-header flex items-center justify-between">
				<h2 class="h2">Recent Bookings</h2>
				<a href="/dashboard/bookings" class="btn variant-ghost">View All →</a>
			</header>

			<div class="p-4">
				{#if data.recentBookings.length === 0}
					<p class="text-center py-8 text-surface-600 dark:text-surface-400">
						No bookings yet. They'll appear here once customers start booking.
					</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Customer</th>
									<th>Service</th>
									<th>Staff</th>
									<th>Date</th>
									<th>Time</th>
									<th>Status</th>
									<th>Price</th>
								</tr>
							</thead>
							<tbody>
								{#each data.recentBookings as booking}
									<tr>
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
										<td>{formatDate(new Date(booking.booking_date), 'MMM d, yyyy')}</td>
										<td>{formatTime(booking.start_time)}</td>
										<td>
											<span
												class="badge variant-filled-{BOOKING_STATUS_COLORS[booking.status]} capitalize"
											>
												{booking.status}
											</span>
										</td>
										<td class="font-semibold">${booking.price.toFixed(2)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid md:grid-cols-3 gap-6 mt-8" in:fly={{ y: 20, duration: 400, delay: 500 }}>
			<a href="/dashboard/services/new" class="card p-6 hover:variant-soft cursor-pointer">
				<div class="text-4xl mb-3">🛎️</div>
				<h3 class="h3 mb-2">Add Service</h3>
				<p class="text-sm opacity-75">Create a new service offering</p>
			</a>

			<a href="/dashboard/staff/new" class="card p-6 hover:variant-soft cursor-pointer">
				<div class="text-4xl mb-3">👤</div>
				<h3 class="h3 mb-2">Add Staff</h3>
				<p class="text-sm opacity-75">Invite a new team member</p>
			</a>

			<a href="/dashboard/calendar" class="card p-6 hover:variant-soft cursor-pointer">
				<div class="text-4xl mb-3">🗓️</div>
				<h3 class="h3 mb-2">View Calendar</h3>
				<p class="text-sm opacity-75">See your schedule</p>
			</a>
		</div>
	{/if}
</div>
