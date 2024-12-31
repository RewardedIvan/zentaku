<script lang="ts">
	import Menu from "$lib/ui/Menu.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import { MenuItem, CircularProgressIndeterminate } from "m3-svelte";
	import { getProfile } from "$lib/anilist";

	const { children } = $props();

	let profileMenuOpen = $state(false);
</script>

<div class="flex flex-col h-screen">
	<div class="flex flex-row items-center justify-between bg-surface-container-highest p-2">
		<div>
			<h1>otakuzen</h1>
		</div>
		<div class="flex flex-row items-center justify-center">
			{#await getProfile()}
				<CircularProgressIndeterminate />
			{:then profile}
				<Menu bind:open={profileMenuOpen}>
					<Ripple onClick={() => (profileMenuOpen = !profileMenuOpen)}>
						<img src={profile.avatar} alt="avatar" width={32} draggable={false} />
					</Ripple>

					{#snippet menu()}
						<MenuItem>Profile</MenuItem>
						<MenuItem>Settings</MenuItem>
						<MenuItem>Logout</MenuItem>
					{/snippet}
				</Menu>
			{/await}
		</div>
	</div>

	{@render children()}
</div>
