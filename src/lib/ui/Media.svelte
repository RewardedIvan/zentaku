<script lang="ts">
	import { goto } from "$app/navigation";
	import { statusToString, type Media } from "$lib/anilist";
	import Ripple from "$lib/ui/Ripple.svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import Relative from "./Relative.svelte";

	interface Props {
		media: Media;
	}

	const { media }: Props = $props();
</script>

<Tooltip class="entry">
	<Ripple onClick={() => goto(`/anime?id=${media.id}`)}>
		<img class="cover" src={media.coverImage.large} alt="cover" draggable={false} />
	</Ripple>

	{#snippet tooltip()}
		<span class="font-afacad-flux text-xl">
			{media.title.userPreferred}
		</span>
		<p class="font-afacad-flux text-md">
			{#if media.mediaListEntry}
				{statusToString(media.mediaListEntry.status)}
				{#if media.episodes}
					{media.mediaListEntry.progress}/{media.episodes}
				{/if}
				{#if media.chapters}
					{media.mediaListEntry.progress}/{media.chapters}
				{/if}
			{:else if media.episodes}
				{media.episodes} episodes
			{:else if media.chapters}
				{media.chapters} chapters
			{:else if media.volumes}
				{media.volumes} volumes
			{/if}

			{#if media.nextAiringEpisode}
				({media.nextAiringEpisode.episode - 1} released, next episode in
				<Relative futureUnix={media.nextAiringEpisode.airingAt} truncate={6} short />)
			{:else if !media.episodes && !media.chapters && !media.volumes}
				{#if media.mediaListEntry}
					<br />
				{/if}
				Not released yet
			{/if}
		</p>
		<div class="flex flex-row justify-center">
			<img src={media.coverImage.large} alt="cover" draggable={false} />
		</div>
	{/snippet}
</Tooltip>

<style lang="scss">
	// ripped off yuna.moe
	$entryHeight: 115px;
	$entryWidth: 325px;
	$triangleWidth: 80px;
	$gap: 8px;

	:global {
		.entry > button {
			width: $entryWidth;
			height: $entryHeight;
			clip-path: polygon(
				$triangleWidth 0,
				100% 0,
				calc(100% - #{$triangleWidth}) $entryHeight,
				0 $entryHeight
			);
		}

		.entry:not(:first-child) {
			margin-left: $gap - $triangleWidth;
		}
	}

	.cover {
		width: $entryWidth;
		position: absolute;
		left: calc(50% - #{$entryWidth} / 2);
		top: calc(-50% - #{$entryHeight} / 2);
	}
</style>
