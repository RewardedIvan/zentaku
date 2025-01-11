<script lang="ts">
	import type { Media } from "$lib/anilist";
	import { slide } from "svelte/transition";
	import MediaComponent from "./Media.svelte";
	import { easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";

	interface Props {
		medias: Media[];
	}

	let { medias }: Props = $props();

	function transformScroll(event: WheelEvent & { currentTarget: HTMLElement }) {
		if (!event.deltaY) {
			return;
		}

		event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
		event.preventDefault();
	}
</script>

<div
	class="grid grid-flow-col justify-start overflow-x-auto overflow-y-hidden"
	onwheel={transformScroll}
	in:slide={{ duration: 400, easing: easeEmphasizedDecel, axis: "y" }}
	out:slide={{ duration: 400, easing: easeEmphasizedAccel, axis: "y" }}
>
	{#each medias as media}
		<MediaComponent {media} />
	{/each}
</div>
