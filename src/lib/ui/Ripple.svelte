<script lang="ts">
	import { Layer } from "m3-svelte";
	import type { Snippet } from "svelte";

	interface Props {
		onClick: () => void;
		children: Snippet<[]>;
		class?: string;
		[key: string]: any;
	}

	const { children, onClick, class: className, ...rest }: Props = $props();
</script>

<button class="relative {className}" onclick={onClick} {...rest}>
	{@render children()}

	<Layer />
</button>
