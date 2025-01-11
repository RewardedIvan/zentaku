<script lang="ts">
	import {
		Card,
		easeEmphasizedAccel,
		easeEmphasizedDecel,
		Icon,
		MenuItem,
		CircularProgressIndeterminate,
	} from "m3-svelte";
	import { addSeconds, format } from "date-fns";
	import { UTCDate } from "@date-fns/utc";
	import { getCurrentWindow } from "@tauri-apps/api/window";
	import { type IconifyIcon } from "@iconify/types";
	import { type Placement } from "@floating-ui/core";
	import { onMount, type Snippet } from "svelte";
	import { linear } from "svelte/easing";
	import { Tween } from "svelte/motion";
	import { Topbar } from "$lib/stores/Topbar";

	import Ripple from "$lib/ui/Ripple.svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import M2Slider from "$lib/ui/M2Slider.svelte";
	import Menu from "$lib/ui/Menu.svelte";

	import PlayIcon from "@ktibow/iconset-material-symbols/play-arrow";
	import PauseIcon from "@ktibow/iconset-material-symbols/pause";
	import PreviousIcon from "@ktibow/iconset-material-symbols/skip-previous-rounded";
	import NextIcon from "@ktibow/iconset-material-symbols/skip-next-rounded";
	import FullscreenIcon from "@ktibow/iconset-material-symbols/fullscreen-rounded";
	import Forward30Icon from "@ktibow/iconset-material-symbols/forward-30";
	import Forward10Icon from "@ktibow/iconset-material-symbols/forward-10";
	import Forward5Icon from "@ktibow/iconset-material-symbols/forward-5";
	import ForwardIcon from "@ktibow/iconset-material-symbols/forward-media";
	import Rewind30Icon from "@ktibow/iconset-material-symbols/replay-30";
	import Rewind10Icon from "@ktibow/iconset-material-symbols/replay-10";
	import Rewind5Icon from "@ktibow/iconset-material-symbols/replay-5";
	import RewindIcon from "@ktibow/iconset-material-symbols/replay";
	import VolumeUpIcon from "@ktibow/iconset-material-symbols/volume-up";
	import VolumeDownIcon from "@ktibow/iconset-material-symbols/volume-down";
	import AspectRatioIcon from "@ktibow/iconset-material-symbols/aspect-ratio";
	import QuestionMarkIcon from "@ktibow/iconset-material-symbols/question-mark";

	interface Props {
		class?: string;
		videoClass?: string;
		previous?: () => void;
		next?: () => void;
		children: Snippet<[]>;
		time: number;
		loading: boolean;
	}

	let {
		class: className,
		videoClass,
		previous,
		next,
		children,
		time = $bindable(),
		loading,
	}: Props = $props();

	let paused = $state(false);
	let volume = $state(0.5);
	let duration = $state(0);
	let controlsOpacity = new Tween(0);
	let win = getCurrentWindow();
	let command: IconifyIcon | null = $state(null);
	let playbackRate = $state(1);
	let pointerOnControls = $state(false);
	let fit = $state<"fill" | "fit" | "zoom">("fill"); // TODO: make settings for the default state of this
	let fitMenuOpen = $state(false);

	const controlsFadeTimeMs = 3500; // TODO: make settings for this

	let video: HTMLVideoElement | null = $state(null);

	async function handleMove() {
		await controlsOpacity.set(1, { duration: 100, delay: 0, easing: easeEmphasizedDecel });
		if (pointerOnControls || fitMenuOpen) return;
		controlsOpacity.set(0, {
			duration: 300,
			delay: controlsFadeTimeMs,
			easing: easeEmphasizedAccel,
		});
	}

	function handleMousedown(e: MouseEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		paused = !paused;
		command = paused ? PlayIcon : PauseIcon;
	}

	function commandAnim(node: Element, { delay = 0, duration = 400, easing = linear } = {}) {
		const o = +getComputedStyle(node).opacity;
		const style = getComputedStyle(node);
		const transform = style.transform === "none" ? "" : style.transform;
		return {
			delay,
			duration,
			easing,
			css: (t: number) => `
				transform: ${transform} scale(${1 + t * o});
				opacity: ${1 - t * o}
			`,
		};
	}

	function onKey(e: KeyboardEvent) {
		let preventDefault = true;

		let units = 10;
		if (e.shiftKey) units = 1;
		if (e.ctrlKey) units = 5;
		if (e.altKey) units = 30;

		switch (e.key) {
			case " ":
				paused = !paused;
				command = paused ? PlayIcon : PauseIcon;
				break;
			case "ArrowLeft":
				time = Math.max(time - units, 0);

				if (units == 5) {
					command = Rewind5Icon;
				} else if (units == 30) {
					command = Rewind30Icon;
				} else if (units == 10) {
					command = Rewind10Icon;
				} else if (units == 1) {
					command = RewindIcon;
				}
				break;

			case "ArrowRight":
				time = Math.min(time + units, duration);

				if (units == 5) {
					command = Forward5Icon;
				} else if (units == 30) {
					command = Forward30Icon;
				} else if (units == 10) {
					command = Forward10Icon;
				} else if (units == 1) {
					command = ForwardIcon;
				}

				break;
			case "ArrowUp":
				volume = Math.min(volume + units / 100, 1);
				command = VolumeUpIcon;

				break;
			case "ArrowDown":
				volume = Math.max(volume - units / 100, 0);
				command = VolumeDownIcon;

				break;
			case ",":
				time = Math.max(time - 1 / 30, 0);
				break;
			case ".":
				time = Math.min(time + 1 / 30, duration);
				break;
			case "f":
				fullscreen();
			default:
				preventDefault = false;
				break;
		}

		if (preventDefault) {
			e.preventDefault();
		}
	}

	onMount(async () => {
		paused = true;
		command = PauseIcon;
	});

	async function fullscreen() {
		let current = await win.isFullscreen();
		win.setFullscreen(!current);
		Topbar.update(t => ({ ...t, hidden: !current }));
	}

	let fitStyle = $derived.by(() => {
		switch (fit) {
			case "fill":
				return "object-fill";
			case "fit":
				return "object-fit";
			case "zoom":
				return "object-cover";
		}
	});

	function setSizeMode(mode: typeof fit) {
		fit = mode;
		fitMenuOpen = false;
	}
