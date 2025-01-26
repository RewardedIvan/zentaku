<script lang="ts">
	import { goto } from "$app/navigation";
	import { listStatusToString, type Media } from "$lib/anilist";
	import type { FollowingWatchedPage } from "$lib/anilist";
	import { Divider, ListItemButton } from "m3-svelte";

	interface Props {
		media: Media;
		followingWatched?: FollowingWatchedPage;
	}

	let { media, followingWatched }: Props = $props();
</script>

<div class="flex flex-col">
	{#each followingWatched!.mediaList as following, i}
		<div class="flex flex-col bg-surface-container-high">
			<ListItemButton
				headline={following.user.name}
				on:click={() => goto(`/user?id=${following.user.id}`)}
			>
				{#snippet leading()}
					<img src={following.user.avatar.large} alt="avatar" class="object-cover w-8 h-8" />
				{/snippet}
				{#snippet trailing()}
					<span class="text-secondary">
						{listStatusToString(following.status)}
						{following.progress}/{media.episodes}
					</span>
				{/snippet}
			</ListItemButton>
		</div>

		{#if i != followingWatched!.mediaList.length - 1}
			<Divider />
		{/if}
	{/each}
</div>
