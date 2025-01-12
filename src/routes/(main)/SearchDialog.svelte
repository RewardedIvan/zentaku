<script lang="ts">
	import {
		Button,
		CircularProgressIndeterminate,
		DatePickerDocked,
		Icon,
		SegmentedButtonContainer,
		SegmentedButtonItem,
		Switch,
	} from "m3-svelte";
	import {
		formatDate,
		search,
		type MediaFormat,
		type ResultType,
		type SearchQuery,
		type SearchVariables,
	} from "$lib/anilist";
	import { goto } from "$app/navigation";

	import SearchIcon from "@ktibow/iconset-material-symbols/search";
	import MenuIcon from "@ktibow/iconset-material-symbols/menu";
	import NextIcon from "@ktibow/iconset-material-symbols/arrow-right";
	import PrevIcon from "@ktibow/iconset-material-symbols/arrow-left";

	import Ripple from "$lib/ui/Ripple.svelte";
	import Menu from "$lib/ui/Menu.svelte";
	import Dropdown from "$lib/ui/Dropdown.svelte";
	import RangeSlider from "$lib/ui/RangeSlider.svelte";
	import DatePicker from "$lib/ui/DatePicker.svelte";

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let query = $state("");
	let filterMenuOpen = $state(false);
	let dialog: HTMLDialogElement | null = $state(null);
	let debounceTimeout: number | undefined = $state(undefined);
	let results: Promise<SearchQuery> | null = $state(null);

	// TODO: save in settings
	let filters /*: SearchVariables*/ = $state({
		isAdult: false,
		averageScoreUpperRange: 100,
		averageScoreBottomRange: 0,
		episodesUpperRange: 150,
		episodesBottomRange: 0,
		chaptersUpperRange: 500,
		chaptersBottomRange: 0,
		volumesUpperRange: 50,
		volumesBottomRange: 0,
		countryOfOrigin: undefined,
		startDateUpperRange: 20260000,
		startDateBottomRange: 19400000,
		endDateUpperRange: 20260000,
		endDateBottomRange: 19400000,
		format: undefined,
		status: undefined,
		includeAnime: true,
		includeManga: true,
		includeCharacters: true,
		includeStaff: true,
		includeStudios: true,
		includeUsers: true,
	});

	$effect(() => {
		if (!dialog) return;

		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function searc() {
		results = search({
			search: query.length ? query : undefined,
			...filters,
		});
	}

	$effect(() => {
		query;
		filters;
		debounceTimeout = setTimeout(() => {
			if (query != "") {
				searc();
			}
		}, 500);

		// runs every rerun
		return () => {
			clearTimeout(debounceTimeout);
		};
	});

	function searchKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case "Escape":
				open = false;
				break;
			case "Enter":
				open = false;
				break;
		}
	}

	function mediaFormatToString(format: MediaFormat) {
		switch (format) {
			case "TV":
				return "TV";
			case "TV_SHORT":
				return "Short TV";
			case "MOVIE":
				return "Movie";
			case "SPECIAL":
				return "Special";
			case "OVA":
				return "OVA";
			case "ONA":
				return "ONA";
			case "MUSIC":
				return "Music";
			case "MANGA":
				return "Manga";
			case "NOVEL":
				return "Novel";
			case "ONE_SHOT":
				return "One-shot";
		}
	}

	function capitalizeFirstLetter(val: string) {
		return String(val).charAt(0).toUpperCase() + String(val).slice(1);
	}

	// honestly, just pray it works
	async function pagination(type: ResultType, pageRelative: number) {
		if (results == null) return;
		let resul = await results;

		// @ts-ignore
		let newPage = resul[type].pageInfo.currentPage + pageRelative;
		if (newPage < resul[type].pageInfo.lastPage && newPage != 0) {
			let vars = { search: query.length ? query : undefined, ...filters };

			// @ts-ignore
			vars[type + "Page"] = newPage;
			vars.includeAnime = false;
			vars.includeManga = false;
			vars.includeCharacters = false;
			vars.includeStaff = false;
			vars.includeStudios = false;
			vars.includeUsers = false;
			// @ts-ignore
			vars["include" + capitalizeFirstLetter(type)] = true;
			results = new Promise(async res => {
				// @ts-ignore
				resul[type] = (await search(vars))[type];
				res(resul);
			});
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
<dialog
	class="bg-transparent backdrop:bg-scrim/30 backdrop:transition-colors grid grid-cols-3 grid-rows-[auto_1fr_1fr] gap-20 size-full items-start"
	class:invisible={!open}
	class:pointer-events-none={!open}
	oncancel={() => (open = false)}
	onclick={e => {
		if (e.currentTarget == e.target) {
			open = false;
		}
	}}
	bind:this={dialog}
>
	<div class="grid-cols-subgrid col-span-3">
		<div
			class="
                bg-surface-container-high w-[22.5rem] rounded-xl
                {open ? 'animate-dialogIn' : ''}
                flex flex-row h-14 gap-4 items-center px-4 justify-self-center
            "
		>
			{#await results}
				<CircularProgressIndeterminate
					extraOptions={{ style: "display: inline-flex; width: 1.5em; height: 1.5em" }}
				/>
			{:then _}
				<Ripple class="size-6 flex items-center justify-center" onClick={searc}>
					<Icon icon={SearchIcon} width="1.5em" height="2em" />
				</Ripple>
			{/await}

			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="flex-grow bg-transparent placeholder:text-on-surface outline-none"
				autocapitalize="words"
				autocorrect="off"
				placeholder="Search AniList..."
				bind:value={query}
				onkeydown={searchKeyDown}
				autofocus
			/>

			<Menu bind:open={filterMenuOpen} className="max-h-full">
				<Ripple
					class="size-6 flex items-center justify-center"
					onClick={() => (filterMenuOpen = !filterMenuOpen)}
				>
					<Icon icon={MenuIcon} width="1.5em" height="2em" />
				</Ripple>

				{#snippet menu()}
					<div class="grid grid-cols-2 auto-rows-auto gap-6 p-2 items-center justify-center">
						<span>Adult</span>
						<label for={null}> <Switch bind:checked={filters.isAdult} /> </label>

						<span>Average Score</span>
						<RangeSlider
							bind:bottom={filters.averageScoreBottomRange}
							bind:upper={filters.averageScoreUpperRange}
							min={0}
							max={100}
						/>
						<span>Episodes</span>
						<RangeSlider
							bind:bottom={filters.episodesBottomRange}
							bind:upper={filters.episodesUpperRange}
							min={0}
							max={150}
						/>

						<span>Chapters</span>
						<RangeSlider
							bind:bottom={filters.chaptersBottomRange}
							bind:upper={filters.chaptersUpperRange}
							min={0}
							max={500}
						/>

						<span>Volumes</span>
						<RangeSlider
							bind:bottom={filters.volumesBottomRange}
							bind:upper={filters.volumesUpperRange}
							min={0}
							max={50}
						/>

						<span>Country of Origin</span>
						<Dropdown
							bind:value={filters.countryOfOrigin}
							type="textfield"
							name="Country of Origin"
							placement="bottom-start"
							options={[
								{ value: undefined, text: "Any" },
								{ value: "JP", text: "Japan" },
								{ value: "KR", text: "South Korea" },
								{ value: "CN", text: "China" },
								{ value: "TW", text: "Taiwan" },
							]}
						/>

						<span>Start Date</span>
						<div class="flex flex-row">
							<DatePicker name="From" bind:fuzzyDateInt={filters.startDateBottomRange} />
							<DatePicker name="To" bind:fuzzyDateInt={filters.startDateUpperRange} />
						</div>

						<span>End Date</span>
						<div class="flex flex-row">
							<DatePicker name="From" bind:fuzzyDateInt={filters.endDateBottomRange} />
							<DatePicker name="To" bind:fuzzyDateInt={filters.endDateUpperRange} />
						</div>

						<span>Format</span>
						<Dropdown
							bind:value={filters.format}
							type="textfield"
							name="Format"
							placement="bottom-start"
							options={[
								{ value: undefined, text: "Any" },
								{ value: "TV", text: "TV" },
								{ value: "TV_SHORT", text: "Short TV" },
								{ value: "MOVIE", text: "Movie" },
								{ value: "SPECIAL", text: "Special" },
								{ value: "OVA", text: "OVA" },
								{ value: "ONA", text: "ONA" },
								{ value: "MUSIC", text: "Music" },
								{ value: "MANGA", text: "Manga" },
								{ value: "NOVEL", text: "Novel" },
								{ value: "ONE_SHOT", text: "One-shot" },
							]}
						/>

						<span>Status</span>
						<Dropdown
							bind:value={filters.status}
							type="textfield"
							name="Status"
							placement="bottom-start"
							options={[
								{ value: undefined, text: "Any" },
								{ value: "FINISHED", text: "Finished" },
								{ value: "RELEASING", text: "Releasing" },
								{ value: "NOT_YET_RELEASED", text: "Not yet released" },
								{ value: "CANCELLED", text: "Cancelled" },
								{ value: "HIATUS", text: "Hiatus" },
							]}
						/>

						<span>Include</span>
						<SegmentedButtonContainer>
							<input type="checkbox" id="sgi-0" bind:checked={filters.includeAnime} />
							<SegmentedButtonItem input="sgi-0">Anime</SegmentedButtonItem>
							<input type="checkbox" id="sgi-1" bind:checked={filters.includeManga} />
							<SegmentedButtonItem input="sgi-1">Manga</SegmentedButtonItem>
							<input type="checkbox" id="sgi-2" bind:checked={filters.includeCharacters} />
							<SegmentedButtonItem input="sgi-2">Characters</SegmentedButtonItem>
							<input type="checkbox" id="sgi-3" bind:checked={filters.includeStaff} />
							<SegmentedButtonItem input="sgi-3">Staff</SegmentedButtonItem>
							<input type="checkbox" id="sgi-4" bind:checked={filters.includeStudios} />
							<SegmentedButtonItem input="sgi-4">Studios</SegmentedButtonItem>
							<input type="checkbox" id="sgi-5" bind:checked={filters.includeUsers} />
							<SegmentedButtonItem input="sgi-5">Users</SegmentedButtonItem>
						</SegmentedButtonContainer>
					</div>
				{/snippet}
			</Menu>
		</div>
	</div>

	{#if results}
		{#await results then results}
			{#snippet card(link: string, title: string, meta?: string, image?: string, avatar?: string)}
				<Ripple
					onClick={() => goto(link)}
					class="
                        bg-surface-container-high p-2 flex flex-row justify-between gap-20 rounded-md items-stretch
                        {open ? 'animate-dialogIn' : ''}
                    "
				>
					<div class="flex flex-row gap-2">
						{#if avatar}
							<img src={avatar} alt="avatar" class="object-cover ml-2 my-2 size-10 rounded-xl" />
						{/if}
						<div class="flex flex-col ml-1 {meta ? 'text-start' : 'justify-center'}">
							<span class="font-bold font-afacad-flux text-xl">
								{title}
							</span>
							{#if meta}
								<span>{meta}</span>
							{/if}
						</div>
					</div>

					{#if image}
						<img
							src={image}
							alt="cover"
							class="object-cover h-24 w-48 -mt-2 -mr-2 -mb-2 rounded-md"
						/>
					{/if}
				</Ripple>
			{/snippet}

			{#snippet resultHeader(type: ResultType)}
				<div class="flex flex-row justify-between">
					<span class="font-afacad-flux text-2xl">{capitalizeFirstLetter(type)}</span>
					<div class="flex flex-row gap-2 items-center">
						<Button type="text" on:click={() => pagination(type, -1)} iconType="full">
							<Icon icon={PrevIcon} />
						</Button>

						<span>{results[type].pageInfo.currentPage}</span>

						<Button type="text" on:click={() => pagination(type, 1)} iconType="full">
							<Icon icon={NextIcon} />
						</Button>
					</div>
				</div>
			{/snippet}

			{#if results.anime && results.anime.results.length > 0}
				<div class="flex flex-col gap-2">
					{@render resultHeader("anime")}
					{#each results.anime.results as media}
						{@render card(
							`/anime?id=${media.id}`,
							media.title.userPreferred,
							mediaFormatToString(media.format) + " " + formatDate(media.startDate),
							media.coverImage.medium,
						)}
					{/each}
				</div>
			{/if}

			{#if results.manga && results.manga.results.length > 0}
				<div class="flex flex-col gap-2">
					{@render resultHeader("manga")}
					{#each results.manga.results as media}
						{@render card(
							`/manga?id=${media.id}`,
							media.title.userPreferred,
							mediaFormatToString(media.format) + " " + formatDate(media.startDate),
							media.coverImage.medium,
						)}
					{/each}
				</div>
			{/if}

			{#if results.users && results.users.results.length > 0}
				<div class="flex flex-col gap-2">
					{@render resultHeader("users")}
					{#each results.users.results as user}
						{@render card(
							`/user?id=${user.id}`,
							user.name,
							undefined,
							undefined,
							user.avatar.medium,
						)}
					{/each}
				</div>
			{/if}

			{#if results.staff && results.staff.results.length > 0}
				<div class="flex flex-col gap-2">
					{@render resultHeader("staff")}
					{#each results.staff.results as staff}
						{@render card(
							`/staff?id=${staff.id}`,
							staff.name.userPreferred,
							staff.primaryOccupations.join(", "),
							undefined,
							staff.image.medium,
						)}
					{/each}
				</div>
			{/if}

			{#if results.studios && results.studios.results.length > 0}
				<div class="flex flex-col gap-2">
					{@render resultHeader("studios")}
					{#each results.studios.results as studio}
						{@render card(`/studio?id=${studio.id}`, studio.name, undefined, undefined, undefined)}
					{/each}
				</div>
			{/if}
		{/await}
	{/if}
</dialog>
