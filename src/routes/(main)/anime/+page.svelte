<script lang="ts">
	import {
		Button,
		Card,
		CircularProgressIndeterminate,
		Divider,
		Icon,
		ListItemButton,
	} from "m3-svelte";
	import { page } from "$app/state";
	import {
		followingWatched,
		getMedia,
		listStatusToString,
		mediaStatusToString,
		relationTypeToString,
		type Media,
	} from "$lib/anilist";
	import { goto } from "$app/navigation";
	import Relative from "$lib/ui/Relative.svelte";
	import Dropdown from "$lib/ui/Dropdown.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import MediaScroll from "$lib/ui/MediaScroll.svelte";

	import TVIcon from "@ktibow/iconset-material-symbols/monitor";
	import EditIcon from "@ktibow/iconset-material-symbols/edit";

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
			<span class="text-4xl font-afacad-flux underline underline-offset-4 text-primary">
				{media.title.userPreferred}
			</span>

			<p class="text-md font-roboto">{@html media.description}</p>

			<p class="text-3xl font-afacad-flux">Anime Status</p>

			<div class="flex flex-row gap-2 items-center">
				<Card type="filled">{mediaStatusToString(media.status)}</Card>
				{#if media.nextAiringEpisode}
					<Card type="filled">
						{media.episodes || "No"} episodes total, {media.nextAiringEpisode.episode - 1} released
					</Card>
					<Card type="filled">
						Next episode airing in <Relative futureUnix={media.nextAiringEpisode.airingAt} />
					</Card>
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

			<p class="text-3xl font-afacad-flux">Relations</p>

			<div class="flex flex-row gap-2 items-center">
				{#each media.relations.edges as relation}
					<Ripple
						class="flex flex-row gap-1 flex-grow bg-surface-container max-w-[25rem] h-32 rounded-md"
						onClick={() => goto(`/anime?id=${relation.node.id}`)}
					>
						<img
							src={relation.node.coverImage.large}
							alt="avatar"
							class="w-24 rounded-md object-cover h-full"
						/>
						<div class="flex flex-col h-full p-1 justify-between flex-grow">
							<p class="text-primary">{relation.node.title.userPreferred}</p>
							<p class="text-secondary">{relationTypeToString(relation.relationType)}</p>
						</div>
					</Ripple>
				{/each}
			</div>

			<p class="text-3xl font-afacad-flux">Characters</p>

			<div class="w-min">
				<Dropdown
					options={[
						...new Set(
							media.characters.edges.map(e => e.voiceActors.map(e => e.languageV2)).flat(),
						),
					]}
					name="voice actor language"
					bind:value={voiceActorLanguage}
				/>
			</div>
			<div class="flex flex-row gap-2 flex-wrap">
				{#each media.characters.edges.sort((a, b) => Number(b.role == "MAIN") - 1) as character}
					{@const voiceActor = character.voiceActors.find(e => e.languageV2 == voiceActorLanguage)}

					<div class="flex flex-row bg-surface-container rounded-md w-[25rem]">
						<Ripple
							class="flex flex-row gap-1 flex-grow"
							onClick={() => goto(`/character?id=${character.node.id}`)}
						>
							<img
								src={character.node.image.medium}
								alt="avatar"
								class="w-24 rounded-md object-cover h-full"
							/>
							<div class="flex flex-col h-full p-1 justify-between">
								<p class="text-primary">{character.node.name.full}</p>
								<p>{characterRoleToString(character.role)}</p>
							</div>
						</Ripple>

						{#if voiceActor}
							<Ripple
								class="flex flex-row gap-1"
								onClick={() => goto(`/staff/${character.node.id}`)}
							>
								<div class="flex flex-col ml-auto p-1 justify-between h-full">
									<p class="text-secondary">{voiceActor.name.userPreferred}</p>
									<p>{voiceActor.languageV2}</p>
								</div>
								<img
									src={voiceActor.image.medium}
									alt="avatar"
									class="w-24 rounded-md object-cover h-full"
								/>
							</Ripple>
						{/if}
					</div>
				{/each}
			</div>

			<p class="text-3xl font-afacad-flux">Following</p>

			{#await followingWatched(media.id)}
				<CircularProgressIndeterminate />
			{:then followingWatched}
				<div class="flex flex-col">
					{#each followingWatched!.mediaList as following, i}
						<div class="flex flex-col bg-surface-container-high">
							<ListItemButton
								headline={following.user.name}
								on:click={() => goto(`/user?id=${following.user.id}`)}
							>
								{#snippet leading()}
									<img
										src={following.user.avatar.large}
										alt="avatar"
										class="object-cover w-8 h-8"
									/>
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
			{/await}

			<p class="text-3xl font-afacad-flux">Recommendations</p>

			<MediaScroll medias={media.recommendations.nodes.map(n => n.mediaRecommendation)} />
		</div>
	</div>
{/snippet}
