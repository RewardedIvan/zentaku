<script lang="ts">
	import { Button, Checkbox, Dialog } from "m3-svelte";

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
		<Checkbox>
			<input type="checkbox" bind:checked={dontAskAgain} />
		</Checkbox>
		<span class="ml-2">Don't ask again (until you exit this page)</span>
	</label>

	{#snippet buttons()}
		<Button variant="text" onclick={close}>No</Button>
		<Button variant="filled" onclick={confirm}>Yes</Button>
	{/snippet}
</Dialog>
