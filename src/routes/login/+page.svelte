<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Button, Card, LinearProgressIndeterminate } from "m3-svelte";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	let oauthPromise: Promise<void> | null = $state(null);
	function login() {
		if (oauthPromise) {
			invoke("oauth");
		} else {
			oauthPromise = invoke("oauth");
		}
	}

	interface Props {
		data: PageData;
	}

	const { data }: Props = $props();
</script>

<div class="flex flex-col h-screen">
	<div class="flex flex-grow flex-col items-center justify-center">
		<Card variant="filled">
			<div class="flex flex-col gap-2 justify-center">
				<Button variant="tonal" onclick={login}>
					{data.loggedIn ? "Refresh AniList login" : "Login with AniList"}
				</Button>

				{#if data.loggedIn}
					<Button variant="tonal" onclick={() => goto("/")}>Home</Button>
					<span class="text-center">Already logged in...</span>
				{/if}

				{#if oauthPromise != null}
					{#await oauthPromise}
						<span class="text-center">Check your browser.</span>
						<LinearProgressIndeterminate />
					{:then}
						<Button variant="tonal" onclick={() => goto("/")}>Home</Button>
						<span class="text-center">Logged in!</span>
					{/await}
				{/if}
			</div>
		</Card>
	</div>
</div>
