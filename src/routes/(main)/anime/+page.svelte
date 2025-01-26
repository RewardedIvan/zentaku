<script lang="ts">
	import { Button, CircularProgressIndeterminate, Icon } from "m3-svelte";
	import { page } from "$app/state";
	import { followingWatched, getMedia, type Media } from "$lib/anilist";
	import { goto } from "$app/navigation";
	import MediaScroll from "$lib/ui/MediaScroll.svelte";

	import TVIcon from "@ktibow/iconset-material-symbols/monitor";
	import EditIcon from "@ktibow/iconset-material-symbols/edit";

	import Relations from "./Relations.svelte";
	import Characters from "./Characters.svelte";
	import FollowingWatched from "./FollowingWatched.svelte";
	import Info from "./Info.svelte";
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

				<p class="text-3xl font-afacad-flux">Info</p>
				<Info {media} class="w-full" />
			</div>
		</div>
		<div class="flex flex-col gap-2 overflow-hidden">
			<span class="text-4xl font-afacad-flux underline underline-offset-4 text-primary">
				{media.title.userPreferred}
			</span>

			<p class="text-md font-roboto">{@html media.description}</p>

			<p class="text-3xl font-afacad-flux">Relations</p>
			<Relations {media} />

			<p class="text-3xl font-afacad-flux">Characters</p>
			<Characters {media} />

			<p class="text-3xl font-afacad-flux">Following</p>
			{#await followingWatched(media.id)}
				<CircularProgressIndeterminate />
			{:then followingWatched}
				<FollowingWatched {media} {followingWatched} />
			{/await}

			<p class="text-3xl font-afacad-flux">Recommendations</p>
			<MediaScroll medias={media.recommendations.nodes.map(n => n.mediaRecommendation)} />
		</div>
	</div>
{/snippet}
