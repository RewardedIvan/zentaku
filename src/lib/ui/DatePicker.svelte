<script lang="ts">
	import Menu from "./Menu.svelte";
	import { Button, DatePickerDocked } from "m3-svelte";
	import { UTCDate } from "@date-fns/utc";

	interface Props {
		fuzzyDateInt: number;
		name: string;
	}

	let { fuzzyDateInt = $bindable(), name }: Props = $props();

	let open = $state(false);

	let date = {
		get value() {
			return new UTCDate(
				Math.trunc(fuzzyDateInt / 10000),
				Math.trunc((fuzzyDateInt % 10000) / 100) - 1,
				fuzzyDateInt % 100,
			);
		},
		set value(v) {
			fuzzyDateInt = v.getUTCFullYear() * 10000 + (v.getUTCMonth() + 1) * 100 + v.getUTCDate();
		},
	};

	function changeDate(val: string) {
		date.value = new UTCDate(val);
		open = false;
	}
</script>

<Menu bind:open>
	<Button variant="tonal" onclick={() => (open = !open)}>
		{name}
		{date.value.toLocaleDateString()}
	</Button>

	{#snippet menu()}
		<DatePickerDocked
			setDate={changeDate}
			clearable={false}
			close={() => (open = false)}
			focusedMonth={date.value.getMonth()}
			focusedYear={date.value.getFullYear()}
		/>
	{/snippet}
</Menu>
