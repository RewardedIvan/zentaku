<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Button, TextField } from "m3-svelte";

	let name = $state("");
	let greetMsg = $state("");

	async function greet(event: Event) {
		event.preventDefault();
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		greetMsg = await invoke("greet", { name });
	}
</script>

<main class="flex flex-col justify-center items-center gap-2">
	<Button type="tonal" on:click={greet}>hi</Button>
	<TextField bind:value={name} name="name" />
	<p>{greetMsg}</p>
</main>
