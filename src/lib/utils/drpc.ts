import { get } from "svelte/store";
import { Settings } from "$lib/stores/settings";
import { getProfile } from "$lib/anilist";
import { invoke } from "@tauri-apps/api/core";

export interface DiscordActivity {
	state?: string;
	details?: string;
	activity_type?: "Playing" | "Listening" | "Watching" | "Competing";
	timestamps?: {
		start?: number;
		end?: number;
	};
	assets?: {
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
	secrets?: {
		game?: string;
		join?: string;
		spectate?: string;
	};
	party?: {
		id?: string;
		size?: [number, number];
	};
	buttons?: {
		label: string;
		url?: string;
	}[];
}

export async function setActivity(activity: DiscordActivity) {
	console.log(activity);
	// if (activity.state?.length < 2)
	try {
		await invoke("set_activity", { activity });
	} catch (e) {
		console.error(e);
	}
}

export async function setActivityH(
	state: string,
	details: string | undefined = undefined,
	activity_type: DiscordActivity["activity_type"] = "Playing",
	timestamps: DiscordActivity["timestamps"] = undefined,
) {
	const { enabled, githubButton, profileButton, emptyState } = get(Settings).drpc;
	if (!enabled) return;

	if (emptyState) {
		state = "   ";
		activity_type = "Watching";
	}

	const p = await getProfile();

	let buttons: any = [];

	if (profileButton) {
		buttons.push({ label: "Profile", url: `https://anilist.co/user/${p.name}` });
	}
	if (githubButton) {
		buttons.push({ label: "Source", url: "https://github.com/rewardedivan/zentaku" });
	}
	if (!buttons.length) {
		buttons = [];
	}

	return setActivity({
		buttons,
		state,
		details,
		activity_type,
		timestamps,
	});
}
