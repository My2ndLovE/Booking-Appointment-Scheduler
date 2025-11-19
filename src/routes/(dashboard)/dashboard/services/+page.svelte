<script lang="ts">
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	async function toggleActive(id: string, currentStatus: boolean) {
		const { error } = await supabase
			.from('services')
			.update({ is_active: !currentStatus })
			.eq('id', id);

		if (error) {
			toast.error('Failed to update service');
		} else {
			toast.success('Service updated');
			invalidateAll();
		}
	}

	async function deleteService(id: string, name: string) {
		if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

		const { error } = await supabase.from('services').delete().eq('id', id);

		if (error) {
			toast.error('Failed to delete service');
		} else {
			toast.success('Service deleted');
			invalidateAll();
		}
	}
</script>

<svelte:head>
	<title>Services - BookEase</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-8">
		<h1 class="h1">Services</h1>
		<a href="/dashboard/services/new" class="btn variant-filled-primary">+ Add Service</a>
	</div>

	<div class="card">
		{#if data.services.length === 0}
			<div class="p-12 text-center">
				<div class="text-6xl mb-4">🛎️</div>
				<h2 class="h2 mb-2">No Services Yet</h2>
				<p class="text-surface-600 dark:text-surface-400 mb-6">
					Create your first service to start accepting bookings
				</p>
				<a href="/dashboard/services/new" class="btn variant-filled-primary">Create Service</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Service</th>
							<th>Duration</th>
							<th>Price</th>
							<th>Buffer Time</th>
							<th>Status</th>
							<th>Staff Count</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.services as service}
							<tr>
								<td>
									<div class="flex items-center gap-3">
										<div
											class="w-12 h-12 rounded-lg flex-shrink-0"
											style="background-color: {service.color}"
										/>
										<div>
											<p class="font-semibold">{service.name}</p>
											{#if service.description}
												<p class="text-sm opacity-75 line-clamp-1">{service.description}</p>
											{/if}
										</div>
									</div>
								</td>
								<td>{service.duration_minutes} min</td>
								<td class="font-semibold">${service.price.toFixed(2)}</td>
								<td>{service.buffer_time_minutes} min</td>
								<td>
									<button
										class="badge {service.is_active
											? 'variant-filled-success'
											: 'variant-filled-surface'} cursor-pointer"
										on:click={() => toggleActive(service.id, service.is_active)}
									>
										{service.is_active ? 'Active' : 'Inactive'}
									</button>
								</td>
								<td>{service.staff_services?.[0]?.count || 0}</td>
								<td>
									<div class="flex gap-2">
										<a
											href="/dashboard/services/{service.id}/edit"
											class="btn btn-sm variant-ghost"
										>
											Edit
										</a>
										<button
											class="btn btn-sm variant-ghost text-error-500"
											on:click={() => deleteService(service.id, service.name)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
