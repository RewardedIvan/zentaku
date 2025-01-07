import { createStoreLocalStorage } from "./LocalStorage";

export async function hashSource(str: string) {
	const msgUint8 = new TextEncoder().encode(str);
	const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const SourceSettings = createStoreLocalStorage<Record<string, any>>("sourceSettings", {});
export const TrustStore = createStoreLocalStorage<Record<string, string>>("sourceTrust", {});
