export * from "./getProfile";
export * from "./getMedia";
export * from "./getMediaLists";
export * from "./getCharacter";
export * from "./getPausedStatus";
export * from "./getPlayingStatus";
export * from "./search";
export * from "./toggleFavourite";
export * from "./changeProgress";

import { format } from "date-fns";
export function formatDate(date: { year?: number; month?: number; day?: number }) {
	const jsDate = new Date(date.year ?? 0, (date.month ?? 0) - 1, date.day ?? 0);
	let res = "";

	if (date.month) {
		res += format(jsDate, "MMM");
	}
	if (date.day) {
		if (res.length) res += " ";
		res += format(jsDate, "do");
	}
	if (date.year) {
		if (res.length) res += " ";
		res += format(jsDate, "yyyy");
	}

	return res;
}
