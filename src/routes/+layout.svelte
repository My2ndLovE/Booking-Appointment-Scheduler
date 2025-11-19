<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth';
	import Toast from '$lib/components/ui/Toast.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: authStore.setSession(data.session);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session?.expires_at !== data.session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
	<slot />
</div>

<Toast />
