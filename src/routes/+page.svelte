<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	const features = [
		{
			icon: '📅',
			title: 'Real-Time Calendar',
			description: 'Live booking updates across all devices with instant synchronization'
		},
		{
			icon: '⚡',
			title: 'Smart Scheduling',
			description: 'Automatic availability calculation with timezone support'
		},
		{
			icon: '💳',
			title: 'Payment Ready',
			description: 'Integrated Stripe payments for seamless transactions'
		},
		{
			icon: '📊',
			title: 'Analytics Dashboard',
			description: 'Track bookings, revenue, and business performance'
		},
		{
			icon: '🔒',
			title: 'Secure & Private',
			description: 'Enterprise-grade security with row-level access control'
		},
		{
			icon: '📱',
			title: 'Mobile Friendly',
			description: 'Perfect experience on any device, anywhere'
		}
	];

	const demos = [
		{ slug: 'serenity-spa', name: 'Serenity Spa & Wellness', type: 'Spa & Wellness' },
		{ slug: 'healthfirst-clinic', name: 'HealthFirst Medical Clinic', type: 'Healthcare' },
		{ slug: 'techconsult-pro', name: 'TechConsult Pro', type: 'IT Consulting' }
	];
</script>

<svelte:head>
	<title>BookEase - Modern Appointment Scheduling</title>
	<meta name="description" content="Professional appointment scheduling platform for modern businesses. Real-time updates, payment processing, and analytics." />
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<header class="border-b border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
		<nav class="container mx-auto px-4 py-4 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2">
				<span class="text-2xl font-bold text-gradient">BookEase</span>
			</a>
			<div class="flex items-center gap-4">
				<a href="/login" class="btn variant-ghost">Login</a>
				<a href="/signup" class="btn variant-filled-primary">Get Started</a>
			</div>
		</nav>
	</header>

	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-20 text-center" in:fade={{ duration: 600 }}>
		<h1 class="h1 mb-6">
			Modern Appointment Scheduling
			<br />
			<span class="text-gradient">Made Simple</span>
		</h1>
		<p class="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-2xl mx-auto">
			Professional booking platform with real-time updates, payment processing, and powerful
			analytics. Perfect for salons, clinics, and service businesses.
		</p>
		<div class="flex gap-4 justify-center mb-12">
			<a href="/signup" class="btn variant-filled-primary btn-lg">Start Free Trial</a>
			<a href="#demos" class="btn variant-ghost btn-lg">View Demos</a>
		</div>

		<!-- Demo badges -->
		<div class="flex gap-4 justify-center items-center text-sm text-surface-600 dark:text-surface-400">
			<div class="flex items-center gap-2">
				<span class="text-success-500">✓</span>
				<span>No credit card required</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-success-500">✓</span>
				<span>Free tier available</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-success-500">✓</span>
				<span>Setup in 5 minutes</span>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-surface-100 dark:bg-surface-800 py-20">
		<div class="container mx-auto px-4">
			<h2 class="h2 text-center mb-12">Everything You Need</h2>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each features as feature, i}
					<div
						class="card p-6 hover:variant-soft cursor-pointer transition-all"
						in:fly={{ y: 20, duration: 400, delay: i * 100 }}
					>
						<div class="text-4xl mb-4">{feature.icon}</div>
						<h3 class="h3 mb-2">{feature.title}</h3>
						<p class="text-surface-600 dark:text-surface-400">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Demo Section -->
	<section id="demos" class="container mx-auto px-4 py-20">
		<h2 class="h2 text-center mb-4">Try Live Demos</h2>
		<p class="text-center text-surface-600 dark:text-surface-400 mb-12 max-w-2xl mx-auto">
			Explore fully functional booking systems for different industries. See how BookEase adapts to
			your business needs.
		</p>
		<div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
			{#each demos as demo, i}
				<a
					href="/book/{demo.slug}"
					class="card p-6 hover:variant-soft cursor-pointer transition-all text-center"
					in:fly={{ y: 20, duration: 400, delay: i * 100 }}
				>
					<div class="badge variant-filled-primary mb-4">{demo.type}</div>
					<h3 class="h3 mb-2">{demo.name}</h3>
					<p class="text-surface-600 dark:text-surface-400 mb-4">Click to book an appointment</p>
					<span class="text-primary-500">Try Demo →</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-gradient-to-br from-primary-500 to-secondary-500 py-20">
		<div class="container mx-auto px-4 text-center text-white">
			<h2 class="h2 mb-4">Ready to Get Started?</h2>
			<p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
				Join hundreds of businesses using BookEase to manage their appointments efficiently.
			</p>
			<a href="/signup" class="btn variant-filled-surface btn-lg">Start Free Trial</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-surface-300 dark:border-surface-700 py-12">
		<div class="container mx-auto px-4 text-center text-surface-600 dark:text-surface-400">
			<p class="mb-4">
				Built with <span class="text-error-500">❤️</span> using SvelteKit, Supabase, and Azure
			</p>
			<p class="text-sm">© 2025 BookEase. A portfolio demonstration project.</p>
		</div>
	</footer>
</div>

<style>
	.text-gradient {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
