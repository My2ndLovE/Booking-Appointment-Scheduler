<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { loginSchema } from '$lib/utils/validation';
	import type { z } from 'zod';

	let email = '';
	let password = '';
	let loading = false;
	let errors: Record<string, string> = {};

	async function handleLogin() {
		errors = {};
		loading = true;

		try {
			const data = loginSchema.parse({ email, password });

			const { error } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password
			});

			if (error) {
				toast.error(error.message);
			} else {
				toast.success('Welcome back!');
				goto('/dashboard');
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
	<title>Login - BookEase</title>
</svelte:head>

<div class="card p-8">
	<h2 class="h2 mb-6">Welcome Back</h2>

	<form on:submit|preventDefault={handleLogin}>
		<label class="label mb-4">
			<span>Email</span>
			<input
				class="input"
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				required
				disabled={loading}
			/>
			{#if errors.email}
				<span class="text-error-500 text-sm">{errors.email}</span>
			{/if}
		</label>

		<label class="label mb-6">
			<span>Password</span>
			<input
				class="input"
				type="password"
				bind:value={password}
				placeholder="••••••••"
				required
				disabled={loading}
			/>
			{#if errors.password}
				<span class="text-error-500 text-sm">{errors.password}</span>
			{/if}
		</label>

		<button type="submit" class="btn variant-filled-primary w-full mb-4" disabled={loading}>
			{loading ? 'Signing in...' : 'Sign In'}
		</button>

		<div class="text-center text-sm">
			<a href="/reset-password" class="text-primary-500 hover:underline">Forgot password?</a>
		</div>
	</form>

	<hr class="my-6" />

	<p class="text-center text-sm">
		Don't have an account?
		<a href="/signup" class="text-primary-500 hover:underline">Sign up</a>
	</p>
</div>
