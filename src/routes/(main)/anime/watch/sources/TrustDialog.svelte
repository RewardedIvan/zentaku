<script lang="ts">
	import { TrustStore } from "$lib/stores/sourceStores";
	import { Dialog, ListItem, Button, Divider, Icon } from "m3-svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";

	import XIcon from "@ktibow/iconset-material-symbols/close";
	import TrustIcon from "@ktibow/iconset-material-symbols/security";

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	async function untrustAll() {
		TrustStore.set({});
	}

	async function untrust(key: string) {
		// fancy way to delete a key from an object
		const { [key]: _, ...rest } = $TrustStore;
		TrustStore.set(rest);
	}
</script>

<Dialog bind:open headline="Trusted Sources" icon={TrustIcon}>
	<div class="flex flex-col bg-surface-container-high flex-grow">
		{#each Object.entries($TrustStore) as [key, _value], i}
			<ListItem headline={key.substring(0, 24) + "..."}>
				{#snippet leading()}
					<Icon icon={TrustIcon} />
				{/snippet}

				{#snippet trailing()}
					<div class="flex flex-row gap-2 ml-8">
						<Tooltip>
							<Button variant="filled" iconType="full" onclick={() => untrust(key)}>
								<Icon icon={XIcon} />
							</Button>
							{#snippet tooltip()}
								<span class="text-sm">Untrust</span>
							{/snippet}
						</Tooltip>
					</div>
				{/snippet}
			</ListItem>
			{#if i != Object.entries($TrustStore).length - 1}
				<Divider />
			{/if}
		{/each}

		{#if Object.entries($TrustStore).length == 0}
			<span class="text-center">No trusted sources</span>
		{/if}
	</div>

	{#snippet buttons()}
		<Button variant="outlined" onclick={() => (open = false)}>Close</Button>
		<Button variant="filled" onclick={untrustAll}>Untrust all</Button>
	{/snippet}
</Dialog>
