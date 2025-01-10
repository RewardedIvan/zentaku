<script lang="ts">
	import { toggleFavourite, type ToggleFavouriteVariables } from "$lib/anilist";
	import LikeButton from "./LikeButton.svelte";

    interface Props {
        id: ToggleFavouriteVariables;
        initial: boolean;
    }

    let { id, initial }: Props = $props();

    let faved = $state(initial);

    async function click() {
        await toggleFavourite(id);
    }
</script>

<LikeButton onClick={click} icon="heart" bind:value={faved} />
