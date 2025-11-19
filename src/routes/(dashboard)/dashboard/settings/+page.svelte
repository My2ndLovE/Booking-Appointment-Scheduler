<script>
	import { authStore } from '$lib/stores/auth';
</script>

<svelte:head>
	<title>Settings - BookEase</title>
</svelte:head>

<div>
	<h1 class="h1 mb-8">Settings</h1>

	<div class="space-y-6">
		<!-- Organization Info -->
		<div class="card p-6">
			<h2 class="h2 mb-4">Organization Information</h2>
			{#if $authStore.profile?.organization}
				<div class="space-y-3">
					<div>
						<p class="text-sm opacity-75">Name</p>
						<p class="font-semibold">{$authStore.profile.organization.name}</p>
					</div>
					<div>
						<p class="text-sm opacity-75">Slug</p>
						<p class="font-mono">{$authStore.profile.organization.slug}</p>
					</div>
					<div>
						<p class="text-sm opacity-75">Email</p>
						<p>{$authStore.profile.organization.email}</p>
					</div>
					<div>
						<p class="text-sm opacity-75">Timezone</p>
						<p>{$authStore.profile.organization.timezone}</p>
					</div>
				</div>
			{:else}
				<p class="text-surface-600 dark:text-surface-400">No organization assigned</p>
			{/if}
		</div>

		<!-- User Profile -->
		<div class="card p-6">
			<h2 class="h2 mb-4">Your Profile</h2>
			<div class="space-y-3">
				<div>
					<p class="text-sm opacity-75">Name</p>
					<p class="font-semibold">{$authStore.profile?.full_name}</p>
				</div>
				<div>
					<p class="text-sm opacity-75">Email</p>
					<p>{$authStore.profile?.email}</p>
				</div>
				<div>
					<p class="text-sm opacity-75">Role</p>
					<p class="capitalize">{$authStore.profile?.role}</p>
				</div>
			</div>
		</div>

		<!-- Public Booking Link -->
		{#if $authStore.profile?.organization}
			<div class="card p-6">
				<h2 class="h2 mb-4">Public Booking Page</h2>
				<p class="text-sm text-surface-600 dark:text-surface-400 mb-3">
					Share this link with your customers:
				</p>
				<div class="flex gap-2">
					<input
						class="input flex-1"
						type="text"
						readonly
						value="{window.location.origin}/book/{$authStore.profile.organization.slug}"
					/>
					<button
						class="btn variant-filled-primary"
						on:click={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}/book/${$authStore.profile.organization.slug}`
							);
							alert('Link copied!');
						}}
					>
						Copy
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
