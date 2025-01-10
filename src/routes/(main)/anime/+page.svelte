<script lang="ts">
	import { page } from "$app/state";
	import { getMedia, type Media } from "$lib/anilist";
	import Relative from "$lib/ui/Relative.svelte";
	import Dropdown from "$lib/ui/Dropdown.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import { goto } from "$app/navigation";
	import MediaC from "../Media.svelte";
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

	function characterRoleToString(role: string) {
		switch (role) {
			case "MAIN":
				return "Main";
			case "SUPPORTING":
				return "Supporting";
			case "BACKGROUND":
				return "Background";
		}
	}

	let voiceActorLanguage = $state("Japanese");
	const voiceActorLanguages = ["Japanese", "English", "Korean", "Italian", "Spanish", "Portuguese", "French", "German", "Hebrew", "Hungarian", "Chinese", "Arabic", "Filipino", "Catalan", "Finnish", "Turkish", "Dutch", "Swedish", "Thai", "Tagalog", "Malaysian", "Indonesian", "Vietnamese", "Nepali", "Hindi", "Urdu"];
</script>

{#await getMedia(parseInt(page.url.searchParams.get("id") ?? ""))}
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
		<div
			style:background-image="url({media.bannerImage})"
			class="absolute z-[-1] left-0 top-0 size-full bg-cover blur brightness-50 animate-sway"
		></div>

		<div class="flex flex-col gap-2 items-start flex-grow w-full max-w-max">
			<img src={media.coverImage.large} alt="cover" class="max-w-max rounded" />

			<div class="flex flex-col gap-2 w-full">
				<Button type="filled" iconType="left" on:click={() => goto(`/anime/watch?id=${media.id}`)}>
					<Icon icon={TVIcon} /> Watch
				</Button>
				<Button type="filled" iconType="left"><Icon icon={EditIcon} /> Edit</Button>
			</div>
		</div>
		<div class="flex flex-col gap-2 overflow-hidden">
			<span class="text-xl font-afacad-flux underline underline-offset-4">
				{media.title.english || media.title.romaji}
				<span class="text-sm text-slate-400">{media.title.romaji}</span>
			</span>

			<p class="text-md font-roboto">{@html media.description}</p>

			<p class="text-3xl font-afacad-flux">Anime Status</p>

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

			<p class="text-3xl font-afacad-flux">Genres</p>

			<div class="flex flex-row gap-2 items-center">
				{#each media.genres as genre}
					<Card type="outlined">{genre}</Card>
				{/each}
			</div>

			<p class="text-3xl font-afacad-flux">Characters</p>

			<div class="w-min">
				<Dropdown
					options={voiceActorLanguages}
					name="voice actor language"
					bind:value={voiceActorLanguage}
				/>
			</div>
			<div class="flex flex-row gap-2 flex-wrap">
				{#each media.characters.edges.sort((a, b) => Number(b.role == "MAIN") - 1) as character}
					{@const voiceActor = character.voiceActors.find(e => e.languageV2 == voiceActorLanguage)}

					<div class="flex flex-row bg-surface-container rounded-md w-[25rem]">
						<Ripple class="flex flex-row gap-1 flex-grow" onClick={() => goto(`/character?id=${character.node.id}`)}>
							<img src={character.node.image.medium} alt="avatar" class="w-24 rounded-md object-cover h-full" />
							<div class="flex flex-col h-full p-1 justify-between">
								<p class="text-primary">{character.node.name.full}</p>
								<p>{characterRoleToString(character.role)}</p>
							</div>
						</Ripple>

						{#if voiceActor}
							<Ripple class="flex flex-row gap-1" onClick={() => goto(`/staff/${character.node.id}`)}>
								<div class="flex flex-col ml-auto p-1 justify-between h-full">
									<p class="text-secondary">{voiceActor.name.userPreferred}</p>
									<p>{voiceActor.languageV2}</p>
								</div>
								<img src={voiceActor.image.medium} alt="avatar" class="w-24 rounded-md object-cover h-full" />
							</Ripple>
						{/if}
					</div>
				{/each}
			</div>

			<p class="text-3xl font-afacad-flux">Recommendations</p>

			<div class="grid grid-flow-col justify-start overflow-x-auto overflow-y-hidden">
				{#each media.recommendations.nodes as r}
					<MediaC media={r.mediaRecommendation} />
				{/each}
			</div>
		</div>
	</div>
{/snippet}
