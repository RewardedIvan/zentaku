<script lang="ts">
	import { Slider, Switch, TextField } from "m3-svelte";

	interface Props {
		defaultSettings: any;
		key: string;
		value: any;
		open: boolean;
		onChange: (key: string, value: any) => void;
	}

	let { defaultSettings, key, value: saved, onChange, open }: Props = $props();

	const keyFormatted = key
		.split("_")
		.map(s => s[0].toUpperCase() + s.slice(1))
		.join(" ");

	let value = $state(saved);

	// when the value changes, inform the parent
	$effect(() => {
		if (open) {
			onChange(key, value);
		}
	});

	$effect(() => {
		if (!open && value != saved) {
			value = JSON.parse(JSON.stringify(saved));
		}
	});
</script>

{#if typeof value === "string"}
	{#if defaultSettings[`_${key}_regex`] !== undefined}
		<TextField
			label={keyFormatted}
			bind:value
			error={!defaultSettings[`_${key}_regex`].test(value)}
		/>
		{#if !defaultSettings[`_${key}_regex`].test(value)}
			<span class="text-error">
				regex: <code class="bg-surface">{defaultSettings[`_${key}_regex`]}</code>
			</span>
		{/if}
	{:else}
		<TextField label={key} bind:value />
	{/if}
{:else if typeof value === "number"}
	{#if defaultSettings[`_${key}_range`] !== undefined}
		<div class="flex flex-row items-center">
			<span class="mr-auto">{keyFormatted}</span>
			{#key open}
				<Slider
					bind:value
					min={defaultSettings[`_${key}_range`][0]}
					max={defaultSettings[`_${key}_range`][1]}
					step={1}
				/>
			{/key}
		</div>
	{:else}
		<TextField label={keyFormatted} bind:value={value as unknown as string} type="number" />
	{/if}
{:else if typeof value === "boolean"}
	<div class="flex flex-row items-center">
		<span class="mr-auto">{keyFormatted}</span>
		<label for={null}>
			<Switch bind:checked={value} />
		</label>
	</div>
{/if}
