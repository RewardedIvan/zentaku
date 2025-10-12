<script lang="ts">
	import { Button, Icon, Snackbar } from "m3-svelte";
	import type { FormEventHandler } from "svelte/elements";
	import type { ComponentProps } from "svelte";
	import { Settings } from "$lib/stores/settings";
	import { get } from "svelte/store";
	import { save } from "@tauri-apps/plugin-dialog";
	import { writeTextFile } from "@tauri-apps/plugin-fs";

	import ImportIcon from "@ktibow/iconset-material-symbols/sim-card-download";
	import ExportIcon from "@ktibow/iconset-material-symbols/file-export";

	type BtnProps = ComponentProps<typeof Button>;
	// doing keyof T in the type thingy is dangerous
	// it'll Error: Expression produces a union type that is too complex to represent.
	// probably because it has [any]: string or something like that
	// thus i can't use Omit<>
	type Without<T, K extends string> = {
		[P in keyof T as P extends K ? never : P]: T[P];
	};
	type Props = Without<BtnProps, "onclick" | "children"> & { icons?: boolean };

	let { variant, icons = false, ...rest }: Props = $props();

	let inp: HTMLInputElement | null;
	let form: HTMLFormElement | null;
	let snackbar: ReturnType<typeof Snackbar>;

	function impor() {
		form?.reset();
		inp?.click();
	}

	const err = (m: string) => snackbar.show({ message: m, timeout: 2000 });

	async function expor() {
		const j = JSON.stringify(get(Settings));
		const path = await save({ filters: [{ extensions: ["json"], name: "Zentaku Settings" }] });
		if (!path) return;
		writeTextFile(path, j);

		// should be safe but idk for sure
		// you can find the invoke api at
		// https://github.com/tauri-apps/plugins-workspace/blob/6b5b1053ba8aeb789dd5cb5fb05b7e98f3b8de0b/plugins/fs/guest-js/index.ts#L1116
		// testing in the js console

		// new Array(27).fill(0).map(
		// 	async (_, i) =>
		// 		await __TAURI_INTERNALS__.invoke(
		// 			"plugin:fs|write_text_file",
		// 			new TextEncoder().encode("hi"),
		// 			{
		// 				headers: {
		// 					path: encodeURIComponent("test.txt"),
		// 					options: JSON.stringify({ baseDir: i - 2 }),
		// 				},
		// 			},
		// 		),
		// );

		// await __TAURI_INTERNALS__.invoke("plugin:fs|write_text_file", new TextEncoder().encode("hi"), {
		// 	headers: { path: encodeURIComponent("C:\\test.txt"), options: {} },
		// });
	}

	const oninput: FormEventHandler<HTMLInputElement> = e => {
		const f = e.currentTarget.files?.[0];
		if (!f) {
			return err("No file selected.");
		}

		const fr = new FileReader();
		fr.onload = e => {
			try {
				const j = JSON.parse(e.target?.result as string);
				Settings.set(j);
				location.reload();
			} catch (e) {
				err(String(e));
			}
		};
		fr.readAsText(f);
	};
</script>

<form class="hidden" bind:this={form}>
	<!-- <a title="download" bind:this={dla} href="/#" download></a> -->
	<input type="file" accept=".json" hidden={true} {oninput} bind:this={inp} />
</form>
<Button onclick={impor} variant={variant ?? "outlined"} {...rest}
	>{#if icons}<Icon icon={ImportIcon} />{:else}Import{/if}</Button
>
<Button onclick={expor} variant={variant ?? "outlined"} {...rest}
	>{#if icons}<Icon icon={ExportIcon} />{:else}Export{/if}</Button
>

<Snackbar bind:this={snackbar} />
