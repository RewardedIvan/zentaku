import { goto } from "$app/navigation";
import { page } from "$app/state";
import type { ClientInit } from "@sveltejs/kit";
import { invoke } from "@tauri-apps/api/core";

// note: runs before hydration
export const init: ClientInit = async () => {
	const loggedIn = await invoke<boolean>("check_login");

	if (!loggedIn && !window.location.pathname.endsWith("/login")) {
		window.location.href = "/login";
	}
};
