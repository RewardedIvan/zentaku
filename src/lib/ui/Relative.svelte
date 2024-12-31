<script lang="ts">
	import { formatDuration, fromUnixTime, interval, intervalToDuration } from "date-fns";
	import { onDestroy } from "svelte";

	interface Props {
		futureDate?: Date;
		futureUnix?: number;
	}

	let text = $state("");

	let { futureDate, futureUnix }: Props = $props();

	let intv = setInterval(() => {
		if (!futureDate && !futureUnix) {
			return;
		}

		let date = futureDate ?? fromUnixTime(futureUnix ?? 0);
		text = formatDuration(intervalToDuration(interval(new Date(), date)));
	}, 1000);

	onDestroy(() => {
		clearInterval(intv);
	});
</script>

{text}
