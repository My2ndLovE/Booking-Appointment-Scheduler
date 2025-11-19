<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { StaffMemberWithUser } from '$lib/types/staff';

	export let staff: StaffMemberWithUser[];
	export let onSelect: (staff: StaffMemberWithUser | null) => void;

	let selected: StaffMemberWithUser | null = null;

	function handleSelect(member: StaffMemberWithUser | null) {
		selected = member;
		onSelect(member);
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div>
	<h2 class="h2 mb-6">Choose Your Specialist</h2>

	<div class="grid md:grid-cols-3 gap-4">
		<!-- Any Available Option -->
		<button
			class="card p-6 text-center hover:variant-soft cursor-pointer transition-all {selected ===
			null
				? 'variant-filled-primary'
				: ''}"
			on:click={() => handleSelect(null)}
			in:fly={{ y: 20, duration: 300 }}
		>
			<div class="text-4xl mb-2">🎲</div>
			<h4 class="h4 mb-1">Any Available</h4>
			<p class="text-sm opacity-75">First available specialist</p>
		</button>

		<!-- Staff Members -->
		{#each staff as member, i (member.id)}
			<button
				class="card p-6 text-center hover:variant-soft cursor-pointer transition-all {selected?.id ===
				member.id
					? 'variant-filled-primary'
					: ''}"
				on:click={() => handleSelect(member)}
				in:fly={{ y: 20, duration: 300, delay: (i + 1) * 50 }}
			>
				{#if member.user.avatar_url}
					<img
						src={member.user.avatar_url}
						alt={member.user.full_name}
						class="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
					/>
				{:else}
					<div
						class="w-16 h-16 rounded-full mx-auto mb-3 bg-primary-500 text-white flex items-center justify-center text-xl font-bold"
					>
						{getInitials(member.user.full_name)}
					</div>
				{/if}
				<h4 class="h4 mb-1">{member.user.full_name}</h4>
				{#if member.title}
					<p class="text-sm opacity-75">{member.title}</p>
				{/if}
			</button>
		{/each}
	</div>
</div>
