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
		isSameDay,
		isFuture,
		startOfDay
	} from '$lib/utils/date';

	export let onSelect: (date: Date) => void;
	export let selectedDate: Date | null = null;
	export let minDate: Date | null = null; // Allow configurable min date
	export let maxDate: Date | null = null; // Allow configurable max date

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

	/**
	 * Check if a date is selectable
	 * Date must be today or in the future, and within min/max bounds if set
	 */
	function isSelectableDate(date: Date): boolean {
		const dateStart = startOfDay(date);
		const todayStart = startOfDay(new Date());

		// Must be today or future
		if (dateStart < todayStart) {
			return false;
		}

		// Check min date if set
		if (minDate && dateStart < startOfDay(minDate)) {
			return false;
		}

		// Check max date if set
		if (maxDate && dateStart > startOfDay(maxDate)) {
			return false;
		}

		return true;
	}

	function handleDateClick(date: Date) {
		if (isSelectableDate(date)) {
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
				{@const selectable = isSelectableDate(day)}
				<button
					class="aspect-square p-2 rounded-lg text-center transition-all
						{!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}
						{!selectable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer'}
						{isToday(day) ? 'bg-primary-500/20 font-bold' : ''}
						{isSelected(day) ? 'variant-filled-primary' : ''}"
					on:click={() => handleDateClick(day)}
					disabled={!selectable}
					aria-label={format(day, 'PPP')}
					aria-selected={isSelected(day)}
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
