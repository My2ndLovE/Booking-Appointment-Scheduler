<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';

	function getVariant(type: string) {
		switch (type) {
			case 'success':
				return 'variant-filled-success';
			case 'error':
				return 'variant-filled-error';
			case 'warning':
				return 'variant-filled-warning';
			case 'info':
				return 'variant-filled-primary';
			default:
				return 'variant-filled-surface';
		}
	}

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'warning':
				return '⚠';
			case 'info':
				return 'ℹ';
			default:
				return '';
		}
	}
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
	{#each $toast as item (item.id)}
		<div
			class="alert {getVariant(item.type)} shadow-lg"
			in:fly={{ x: 100, duration: 300 }}
			out:fly={{ x: 100, duration: 200 }}
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">{getIcon(item.type)}</span>
				<span>{item.message}</span>
			</div>
			<button class="btn-icon btn-icon-sm" on:click={() => toast.remove(item.id)}>✕</button>
		</div>
	{/each}
</div>
