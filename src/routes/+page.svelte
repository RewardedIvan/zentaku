<script lang="ts">
	import Menu from "$lib/ui/Menu.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import {
		MenuItem,
		ListItemButton,
		Icon,
		LinearProgressIndeterminate,
		CircularProgressIndeterminate,
	} from "m3-svelte";
	import { getProfile, getMediaLists } from "$lib/anilist";
	import MediaList from "./MediaList.svelte";

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
	<div class="flex flex-grow flex-col">
		{#await getMediaLists("anime")}
			<CircularProgressIndeterminate />
		{:then mediaLists}
			{#if mediaLists}
				{#each mediaLists as list}
					<MediaList {list} />
				{/each}
			{:else}
				<span class="text-center">No lists</span>
			{/if}
		{/await}
	</div>
</div>
