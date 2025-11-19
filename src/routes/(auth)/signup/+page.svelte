<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { signupSchema } from '$lib/utils/validation';

	let email = '';
	let password = '';
	let full_name = '';
	let phone = '';
	let loading = false;
	let errors: Record<string, string> = {};

	async function handleSignup() {
		errors = {};
		loading = true;

		try {
			const data = signupSchema.parse({ email, password, full_name, phone });

			// Create auth user
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
				options: {
					data: {
						full_name: data.full_name,
						phone: data.phone
					}
				}
			});

			if (authError) {
				toast.error(authError.message);
				loading = false;
				return;
			}

			if (authData.user) {
				// Create user profile
				const { error: profileError } = await supabase.from('users').insert({
					id: authData.user.id,
					email: data.email,
					full_name: data.full_name,
					phone: data.phone || null,
					role: 'customer'
				});

				if (profileError) {
					console.error('Profile creation error:', profileError);
				}

				toast.success('Account created successfully!');
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
	<title>Sign Up - BookEase</title>
</svelte:head>

<div class="card p-8">
	<h2 class="h2 mb-6">Create Account</h2>

	<form on:submit|preventDefault={handleSignup}>
		<label class="label mb-4">
			<span>Full Name</span>
			<input
				class="input"
				type="text"
				bind:value={full_name}
				placeholder="John Doe"
				required
				disabled={loading}
			/>
			{#if errors.full_name}
				<span class="text-error-500 text-sm">{errors.full_name}</span>
			{/if}
		</label>

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

		<label class="label mb-4">
			<span>Phone (Optional)</span>
			<input
				class="input"
				type="tel"
				bind:value={phone}
				placeholder="(555) 123-4567"
				disabled={loading}
			/>
			{#if errors.phone}
				<span class="text-error-500 text-sm">{errors.phone}</span>
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
			{loading ? 'Creating account...' : 'Create Account'}
		</button>
	</form>

	<hr class="my-6" />

	<p class="text-center text-sm">
		Already have an account?
		<a href="/login" class="text-primary-500 hover:underline">Sign in</a>
	</p>
</div>
