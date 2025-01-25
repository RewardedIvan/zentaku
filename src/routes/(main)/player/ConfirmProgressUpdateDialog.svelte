<script lang="ts">
	import { Button, CheckboxAnim, Dialog } from "m3-svelte";

	interface Props {
		open: boolean;
		onConfirm: () => void;
	}

	let { open = $bindable(), onConfirm }: Props = $props();
	let dontAskAgain = $state(false);
	let lastAnswer: boolean | null = $state(null);

	function close() {
		if (dontAskAgain) {
			lastAnswer = false;
		}
		open = false;
	}

	function confirm() {
		if (dontAskAgain) {
			lastAnswer = true;
		}
		open = false;
		onConfirm();
	}

	$effect(() => {
		// svelte, pls add an optional depedency list
		if (open && lastAnswer != null) {
			if (lastAnswer) {
				onConfirm();
			}

			open = false;
		}
	});
</script>

<Dialog headline="Confirm progress update" bind:open>
	<p>Update progress on AniList?</p>
	<label class="flex flex-row gap-2 items-center mt-4">
		<CheckboxAnim>
			<input type="checkbox" bind:checked={dontAskAgain} />
		</CheckboxAnim>
		<span class="ml-2">Don't ask again (until you exit this page)</span>
	</label>

	{#snippet buttons()}
		<Button type="text" on:click={close}>No</Button>
		<Button type="filled" on:click={confirm}>Yes</Button>
	{/snippet}
</Dialog>
