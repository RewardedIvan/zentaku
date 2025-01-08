import type { VideoSource } from "$lib/source";
import { TrustStore } from "$lib/stores/SourceStores";
import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import { fetch as unsafeFetch } from "$lib/tauri";

export async function hashScript(str: string) {
	const msgUint8 = new TextEncoder().encode(str);
	const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export type ScriptsSource = Record<string, string>;

export async function getScripts(): Promise<ScriptsSource> {
	return await invoke<Record<string, string>>("get_sources");
}

// possible race condition (if you let the function get the sources)
// let's hope it doesn't happen i mean i'm not sure how you'd 
// do this without already having FAST access to the filesystem
export async function areAllScriptsTrusted(ownScripts?: ScriptsSource) {
	const scripts = ownScripts ?? await invoke<Record<string, string>>("get_sources");

	const trustStore = get(TrustStore);
	return !(
		await Promise.all(
			Object.entries(scripts).map(async ([_fileName, script]) => {
				return Object.hasOwn(trustStore, await hashScript(script));
			}),
		)
	).includes(false);
}

export async function loadScripts(ownScripts?: ScriptsSource): Promise<VideoSource<unknown>[]> {
	const scripts = ownScripts ?? await invoke<Record<string, string>>("get_sources");

	return Object.entries(scripts)
		.map(([_fileName, script]) => {
			// @ts-ignore
			window.unsafeFetch = unsafeFetch;
			return eval(`(() => { ${script} })()`);
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

export async function trustScripts(ownScripts?: ScriptsSource) {
	const scripts = ownScripts ?? await invoke<Record<string, string>>("get_sources");

	const newEntries = Object.fromEntries(
		await Promise.all(
			Object.entries(scripts).map(async ([fileName, script]) => {
				let scriptHash = await hashScript(script);
				return [scriptHash, fileName];
			}),
		),
	);

	TrustStore.update(current => ({ ...current, ...newEntries }));
}
