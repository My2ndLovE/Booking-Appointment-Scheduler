<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getAvailableSlots } from '$lib/utils/availability';
	import { formatDate, formatTime } from '$lib/utils/date';
	import type { ServiceWithStaff } from '$lib/types/service';
	import type { StaffMemberWithUser } from '$lib/types/staff';

	export let service: ServiceWithStaff;
	export let staff: StaffMemberWithUser;
	export let date: Date;
	export let onSelect: (time: string) => void;

	let slots: string[] = [];
	let loading = true;
	let selected: string | null = null;
	let error: string | null = null;

	async function loadSlots() {
		loading = true;
		error = null;
		try {
			slots = await getAvailableSlots(staff.id, service.id, date);
			if (slots.length === 0) {
				error = 'No available time slots for this date';
			}
		} catch (err) {
			console.error('Error loading slots:', err);
			error = 'Failed to load available time slots';
		} finally {
			loading = false;
		}
	}

	function handleSelect(time: string) {
		selected = time;
		onSelect(time);
	}

	onMount(() => {
		loadSlots();
	});

	$: if (date || staff) {
		loadSlots();
	}
</script>

<div in:fly={{ y: 20, duration: 300 }}>
	<h2 class="h2 mb-2">Select a Time</h2>
	<p class="text-surface-600 dark:text-surface-400 mb-6">
		Available slots for {formatDate(date, 'EEEE, MMMM d, yyyy')}
	</p>

	<div class="card p-6">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-pulse text-center">
					<div class="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-4"></div>
					<p>Loading available times...</p>
				</div>
			</div>
		{:else if error}
			<div class="alert variant-filled-warning">
				<span>{error}</span>
			</div>
		{:else if slots.length === 0}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">📅</div>
				<p class="text-surface-600 dark:text-surface-400">
					No available time slots for this date. Please try another date.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-3 md:grid-cols-4 gap-3">
				{#each slots as time, i (time)}
					<button
						class="btn {selected === time ? 'variant-filled-primary' : 'variant-soft'}"
						on:click={() => handleSelect(time)}
						in:fly={{ y: 10, duration: 200, delay: i * 30 }}
					>
						{formatTime(time)}
					</button>
				{/each}
			</div>

			<div class="mt-6 p-4 bg-surface-100 dark:bg-surface-700 rounded-lg">
				<div class="flex items-start gap-3">
					<span class="text-xl">ℹ️</span>
					<div class="text-sm">
						<p class="font-semibold mb-1">Appointment Details:</p>
						<p class="opacity-75">Duration: {service.duration_minutes} minutes</p>
						{#if service.buffer_time_minutes > 0}
							<p class="opacity-75">
								Buffer time: {service.buffer_time_minutes} minutes between appointments
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
