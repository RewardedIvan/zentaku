<script lang="ts">
	import { MenuItem, CircularProgressIndeterminate } from "m3-svelte";
	import { getProfile, getMediaLists } from "$lib/anilist";
	import MediaList from "./MediaList.svelte";
</script>

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
