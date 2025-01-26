<script lang="ts">
	import { goto } from "$app/navigation";
	import { type Media } from "$lib/anilist";
	import Ripple from "$lib/ui/Ripple.svelte";
	import Dropdown from "$lib/ui/Dropdown.svelte";

	interface Props {
		media: Media;
	}

	let { media }: Props = $props();

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

<div class="w-min">
	<Dropdown
		options={[
			...new Set(media.characters.edges.map(e => e.voiceActors.map(e => e.languageV2)).flat()),
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
				<Ripple class="flex flex-row gap-1" onClick={() => goto(`/staff/${character.node.id}`)}>
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
