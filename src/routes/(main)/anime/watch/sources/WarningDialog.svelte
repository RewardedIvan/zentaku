<script lang="ts">
	import { Dialog, Button } from "m3-svelte";
	import WarningIcon from "@ktibow/iconset-material-symbols/warning";

	interface Props {
		open: boolean;
		refreshSources: () => void;
	}

	let { open = $bindable(), refreshSources }: Props = $props();
</script>

<Dialog bind:open headline="Warning" icon={WarningIcon}>
	<div class="flex flex-col">
		<!-- yap -->
		<p>Sources <span class="text-primary">run potentially dangerous code.</span></p>
		<p>You should only use sources from trusted developers.</p>
		<p>
			Please <span class="text-primary">check the source code</span> of the sources you add before using
			them.
		</p>
		<p>Note: Generally, obfuscated (unreadable/gibberish) code isn't safe.</p>
		<p>
			<span class="text-primary">Trusting</span> a source will allow it to
			<span class="text-primary">run without warning.</span>
		</p>
		<p class="self-end">With that said,</p>
		<p class="self-end">Are you sure you want to refresh sources?</p>
	</div>

	{#snippet buttons()}
		<Button type="outlined" on:click={() => (open = false)}>Cancel</Button>
		<Button type="filled" on:click={refreshSources}>Refresh and trust all</Button>
	{/snippet}
</Dialog>
