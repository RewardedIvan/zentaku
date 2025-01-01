<script lang="ts">
	import { page } from "$app/state";
	import { getMedia, type Media } from "$lib/anilist";
	import Relative from "$lib/ui/Relative.svelte";
	import { goto } from "$app/navigation";
	import { Button, Card, CircularProgressIndeterminate, Icon } from "m3-svelte";

	import TVIcon from "@ktibow/iconset-material-symbols/monitor";
	import EditIcon from "@ktibow/iconset-material-symbols/edit";

	function statusToString(status: Media["status"]) {
		switch (status) {
			case "FINISHED":
				return "Finished";
			case "RELEASING":
				return "Releasing";
			case "NOT_YET_RELEASED":
				return "Not released yet";
			case "CANCELLED":
				return "Cancelled";
			case "HIATUS":
				return "Hiatus";
		}
	}
</script>

{#await getMedia(parseInt(page.params.id))}
	<CircularProgressIndeterminate />
{:then media}
	{#if media}
		{@render main(media)}
	{:else}
		<span>Not found</span>
	{/if}
{/await}

{#snippet main(media: Media)}
	<div class="flex flex-row gap-2 relative p-3 flex-grow">
		<img
			src={media.bannerImage}
			alt="banner"
			draggable={false}
			class="absolute z-[-1] left-0 top-0 h-full object-cover blur brightness-50"
		/>

		<div class="flex flex-col gap-2 items-start flex-grow w-full max-w-max">
			<img src={media.coverImage.large} alt="cover" class="max-w-max" />

			<div class="flex flex-col gap-2 w-full">
				<Button type="filled" iconType="left" on:click={() => goto(`/anime/${media.id}/watch`)}>
					<Icon icon={TVIcon} /> Watch
				</Button>
				<Button type="filled" iconType="left"><Icon icon={EditIcon} /> Edit</Button>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-xl font-afacad-flux underline underline-offset-4">
				{media.title.english || media.title.romaji}
				<span class="text-sm text-slate-400">{media.title.romaji}</span>
			</span>

			<p class="text-md font-roboto">{@html media.description}</p>

			<div class="flex flex-row gap-2 items-center">
				<Card type="filled">{statusToString(media.status)}</Card>
				{#if media.nextAiringEpisode}
					<Card type="filled">
						{media.episodes || "No"} episodes total, {media.nextAiringEpisode.episode - 1} released
					</Card>
					<Card type="filled"
						>Next episode airing in <Relative futureUnix={media.nextAiringEpisode.airingAt} /></Card
					>
				{:else}
					<Card type="filled">{media.episodes || "No"} episodes</Card>
				{/if}
			</div>

			<div class="flex flex-row gap-2 items-center">
				{#each media.genres as genre}
					<Card type="outlined">{genre}</Card>
				{/each}
			</div>
		</div>
	</div>
{/snippet}
