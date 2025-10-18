import type { Attachment } from "svelte/attachments";

export const autoFocus: Attachment = element => {
	(element as HTMLElement).focus();
};
