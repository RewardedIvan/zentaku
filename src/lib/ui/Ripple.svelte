<script lang="ts">
	import { Layer } from "m3-svelte";
	import type { Snippet } from "svelte";

	interface Props {
		onClick?: () => void;
		onRightClick?: () => void;
		children: Snippet<[]>;
		class?: string;
		[key: string]: any;
	}

	const { children, onClick, onRightClick, class: className, ...rest }: Props = $props();

	function onContextMenu(e: MouseEvent) {
		if (onRightClick) {
			onRightClick();
			e.preventDefault();
		}
	}
</script>

<button class="relative {className}" onclick={onClick} oncontextmenu={onContextMenu} {...rest}>
	{@render children()}

	<Layer />
</button>
