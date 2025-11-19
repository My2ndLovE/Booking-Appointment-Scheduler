<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { ServiceWithStaff } from '$lib/types/service';
	import { formatTime } from '$lib/utils/date';

	export let services: ServiceWithStaff[];
	export let onSelect: (service: ServiceWithStaff) => void;

	let selected: ServiceWithStaff | null = null;

	function handleSelect(service: ServiceWithStaff) {
		selected = service;
		onSelect(service);
	}
</script>

<div>
	<h2 class="h2 mb-6">Select a Service</h2>

	{#if services.length === 0}
		<div class="card p-8 text-center">
			<p class="text-surface-600 dark:text-surface-400">No services available at this time.</p>
		</div>
	{:else}
		<div class="grid md:grid-cols-2 gap-4">
			{#each services as service, i (service.id)}
				<button
					class="card p-6 text-left hover:variant-soft cursor-pointer transition-all {selected?.id ===
					service.id
						? 'variant-filled-primary'
						: ''}"
					on:click={() => handleSelect(service)}
					in:fly={{ y: 20, duration: 300, delay: i * 50 }}
				>
					<div class="flex items-start gap-4">
						<div
							class="w-12 h-12 rounded-lg flex-shrink-0"
							style="background-color: {service.color}"
						/>
						<div class="flex-1 min-w-0">
							<h3 class="h3 mb-1">{service.name}</h3>
							{#if service.description}
								<p class="text-sm opacity-75 mb-3">{service.description}</p>
							{/if}
							<div class="flex flex-wrap items-center gap-3 text-sm">
								<span class="badge variant-soft">
									{service.duration_minutes} min
								</span>
								<span class="font-semibold">
									${service.price.toFixed(2)} {service.currency}
								</span>
								{#if service.staff_services && service.staff_services.length > 0}
									<span class="opacity-75">
										{service.staff_services.length} staff available
									</span>
								{/if}
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
