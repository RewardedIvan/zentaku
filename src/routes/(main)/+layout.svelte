<script lang="ts">
	import SearchDialog from "./SearchDialog.svelte";
	import Menu from "$lib/ui/Menu.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";
	import {
		MenuItem,
		CircularProgressIndeterminate,
		Button,
		Icon,
		easeEmphasizedDecel,
		easeEmphasizedAccel,
	} from "m3-svelte";
	import { getProfile } from "$lib/anilist";
	import { page } from "$app/state";
	import { getCurrentWindow } from "@tauri-apps/api/window";
	import { slide } from "svelte/transition";
	import { Topbar } from "$lib/stores/Topbar";
	import { goto } from "$app/navigation";

	import ArrowBackIcon from "@ktibow/iconset-material-symbols/arrow-back";
	import MaximizeIcon from "@ktibow/iconset-material-symbols/open-in-full-rounded";
	import MinimizeIcon from "@ktibow/iconset-material-symbols/arrow-drop-down-rounded";
	import XIcon from "@ktibow/iconset-material-symbols/close-rounded";
	import SearchIcon from "@ktibow/iconset-material-symbols/search";

	const { children } = $props();

	let searchDialogOpen = $state(false);
	let profileMenuOpen = $state(false);
	let win = getCurrentWindow();

	function goBack() {
		window.history.back();
	}

	let dragDiv: HTMLDivElement | null = $state(null);
	async function dragMouseDown(e: MouseEvent) {
		if (e.target !== dragDiv) return;

		e.preventDefault();
		if (e.detail == 2) {
			await win.toggleMaximize();
		} else {
			await win.startDragging();
		}
	}
</script>

<div class="flex flex-col min-h-screen">
	{#if !$Topbar.hidden}
		<div
			class="h-[40px] sticky top-0 z-[99999] bg-surface-container-highest"
			in:slide={{ duration: 300, easing: easeEmphasizedDecel }}
			out:slide={{ duration: 300, easing: easeEmphasizedAccel }}
		>
			{@render menu()}
		</div>
	{/if}

	{@render children()}
</div>

{#snippet menu()}
	<div
		class="flex flex-row items-center justify-between px-2"
		onmousedown={dragMouseDown}
		bind:this={dragDiv}
		role="menubar"
		tabindex="0"
	>
		<div class="flex flex-row gap-2 items-center">
			{#if page.url.pathname !== "/"}
				<Button on:click={goBack} iconType="full" type="text">
					<Icon icon={ArrowBackIcon} />
				</Button>
			{/if}
			<span class="font-afacad-flux text-xl">zentaku</span>
		</div>
		<div class="flex flex-row items-center justify-center">
			{#await getProfile()}
				<CircularProgressIndeterminate />
			{:then profile}
				<Button type="text" iconType="full" on:click={() => (searchDialogOpen = true)}>
					<Icon icon={SearchIcon} />
				</Button>

				<div class="w-2"></div>

				<Menu bind:open={profileMenuOpen}>
					<Ripple onClick={() => (profileMenuOpen = !profileMenuOpen)}>
						<img src={profile.avatar} alt="avatar" width={32} draggable={false} />
					</Ripple>

					{#snippet menu()}
						<MenuItem>Profile</MenuItem>
						<MenuItem on:click={() => goto("/settings")}>Settings</MenuItem>
						<MenuItem>Logout</MenuItem>
					{/snippet}
				</Menu>
			{/await}

			<div class="flex flex-row ml-2">
				<Ripple onClick={win.minimize}>
					<Icon icon={MinimizeIcon} width="32" height="32" />
				</Ripple>
				<Ripple onClick={win.toggleMaximize}>
					<Icon icon={MaximizeIcon} width="32" height="32" />
				</Ripple>
				<Ripple onClick={win.close}>
					<Icon icon={XIcon} width="32" height="32" />
				</Ripple>
			</div>
		</div>
	</div>
{/snippet}

<SearchDialog bind:open={searchDialogOpen} />
