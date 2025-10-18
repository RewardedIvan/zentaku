<script lang="ts">
	import { LinearProgressEstimate } from "m3-svelte";
	import { page } from "$app/state";
	import { get } from "svelte/store";
	import { Settings } from "$lib/stores/settings";
	import { setActivityH } from "$lib/utils/drpc";
	import { formatDate, getCharacter, type Character } from "$lib/anilist";

	import Favourite from "$lib/ui/Favourite.svelte";
	import Spoiler from "$lib/ui/Spoiler.svelte";
	import Markdown from "$lib/ui/Markdown.svelte";
	import MediaScroll from "$lib/ui/MediaScroll.svelte";

	let character = $state(getCharacter(parseInt(page.url.searchParams.get("id") ?? "")));

	$effect(() => {
		if (get(Settings).drpc.browsingActivity) {
			character.then(c => {
				setActivityH("Browsing AniList", `Looking at ${c?.name.userPreferred}`);
			});
		} else {
			setActivityH("Browsing AniList");
		}
	});
</script>

{#await character}
	<LinearProgressEstimate />
{:then character}
	{#if character}
		{@render main(character)}
	{/if}
{/await}

{#snippet main(character: Character)}
	<div class="flex flex-col gap-2 bg-surface-container p-2 overflow-hidden">
		<div class="flex flex-row gap-1">
			<img src={character.image.large} alt={character.name.userPreferred} class="rounded" />
			<div class="flex flex-col w-full">
				<div class="flex flex-row justify-between">
					<div class="flex flex-row items-end gap-1">
						<span class="font-afacad-flux text-4xl text-primary underline underline-offset-4"
							>{character.name.userPreferred}</span
						>
						<span class="font-afacad-flux text-lg text-secondary underline underline-offset-4"
							>{character.name.alternative.join(", ")}</span
						>

						{#each character.name.alternativeSpoiler as spoiler}
							<span class="font-afacad-flux text-lg text-secondary">,</span>

							<Spoiler tooltipPlacement="bottom">
								{#snippet content(shown: boolean)}
									<span
										class="font-afacad-flux text-lg text-secondary underline underline-offset-4"
										class:invisible={!shown}
									>
										{spoiler}
									</span>
								{/snippet}
							</Spoiler>
						{/each}
					</div>

					<Favourite
						id={{ characterId: parseInt(page.url.searchParams.get("id") ?? "") }}
						initial={character.isFavourite}
					/>
				</div>

				{#snippet stat(name: string, value: string)}
					<span>
						<b class="text-primary">{name}:</b> <span class="text-secondary">{value}</span>
					</span>
				{/snippet}

				{#if character.dateOfBirth && !(!character.dateOfBirth.day && !character.dateOfBirth.month && !character.dateOfBirth.year)}
					{@render stat("Birthday", formatDate(character.dateOfBirth))}
				{/if}
				{#if character.age}
					{@render stat("Age", character.age)}
				{/if}
				{#if character.gender}
					{@render stat("Gender", character.gender)}
				{/if}
				{#if character.bloodType}
					{@render stat("Blood Type", character.bloodType)}
				{/if}

				<Markdown md={character.description} />
			</div>
		</div>

		<p class="font-afacad-flux text-2xl">Featured in</p>

		<MediaScroll medias={character.media.edges.map(e => e.node)} />
	</div>
{/snippet}
