<script lang="ts">
	import { goto } from "$app/navigation";
	import type { Media } from "$lib/anilist";
	import Ripple from "$lib/ui/Ripple.svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";

	interface Props {
		media: Media;
	}

	const { media }: Props = $props();
</script>

<Tooltip class="entry">
	<Ripple onClick={() => goto(`/anime/${media.id}`)}>
		<img class="cover" src={media.coverImage.large} alt="cover" draggable={false} />
	</Ripple>

	{#snippet tooltip()}
		<span class="font-afacad-flux text-xl">
			{media.title.english || media.title.romaji}
		</span>
		<p class="font-afacad-flux text-md">
			{media.title.romaji}
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
