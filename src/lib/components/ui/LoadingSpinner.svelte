<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let message: string | null = null;
	export let fullScreen = false;

	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};
</script>

{#if fullScreen}
	<div class="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50">
		<div class="text-center">
			<div class="inline-block {sizes[size]} animate-spin rounded-full border-4 border-surface-300 border-t-primary-600"></div>
			{#if message}
				<p class="mt-4 text-white font-medium">{message}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center p-4">
		<div class="text-center">
			<div class="inline-block {sizes[size]} animate-spin rounded-full border-4 border-surface-300 border-t-primary-600"></div>
			{#if message}
				<p class="mt-2 text-surface-600 dark:text-surface-400">{message}</p>
			{/if}
		</div>
	</div>
{/if}
