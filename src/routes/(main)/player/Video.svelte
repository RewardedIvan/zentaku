<script lang="ts" module>
	export { controlButton };
</script>

<script lang="ts">
	import {
		Card,
		CircularProgressEstimate,
		easeEmphasizedAccel,
		easeEmphasizedDecel,
		Icon,
		MenuItem,
	} from "m3-svelte";
	import { addSeconds, format } from "date-fns";
	import { UTCDate } from "@date-fns/utc";
	import { getCurrentWindow } from "@tauri-apps/api/window";
	import { type IconifyIcon } from "@iconify/types";
	import { type Placement } from "@floating-ui/core";
	import { onMount, type Snippet } from "svelte";
	import { linear } from "svelte/easing";
	import { Tween } from "svelte/motion";
	import { Topbar } from "$lib/stores/app";
	import { Settings, type PlayerSizeMode } from "$lib/stores/settings";

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
		controlsRight?: Snippet<[]>;
		controlsLeft?: Snippet<[]>;
		video?: HTMLVideoElement;
	}

	let {
		class: className,
		videoClass,
		previous,
		next,
		children,
		time = $bindable(),
		loading,
		controlsRight,
		controlsLeft,
		video = $bindable(),
	}: Props = $props();

	let paused = $state(false);
	let duration = $state(0);
	let controlsOpacity = new Tween(0);
	let win = getCurrentWindow();
	let command: IconifyIcon | null = $state(null);
	let playbackRate = $state(1);
	let pointerOnControls = $state(false);
	let fitMenuOpen = $state(false);

	async function handleMove() {
		await controlsOpacity.set(1, { duration: 100, delay: 0, easing: easeEmphasizedDecel });
		if (pointerOnControls || fitMenuOpen) return;
		controlsOpacity.set(0, {
			duration: 300,
			delay: $Settings.playerSettings.controlsTimeout,
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

		$Settings.playerKeybinds.forEach(k => {
			if (k.keybind == e.key) {
				if ((k.whenAlt ?? false) != e.altKey) return;
				if ((k.whenShift ?? false) != e.shiftKey) return;
				if ((k.whenCtrl ?? false) != e.ctrlKey) return;

				switch (k.action) {
					case "time":
						time = Math.max(time + (k.units ?? 10), 0);
						switch (k.units) {
							case -5:
								command = Rewind5Icon;
								break;
							case -10:
								command = Rewind10Icon;
								break;
							case -30:
								command = Rewind30Icon;
								break;
							case 5:
								command = Forward5Icon;
								break;
							case 10:
								command = Forward10Icon;
								break;
							case 30:
								command = Forward30Icon;
								break;
							default:
								command = Math.sign(k.units ?? 0) == -1 ? RewindIcon : ForwardIcon;
								break;
						}
						break;
					case "volume":
						$Settings.playerSettings.volume = Math.max(
							Math.min($Settings.playerSettings.volume + (k.units ?? 10) / 100, 1),
							0,
						);

						command = Math.sign(k.units ?? 0) == -1 ? VolumeDownIcon : VolumeUpIcon;

						break;
					case "play":
						paused = false;
						command = PlayIcon;
						break;
					case "pause":
						paused = true;
						command = PauseIcon;
						break;
					case "togglepause":
						paused = !paused;
						command = paused ? PauseIcon : PlayIcon;
						break;
					case "fullscreen":
						fullscreen();
						command = FullscreenIcon;
						break;
				}

				preventDefault = false;
			}
		});

		if (preventDefault) {
			e.preventDefault();
		}
	}

	onMount(async () => {
		if ($Settings.playerSettings.autoFullscreen) {
			fullscreen();
		}

		if ($Settings.playerSettings.autoPlay) {
			paused = false;
			command = PauseIcon;
		} else {
			paused = true;
			command = PlayIcon;
		}
	});

	async function fullscreen() {
		let current = await win.isFullscreen();
		win.setFullscreen(!current);
		Topbar.update(t => ({ ...t, hidden: !current }));
	}

	let fitStyle = $derived.by(() => {
		switch ($Settings.playerSettings.sizeMode) {
			case "fill":
				return "object-fill";
			case "fit":
				return "object-fit";
			case "zoom":
				return "object-cover";
		}
	});

	function setSizeMode(mode: PlayerSizeMode) {
		$Settings.playerSettings.sizeMode = mode;
		fitMenuOpen = false;
	}
</script>

<svelte:body onkeydown={onKey} />

{#snippet controlButton(onClick: () => void, icon: IconifyIcon, tip: string, placement?: Placement)}
	<Tooltip {placement}>
		<Ripple {onClick}>
			<Icon {icon} size={24} />
		</Ripple>

		{#snippet tooltip()}
			<span>{tip}</span>
		{/snippet}
	</Tooltip>
{/snippet}

<div class="relative flex min-h-0 bg-black overflow-hidden {className}">
	<video
		class="flex-grow min-w-0 min-h-0 {fitStyle} {videoClass}"
		style:cursor={controlsOpacity.current === 0 ? "none" : "auto"}
		onmousemove={handleMove}
		onmousedown={handleMousedown}
		onended={next}
		controls={false}
		onloadstart={() => (loading = true)}
		onloadeddata={() => (loading = false)}
		bind:currentTime={time}
		bind:duration
		bind:paused
		bind:volume={$Settings.playerSettings.volume}
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
			<Icon icon={command ?? QuestionMarkIcon} size={24} />
		</div>
	{/key}

	{#if loading}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
			<CircularProgressEstimate />
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
			<div class="flex flex-row gap-2 items-center">
				{#if previous}
					{@render controlButton(previous, PreviousIcon, "Previous")}
				{/if}
				{@render controlButton(
					() => (paused = !paused),
					paused ? PlayIcon : PauseIcon,
					paused ? "Play" : "Pause",
				)}
				{#if next}
					{@render controlButton(next, NextIcon, "Next")}
				{/if}
				{@render controlsLeft?.()}

				<M2Slider
					bind:value={$Settings.playerSettings.volume}
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
				{@render controlsRight?.()}

				<Menu bind:open={fitMenuOpen}>
					<Tooltip>
						<Ripple onClick={() => (fitMenuOpen = !fitMenuOpen)}>
							<Icon icon={AspectRatioIcon} size={24} />
						</Ripple>

						{#snippet tooltip()}
							<span>Fit</span>
						{/snippet}
					</Tooltip>

					{#snippet menu()}
						<MenuItem onclick={() => setSizeMode("fill")}>Fill (stretched)</MenuItem>
						<MenuItem onclick={() => setSizeMode("fit")}>Fit (black bars)</MenuItem>
						<MenuItem onclick={() => setSizeMode("zoom")}>Zoom (zoomed in)</MenuItem>
					{/snippet}
				</Menu>

				{@render controlButton(fullscreen, FullscreenIcon, "Fullscreen", "left")}
			</div>
		</div>
	</div>
</div>
