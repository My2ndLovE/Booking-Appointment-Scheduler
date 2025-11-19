<script lang="ts">
	import { getErrorMessage, type AppError, isAppError } from '$lib/types/errors';

	export let error: unknown;
	export let title = 'An Error Occurred';
	export let onRetry: (() => void) | null = null;
	export let showDetails = false;

	$: errorMessage = getErrorMessage(error);
	$: errorDetails = isAppError(error) ? error.details : null;
	$: errorCode = isAppError(error) ? error.code : null;
</script>

<div class="card p-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
	<div class="flex items-start gap-3">
		<div class="text-error-500 text-2xl">⚠️</div>
		<div class="flex-1">
			<h3 class="h4 text-error-700 dark:text-error-300 mb-2">{title}</h3>
			<p class="text-error-600 dark:text-error-400">{errorMessage}</p>

			{#if showDetails && errorCode}
				<div class="mt-3 text-sm">
					<p class="text-surface-600 dark:text-surface-400">
						Error Code: <code class="bg-surface-200 dark:bg-surface-800 px-2 py-1 rounded"
							>{errorCode}</code
						>
					</p>
				</div>
			{/if}

			{#if showDetails && errorDetails}
				<details class="mt-3">
					<summary class="text-sm text-surface-600 dark:text-surface-400 cursor-pointer"
						>Technical Details</summary
					>
					<pre class="mt-2 text-xs bg-surface-900 text-surface-100 p-3 rounded overflow-auto">{JSON.stringify(
							errorDetails,
							null,
							2
						)}</pre>
				</details>
			{/if}

			{#if onRetry}
				<button class="btn variant-filled-primary mt-4" on:click={onRetry}> Try Again </button>
			{/if}
		</div>
	</div>
</div>
