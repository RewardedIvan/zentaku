<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Button, TextField } from "m3-svelte";
	//<Button type="tonal" on:click={() => }>stop Login with AniList</Button>
	let p: Promise<unknown>;
</script>

<main class="flex flex-col gap-2">
	<Button type="tonal" on:click={() => (p = invoke("oauth"))}>Login with AniList</Button>
	<Button type="tonal" on:click={() => (p = invoke("get_token"))}>get token</Button>
	<Button type="tonal" on:click={() => (p = invoke("check_login"))}>check login</Button>

	{#if p}
		{#await p}
			<p>Loading...</p>
		{:then data}
			<span>{JSON.stringify(data)}</span>
		{:catch error}
			<span class="text-wrap">error {JSON.stringify(error)}</span>
		{/await}
	{:else}
		<p>No promise</p>
	{/if}
</main>
