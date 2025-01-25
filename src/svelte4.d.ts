import type { IconifyIcon } from "@iconify/types";
import type { HTMLDialogAttributes, HTMLButtonAttributes, HTMLAttributes } from "svelte/elements";
import type { Component, ComponentConstructorOptions, Snippet, SvelteComponentTyped } from "svelte";

declare module "m3-svelte" {
	declare const ListItemButton: Component<{
		leading?: Snippet<[]>;
		trailing?: Snippet<[]>;
		display?: string;
		extraOptions?: HTMLButtonAttributes;
		overline?: string;
		headline?: string;
		supporting?: string;
		lines?: number | undefined;
	}> & {
		on: () => void;
	};

	declare const ListItem: Component<{
		leading?: Snippet<[]>;
		trailing?: Snippet<[]>;
		display?: string;
		extraOptions?: HTMLAttributes<HTMLDivElement>;
		overline?: string;
		headline?: string;
		supporting?: string;
		lines?: number | undefined;
	}>;

	declare const Dialog: Component<
		{
			display?: string | undefined;
			extraOptions?: HTMLDialogAttributes | undefined;
			icon?: IconifyIcon | undefined;
			headline: string;
			open: boolean;
			closeOnEsc?: boolean | undefined;
			closeOnClick?: boolean | undefined;
			children?: Snippet<[]>;
			buttons?: Snippet<[]>;
		},
		{},
		"open"
	>;

	declare const TextField: Component<
		{
			display?: string;
			extraWrapperOptions?: HTMLAttributes<HTMLDivElement>;
			extraOptions?: HTMLInputAttributes;
			name: string;
			leadingIcon?: IconifyIcon | undefined;
			trailingIcon?: IconifyIcon | undefined;
			disabled?: boolean;
			required?: boolean;
			error?: boolean;
			value?: any; // changed
		},
		{},
		"value"
	> & {
		on: () => void;
	};
}
