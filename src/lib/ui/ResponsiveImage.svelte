<script lang="ts">
	import { Icon } from "m3-svelte";
	import ErrorIcon from "@ktibow/iconset-material-symbols/warning-outline-rounded";
	import type { HTMLImgAttributes } from "svelte/elements";

	let loading = $state(false);
	let errored = $state(false);

	interface Props {
		loadedClass?: string;
		placeholderClass?: string;
	}

	let {
		onload,
		onerror,
		onloadstart,
		placeholderClass,
		class: className,
		...props
	}: Props & HTMLImgAttributes = $props();
</script>

<img
	class="self-center w-48 rounded-md {loading ? 'hidden' : ''}"
	onload={e => {
		loading = false;
		onload?.(e);
	}}
	onerror={e => {
		errored = true;
		onerror?.(e);
	}}
	onloadstart={e => {
		loading = true;
		onloadstart?.(e);
	}}
	{...props}
/>
{#if errored}
	<div
		class="bg-surface-container-high flex justify-center items-center {placeholderClass} {className}"
	>
		<Icon icon={ErrorIcon} size={24} />
	</div>
{:else if loading}
	<div class="bg-surface-container-high animate-pulse {placeholderClass} {className}"></div>
{/if}
