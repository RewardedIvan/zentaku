import { invoke } from "@tauri-apps/api/core";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
	return {
		loggedIn: await invoke<boolean>("check_login"),
	};
};