</script>

<svelte:body onkeydown={onKey} />

<div class="relative flex min-h-0 bg-black overflow-hidden {className}">
	<video
		class="flex-grow min-w-0 min-h-0 {fitStyle} {videoClass}"
		style:cursor={controlsOpacity.current === 0 ? "none" : "auto"}
		onmousemove={handleMove}
		onmousedown={handleMousedown}
		onended={next}
		controls={false}
		bind:currentTime={time}
		bind:duration
		bind:paused
		bind:volume
		bind:playbackRate
		bind:this={video}
	>
		<track kind="captions" />
		{@render children()}
	</video>

	<div
		class="absolute left-0 top-0 w-full h-full justify-between bg-radial to-black/50 from-transparent pointer-events-none"
		style:opacity={controlsOpacity.current}
	></div>

	{#key command}
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center pointer-events-none"
			in:commandAnim={{ duration: 500 }}
			onintroend={a => a.currentTarget.remove()}
		>
			<Icon icon={command ?? QuestionMarkIcon} height="24" width="24" />
		</div>
	{/key}

	{#if loading}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
			<CircularProgressIndeterminate />
		</div>
	{/if}

	<div
		class="absolute left-0 bottom-0 w-full justify-between flex flex-col p-2 gap-2"
		onmousemove={handleMove}
		role="menu"
		tabindex="0"
		style:opacity={controlsOpacity.current}
		style:pointer-events={controlsOpacity.current === 0 ? "none" : "auto"}
		onpointerenter={() => (pointerOnControls = true)}
		onpointerleave={() => (pointerOnControls = false)}
	>
		<M2Slider
			bind:value={time}
			min={0}
			max={duration}
			thumb="hover"
			tooltip="none"
			heightChange={true}
		/>

		<div class="flex flex-row justify-between" draggable={false}>
			{#snippet button(onClick: () => void, icon: IconifyIcon, tip: string, placement?: Placement)}
				<Tooltip {placement}>
					<Ripple {onClick}>
						<Icon {icon} height="24" width="24" />
					</Ripple>

					{#snippet tooltip()}
						<span>{tip}</span>
					{/snippet}
				</Tooltip>
			{/snippet}

			<div class="flex flex-row gap-2 items-center">
				{#if previous}
					{@render button(previous, PreviousIcon, "Previous")}
				{/if}
				{@render button(
					() => (paused = !paused),
					paused ? PlayIcon : PauseIcon,
					paused ? "Play" : "Pause",
				)}
				{#if next}
					{@render button(next, NextIcon, "Next")}
				{/if}

				<M2Slider
					bind:value={volume}
					min={0}
					max={1}
					tooltip="hover"
					tooltipFormat={v => `${(v * 100).toFixed(0)}%`}
					class="w-28"
				/>

				<span class="ml-2">
					{format(addSeconds(new UTCDate(0), time), "HH:mm:ss").replace("12", "00")}
				</span>
			</div>
			<div class="flex flex-row gap-2">
				<!-- TODO: replace with keybind system -->
				<Tooltip>
					<span>controls</span>

					{#snippet tooltip()}
						<table>
							<tbody>
								{#snippet row(key: string, tip: string)}
									<tr>
										<td class="px-1">
											<kbd class="bg-black text-white font-jetbrains-mono">
												{key}
											</kbd>
										</td>
										<td class="px-1 text-end">
											{tip}
										</td>
									</tr>
								{/snippet}

								<tr><td>actions</td></tr>
								{@render row("←", "Rewind")}
								{@render row("→", "Forward")}
								{@render row("↑", "Volume Up")}
								{@render row("↓", "Volume Down")}
								<tr><td>modifiers</td></tr>
								{@render row("ALT action", "action 30units")}
								{@render row("CTRL action", "action 5units")}
								{@render row("SHIFT action", "action 1unit")}
								<tr><td>other</td></tr>
								{@render row("SPACE", "Play/Pause")}
								{@render row("f", "Fullscreen")}
								{@render row(",", "Rewind 1 frame")}
								{@render row(".", "Forward 1 frame")}
							</tbody>
						</table>
					{/snippet}
				</Tooltip>

				<Menu bind:open={fitMenuOpen}>
					<Tooltip>
						<Ripple onClick={() => (fitMenuOpen = !fitMenuOpen)}>
							<Icon icon={AspectRatioIcon} width="24" height="24" />
						</Ripple>

						{#snippet tooltip()}
							<span>Fit</span>
						{/snippet}
					</Tooltip>

					{#snippet menu()}
						<MenuItem on:click={() => setSizeMode("fill")}>Fill (stretched)</MenuItem>
						<MenuItem on:click={() => setSizeMode("fit")}>Fit (black bars)</MenuItem>
						<MenuItem on:click={() => setSizeMode("zoom")}>Zoom (zoomed in)</MenuItem>
					{/snippet}
				</Menu>

				{@render button(fullscreen, FullscreenIcon, "Fullscreen", "left")}
			</div>
		</div>
	</div>
</div>
