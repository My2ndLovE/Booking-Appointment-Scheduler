<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { authStore } from '$lib/stores/auth';
	import { serviceSchema } from '$lib/utils/validation';

	let name = '';
	let description = '';
	let duration_minutes = 60;
	let price = 0;
	let currency = 'USD';
	let color = '#3B82F6';
	let buffer_time_minutes = 0;
	let max_advance_booking_days = 30;
	let loading = false;
	let errors: Record<string, string> = {};

	async function handleSubmit() {
		errors = {};
		loading = true;

		try {
			const data = serviceSchema.parse({
				name,
				description: description || undefined,
				duration_minutes,
				price,
				currency,
				color,
				buffer_time_minutes,
				max_advance_booking_days: max_advance_booking_days || undefined
			});

			const { error } = await supabase.from('services').insert({
				...data,
				organization_id: $authStore.profile?.organization_id
			});

			if (error) {
				toast.error('Failed to create service');
			} else {
				toast.success('Service created successfully');
				goto('/dashboard/services');
			}
		} catch (err: any) {
			if (err.errors) {
				err.errors.forEach((e: any) => {
					errors[e.path[0]] = e.message;
				});
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>New Service - BookEase</title>
</svelte:head>

<div>
	<div class="mb-8">
		<a href="/dashboard/services" class="btn variant-ghost mb-4">← Back to Services</a>
		<h1 class="h1">Create New Service</h1>
	</div>

	<div class="card p-8 max-w-2xl">
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<label class="label">
				<span>Service Name *</span>
				<input
					class="input"
					type="text"
					bind:value={name}
					placeholder="e.g., Swedish Massage"
					required
					disabled={loading}
				/>
				{#if errors.name}
					<span class="text-error-500 text-sm">{errors.name}</span>
				{/if}
			</label>

			<label class="label">
				<span>Description</span>
				<textarea
					class="textarea"
					bind:value={description}
					placeholder="Describe your service..."
					rows="3"
					disabled={loading}
				/>
				{#if errors.description}
					<span class="text-error-500 text-sm">{errors.description}</span>
				{/if}
			</label>

			<div class="grid md:grid-cols-2 gap-6">
				<label class="label">
					<span>Duration (minutes) *</span>
					<input
						class="input"
						type="number"
						bind:value={duration_minutes}
						min="15"
						step="15"
						required
						disabled={loading}
					/>
					{#if errors.duration_minutes}
						<span class="text-error-500 text-sm">{errors.duration_minutes}</span>
					{/if}
				</label>

				<label class="label">
					<span>Buffer Time (minutes)</span>
					<input
						class="input"
						type="number"
						bind:value={buffer_time_minutes}
						min="0"
						step="5"
						disabled={loading}
					/>
					{#if errors.buffer_time_minutes}
						<span class="text-error-500 text-sm">{errors.buffer_time_minutes}</span>
					{/if}
				</label>
			</div>

			<div class="grid md:grid-cols-2 gap-6">
				<label class="label">
					<span>Price *</span>
					<input
						class="input"
						type="number"
						bind:value={price}
						min="0"
						step="0.01"
						required
						disabled={loading}
					/>
					{#if errors.price}
						<span class="text-error-500 text-sm">{errors.price}</span>
					{/if}
				</label>

				<label class="label">
					<span>Currency</span>
					<select class="select" bind:value={currency} disabled={loading}>
						<option value="USD">USD</option>
						<option value="EUR">EUR</option>
						<option value="GBP">GBP</option>
					</select>
				</label>
			</div>

			<div class="grid md:grid-cols-2 gap-6">
				<label class="label">
					<span>Color</span>
					<input class="input" type="color" bind:value={color} disabled={loading} />
					{#if errors.color}
						<span class="text-error-500 text-sm">{errors.color}</span>
					{/if}
				</label>

				<label class="label">
					<span>Max Advance Booking (days)</span>
					<input
						class="input"
						type="number"
						bind:value={max_advance_booking_days}
						min="1"
						disabled={loading}
					/>
					{#if errors.max_advance_booking_days}
						<span class="text-error-500 text-sm">{errors.max_advance_booking_days}</span>
					{/if}
				</label>
			</div>

			<div class="flex gap-4">
				<button type="submit" class="btn variant-filled-primary" disabled={loading}>
					{loading ? 'Creating...' : 'Create Service'}
				</button>
				<a href="/dashboard/services" class="btn variant-ghost">Cancel</a>
			</div>
		</form>
	</div>
</div>
