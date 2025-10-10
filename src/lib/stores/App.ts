import { writable } from "svelte/store";

export const Topbar = writable({
	hidden: false,
});

export const CurrentDropdown = writable("");
