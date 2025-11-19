<script lang="ts">
	import { supabase } from '$lib/supabase/client';
	import { toast } from '$lib/stores/toast';
	import { resetPasswordSchema } from '$lib/utils/validation';

	let email = '';
	let loading = false;
	let sent = false;
	let errors: Record<string, string> = {};

	async function handleReset() {
		errors = {};
		loading = true;

		try {
			const data = resetPasswordSchema.parse({ email });

			const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
				redirectTo: `${window.location.origin}/auth/callback`
			});

			if (error) {
				toast.error(error.message);
			} else {
				sent = true;
				toast.success('Password reset email sent!');
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
	<title>Reset Password - BookEase</title>
</svelte:head>

<div class="card p-8">
	<h2 class="h2 mb-6">Reset Password</h2>

	{#if sent}
		<div class="alert variant-filled-success mb-6">
			<span>Check your email for a password reset link!</span>
		</div>
		<a href="/login" class="btn variant-ghost w-full">Back to Login</a>
	{:else}
		<p class="text-surface-600 dark:text-surface-400 mb-6">
			Enter your email address and we'll send you a link to reset your password.
		</p>

		<form on:submit|preventDefault={handleReset}>
			<label class="label mb-6">
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

			<button type="submit" class="btn variant-filled-primary w-full mb-4" disabled={loading}>
				{loading ? 'Sending...' : 'Send Reset Link'}
			</button>
		</form>

		<hr class="my-6" />

		<p class="text-center text-sm">
			Remember your password?
			<a href="/login" class="text-primary-500 hover:underline">Sign in</a>
		</p>
	{/if}
</div>
