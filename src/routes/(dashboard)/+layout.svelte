<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { authStore } from '$lib/stores/auth';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: authStore.setProfile(data.profile);

	const navigation = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
		{ href: '/dashboard/calendar', label: 'Calendar', icon: '🗓️' },
		{ href: '/dashboard/services', label: 'Services', icon: '🛎️' },
		{ href: '/dashboard/staff', label: 'Staff', icon: '👥' },
		{ href: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
	];

	let mobileMenuOpen = false;

	async function handleLogout() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast.error('Error signing out');
		} else {
			toast.success('Signed out successfully');
			goto('/');
		}
	}

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<div class="flex h-screen bg-surface-50 dark:bg-surface-900">
	<!-- Sidebar -->
	<aside
		class="w-64 bg-white dark:bg-surface-800 border-r border-surface-300 dark:border-surface-700 hidden lg:flex flex-col"
	>
		<div class="p-6 border-b border-surface-300 dark:border-surface-700">
			<a href="/" class="flex items-center gap-2">
				<span class="text-2xl font-bold text-gradient">BookEase</span>
			</a>
			{#if data.profile?.organization}
				<p class="text-sm text-surface-600 dark:text-surface-400 mt-1">
					{data.profile.organization.name}
				</p>
			{/if}
		</div>

		<nav class="flex-1 p-4 overflow-y-auto">
			<ul class="space-y-1">
				{#each navigation as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {isActive(
								item.href
							)
								? 'bg-primary-500 text-white'
								: 'hover:bg-surface-100 dark:hover:bg-surface-700'}"
						>
							<span class="text-xl">{item.icon}</span>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="p-4 border-t border-surface-300 dark:border-surface-700">
			<div class="flex items-center gap-3 mb-3">
				<div
					class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold"
				>
					{data.profile?.full_name
						?.split(' ')
						.map((n) => n[0])
						.join('')
						.toUpperCase() || 'U'}
				</div>
				<div class="flex-1 min-w-0">
					<p class="font-semibold truncate">{data.profile?.full_name}</p>
					<p class="text-sm text-surface-600 dark:text-surface-400 truncate">
						{data.profile?.email}
					</p>
				</div>
			</div>
			<button class="btn variant-ghost w-full" on:click={handleLogout}> Sign Out </button>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Top Bar -->
		<header
			class="bg-white dark:bg-surface-800 border-b border-surface-300 dark:border-surface-700 px-6 py-4"
		>
			<div class="flex items-center justify-between">
				<button class="lg:hidden btn variant-ghost" on:click={() => (mobileMenuOpen = true)}>
					<span class="text-2xl">☰</span>
				</button>
				<div class="flex-1"></div>
				<div class="flex items-center gap-4">
					<span class="badge variant-filled-primary capitalize">{data.profile?.role}</span>
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto p-6">
			<slot />
		</main>
	</div>
</div>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div
		class="fixed inset-0 bg-black/50 z-50 lg:hidden"
		on:click={() => (mobileMenuOpen = false)}
		on:keydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
		role="button"
		tabindex="0"
	>
		<div
			class="w-64 h-full bg-white dark:bg-surface-800 p-4"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			tabindex="-1"
		>
			<button class="btn variant-ghost mb-4" on:click={() => (mobileMenuOpen = false)}>
				✕ Close
			</button>
			<nav>
				<ul class="space-y-1">
					{#each navigation as item}
						<li>
							<a
								href={item.href}
								class="flex items-center gap-3 px-4 py-3 rounded-lg {isActive(item.href)
									? 'bg-primary-500 text-white'
									: 'hover:bg-surface-100 dark:hover:bg-surface-700'}"
								on:click={() => (mobileMenuOpen = false)}
							>
								<span class="text-xl">{item.icon}</span>
								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
{/if}

<style>
	.text-gradient {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
