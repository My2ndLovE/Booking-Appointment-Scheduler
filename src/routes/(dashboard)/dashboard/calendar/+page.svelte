<script lang="ts">
	import { onMount } from 'svelte';
	import {
		format,
		startOfWeek,
		endOfWeek,
		eachDayOfInterval,
		addWeeks,
		subWeeks,
		isToday
	} from '$lib/utils/date';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth';
	import { formatTime } from '$lib/utils/date';
	import type { BookingWithRelations } from '$lib/types/booking';

	let currentWeek = new Date();
	let bookings: BookingWithRelations[] = [];
	let loading = true;

	$: weekStart = startOfWeek(currentWeek);
	$: weekEnd = endOfWeek(currentWeek);
	$: days = eachDayOfInterval({ start: weekStart, end: weekEnd });

	async function loadBookings() {
		if (!$authStore.profile?.organization_id) return;

		loading = true;
		const { data } = await supabase
			.from('bookings')
			.select(
				`
				*,
				service:services(name, color),
				staff:staff_members(user:users(full_name)),
				customer:users!bookings_customer_id_fkey(full_name)
			`
			)
			.eq('organization_id', $authStore.profile.organization_id)
			.gte('booking_date', format(weekStart, 'yyyy-MM-dd'))
			.lte('booking_date', format(weekEnd, 'yyyy-MM-dd'))
			.order('start_time');

		bookings = data || [];
		loading = false;
	}

	function getBookingsForDay(date: Date): BookingWithRelations[] {
		const dateStr = format(date, 'yyyy-MM-dd');
		return bookings.filter((b) => b.booking_date === dateStr);
	}

	function nextWeek() {
		currentWeek = addWeeks(currentWeek, 1);
		loadBookings();
	}

	function prevWeek() {
		currentWeek = subWeeks(currentWeek, 1);
		loadBookings();
	}

	function goToToday() {
		currentWeek = new Date();
		loadBookings();
	}

	onMount(() => {
		loadBookings();
	});
</script>

<svelte:head>
	<title>Calendar - BookEase</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-8">
		<h1 class="h1">Calendar</h1>
		<div class="flex gap-2">
			<button class="btn variant-ghost" on:click={prevWeek}>← Previous</button>
			<button class="btn variant-filled-primary" on:click={goToToday}>Today</button>
			<button class="btn variant-ghost" on:click={nextWeek}>Next →</button>
		</div>
	</div>

	{#if loading}
		<div class="card p-12 text-center">
			<p>Loading calendar...</p>
		</div>
	{:else}
		<div class="card p-6">
			<div class="grid grid-cols-7 gap-4">
				{#each days as day}
					<div class="min-h-[200px]">
						<div
							class="text-center mb-3 p-2 rounded-lg {isToday(day)
								? 'bg-primary-500 text-white'
								: ''}"
						>
							<p class="text-sm font-semibold">{format(day, 'EEE')}</p>
							<p class="text-2xl font-bold">{format(day, 'd')}</p>
						</div>

						<div class="space-y-2">
							{#each getBookingsForDay(day) as booking}
								<div
									class="p-2 rounded text-sm"
									style="background-color: {booking.service?.color || '#3B82F6'}20; border-left: 3px solid {booking.service?.color || '#3B82F6'}"
								>
									<p class="font-semibold text-xs">{formatTime(booking.start_time)}</p>
									<p class="truncate">{booking.customer?.full_name || booking.customer_name}</p>
									<p class="text-xs opacity-75 truncate">{booking.service?.name}</p>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
