<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	// Redirect if already authenticated
	$: if ($authStore.session) {
		goto('/dashboard');
	}
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-surface-100 dark:bg-surface-800">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="inline-block">
				<h1 class="h1 text-gradient">BookEase</h1>
			</a>
		</div>
		<slot />
	</div>
</div>

<style>
	.text-gradient {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
