<script lang="ts">
	import { goto } from "$app/navigation";
	import { relationTypeToString, type Media } from "$lib/anilist";
	import Ripple from "$lib/ui/Ripple.svelte";

	interface Props {
		media: Media;
	}

	let { media }: Props = $props();
</script>

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
