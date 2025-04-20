import { LSCache } from "$lib/stores/Cache";
import { Settings } from "$lib/stores/Settings";
import { get } from "svelte/store";

export function findCache<T extends keyof typeof LSCache.defaultValue>(
	cacheKey: T,
	ageSettingKey: keyof typeof Settings.defaultValue.cache,
	key: keyof (typeof LSCache.defaultValue)[T],
): (typeof LSCache.defaultValue)[T][keyof (typeof LSCache.defaultValue)[T]] | undefined {
	const cached = get(LSCache)[cacheKey][key];
	const settings = get(Settings);

	// @ts-ignore trust me bro
	if (cached && cached.timestamp + settings.cache[ageSettingKey] * 60 * 60 * 1000 > Date.now())
		return cached;
}
