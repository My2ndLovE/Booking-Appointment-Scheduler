<script lang="ts">
	import { fly } from 'svelte/transition';
	import {
		format,
		startOfMonth,
		endOfMonth,
		eachDayOfInterval,
		addMonths,
		subMonths,
		startOfWeek,
		endOfWeek,
		isSameMonth,
		isToday,
		isPast,
		isSameDay
	} from '$lib/utils/date';

	export let onSelect: (date: Date) => void;
	export let selectedDate: Date | null = null;

	let currentMonth = new Date();

	$: monthStart = startOfMonth(currentMonth);
	$: monthEnd = endOfMonth(currentMonth);
	$: calendarStart = startOfWeek(monthStart);
	$: calendarEnd = endOfWeek(monthEnd);
	$: days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

	function nextMonth() {
		currentMonth = addMonths(currentMonth, 1);
	}

	function prevMonth() {
		currentMonth = subMonths(currentMonth, 1);
	}

	function handleDateClick(date: Date) {
		if (!isPast(date) || isToday(date)) {
			selectedDate = date;
			onSelect(date);
		}
	}

	function isSelected(date: Date): boolean {
		return selectedDate ? isSameDay(date, selectedDate) : false;
	}

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div in:fly={{ y: 20, duration: 300 }}>
	<h2 class="h2 mb-6">Choose a Date</h2>

	<div class="card p-6 max-w-lg mx-auto">
		<!-- Month Navigation -->
		<div class="flex items-center justify-between mb-6">
			<button class="btn variant-ghost btn-icon" on:click={prevMonth}>
				<span class="text-xl">←</span>
			</button>
			<h3 class="h3">{format(currentMonth, 'MMMM yyyy')}</h3>
			<button class="btn variant-ghost btn-icon" on:click={nextMonth}>
				<span class="text-xl">→</span>
			</button>
		</div>

		<!-- Calendar Grid -->
		<div class="grid grid-cols-7 gap-2">
			<!-- Week day headers -->
			{#each weekDays as day}
				<div class="text-center font-semibold text-sm p-2">{day}</div>
			{/each}

			<!-- Days -->
			{#each days as day (day.toISOString())}
				<button
					class="aspect-square p-2 rounded-lg text-center transition-all
						{!isSameMonth(day, currentMonth)
						? 'opacity-30'
						: ''}
						{isPast(day) && !isToday(day)
						? 'opacity-50 cursor-not-allowed'
						: 'hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer'}
						{isToday(day) ? 'bg-primary-500/20 font-bold' : ''}
						{isSelected(day) ? 'variant-filled-primary' : ''}"
					on:click={() => handleDateClick(day)}
					disabled={isPast(day) && !isToday(day)}
				>
					{format(day, 'd')}
				</button>
			{/each}
		</div>

		<div class="mt-4 text-sm text-surface-600 dark:text-surface-400 text-center">
			<p>Select a date to view available time slots</p>
		</div>
	</div>
</div>
