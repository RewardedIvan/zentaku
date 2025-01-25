<script lang="ts">
	import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";
	import { slide } from "svelte/transition";
	import { type ChangeProgress, type MediaListStatus, statusToString } from "$lib/anilist";
	import { Settings } from "$lib/stores/Settings";

	interface Props {
		showSnack: boolean;
		snackError: string | null;
		snackProgress: Promise<ChangeProgress> | null;
	}

	let { showSnack = $bindable(), snackError, snackProgress }: Props = $props();

	$effect(() => {
		if (showSnack) {
			let timeout = setTimeout(() => {
				showSnack = false;
			}, $Settings.playerSettings.snackTimeout);

			return () => clearTimeout(timeout);
		}
	});
</script>

{#if showSnack}
	<div
		class="absolute right-0 bottom-0 justify-between flex flex-col p-2 gap-2 bg-inverse-surface text-inverse-on-surface m-2 rounded shadow shadow-surface"
		in:slide={{ duration: 300, easing: easeEmphasizedDecel }}
		out:slide={{ duration: 300, easing: easeEmphasizedAccel }}
	>
		{#if snackError}
			<span>Error: {snackError}</span>
		{/if}
		{#if snackProgress}
			{#await snackProgress}
				<span>Updating AniList...</span>
			{:then progress}
				<div class="flex flex-row gap-2 w-full">
					<img
						src={progress.media.coverImage.large}
						alt="cover"
						draggable={false}
						class="w-24 object-contain rounded"
					/>

					<div class="flex flex-col flex-grow justify-start">
						<span class="font-afacad-flux text-2xl">{progress.media.title.userPreferred}</span>
						<span class="text-md">
							{statusToString(progress.status)} episode
							{progress.progress}/{progress.media.episodes}
						</span>
						<span class="text-md">Repeats: {progress.repeat}</span>

						<span class="mt-auto text-end text-inverse-primary">Updated AniList</span>
					</div>
				</div>
			{/await}
		{/if}
	</div>
{/if}
