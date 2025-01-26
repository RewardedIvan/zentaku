<script lang="ts">
	import { formatDuration, fromUnixTime, interval, intervalToDuration } from "date-fns";
	import { onDestroy } from "svelte";

	interface Props {
		futureDate?: Date;
		futureUnix?: number;
		short?: boolean;
		truncate?: number;
	}

	let text = $state("");

	let { futureDate, futureUnix, short, truncate }: Props = $props();

	function update() {
		if (!futureDate && !futureUnix) {
			return;
		}

		const dur = intervalToDuration(
			interval(new Date(), futureDate ?? fromUnixTime(futureUnix ?? 0)),
		);

		if (short) {
			text = Object.entries(dur)
				.map(([k, v]) => {
					if (v > 0) {
						return `${v}${k[0]}`;
					}
				})
				.join(", ");
		} else {
			text = formatDuration(dur);
		}

		if (truncate) {
			text = text.substring(0, truncate);
		}
	}

	update();

	let intv = setInterval(update, 1000);
	onDestroy(() => {
		clearInterval(intv);
	});
</script>

{text}
