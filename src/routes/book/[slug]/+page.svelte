<script lang="ts">
	import { fade } from 'svelte/transition';
	import ServiceSelector from '$lib/components/booking/ServiceSelector.svelte';
	import StaffSelector from '$lib/components/booking/StaffSelector.svelte';
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import TimeSlotPicker from '$lib/components/booking/TimeSlotPicker.svelte';
	import BookingForm from '$lib/components/booking/BookingForm.svelte';
	import type { PageData } from './$types';
	import type { ServiceWithStaff } from '$lib/types/service';
	import type { StaffMemberWithUser } from '$lib/types/staff';

	export let data: PageData;

	let step = 1;
	let selectedService: ServiceWithStaff | null = null;
	let selectedStaff: StaffMemberWithUser | null = null;
	let selectedDate: Date | null = null;
	let selectedTime: string | null = null;

	function handleServiceSelect(service: ServiceWithStaff) {
		selectedService = service;
		step = 2;
	}

	function handleStaffSelect(staff: StaffMemberWithUser | null) {
		selectedStaff = staff;
		step = 3;
	}

	function handleDateSelect(date: Date) {
		selectedDate = date;
		step = 4;
	}

	function handleTimeSelect(time: string) {
		selectedTime = time;
		step = 5;
	}

	function goBack() {
		if (step > 1) {
			step--;
			if (step === 4) selectedTime = null;
			if (step === 3) selectedDate = null;
			if (step === 2) selectedStaff = null;
			if (step === 1) selectedService = null;
		}
	}

	const steps = [
		{ number: 1, label: 'Select Service' },
		{ number: 2, label: 'Choose Staff' },
		{ number: 3, label: 'Pick Date' },
		{ number: 4, label: 'Select Time' },
		{ number: 5, label: 'Confirm Details' }
	];
</script>

<svelte:head>
	<title>Book Appointment - {data.organization.name}</title>
	<meta name="description" content="Book an appointment with {data.organization.name}" />
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
	<!-- Header -->
	<header class="border-b border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="h2">{data.organization.name}</h1>
					{#if data.organization.description}
						<p class="text-surface-600 dark:text-surface-400">
							{data.organization.description}
						</p>
					{/if}
				</div>
				<a href="/" class="btn variant-ghost">← Home</a>
			</div>
		</div>
	</header>

	<!-- Progress Steps -->
	<div class="container mx-auto px-4 py-6">
		<div class="flex justify-center">
			<div class="flex items-center gap-2 overflow-x-auto">
				{#each steps as s, i}
					<div class="flex items-center">
						<div
							class="flex items-center gap-2 px-4 py-2 rounded-lg {step >= s.number
								? 'bg-primary-500 text-white'
								: 'bg-surface-200 dark:bg-surface-700'}"
						>
							<span class="font-bold">{s.number}</span>
							<span class="hidden md:inline">{s.label}</span>
						</div>
						{#if i < steps.length - 1}
							<div class="w-8 h-0.5 bg-surface-300 dark:bg-surface-600 mx-1"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 pb-12">
		<div class="max-w-4xl mx-auto">
			{#if step > 1}
				<button class="btn variant-ghost mb-4" on:click={goBack}>← Back</button>
			{/if}

			<div in:fade={{ duration: 300 }}>
				{#if step === 1}
					<ServiceSelector services={data.services} onSelect={handleServiceSelect} />
				{:else if step === 2}
					<StaffSelector
						staff={selectedService?.staff_services?.map((ss) => ss.staff) || []}
						onSelect={handleStaffSelect}
					/>
				{:else if step === 3}
					<Calendar onSelect={handleDateSelect} />
				{:else if step === 4 && selectedService && selectedStaff && selectedDate}
					<TimeSlotPicker
						service={selectedService}
						staff={selectedStaff}
						date={selectedDate}
						onSelect={handleTimeSelect}
					/>
				{:else if step === 5 && selectedService && selectedStaff && selectedDate && selectedTime}
					<BookingForm
						{selectedService}
						{selectedStaff}
						{selectedDate}
						{selectedTime}
						organization={data.organization}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>
