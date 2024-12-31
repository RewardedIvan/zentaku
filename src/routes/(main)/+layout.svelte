<script lang="ts">
	import Menu from "$lib/ui/Menu.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import { MenuItem, CircularProgressIndeterminate, Button, Icon } from "m3-svelte";
	import { getProfile } from "$lib/anilist";
	import ArrowBackIcon from "@ktibow/iconset-material-symbols/arrow-back";
	import { page } from "$app/state";

	const { children } = $props();

	let profileMenuOpen = $state(false);

	function goBack() {
		window.history.back();
	}
</script>

<div class="flex flex-col h-screen">
	<div class="flex flex-row items-center justify-between bg-surface-container-highest p-2 h-[40px]">
		<div class="flex flex-row gap-2 items-center">
			{#if page.url.pathname !== "/"}
				<Button on:click={goBack} iconType="full" type="text"><Icon icon={ArrowBackIcon} /></Button>
			{/if}
			<span class="font-afacad-flux text-xl">otakuzen</span>
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
