<script lang="ts">
	import { Button, Card } from "m3-svelte";

	import { page } from "$app/state";
	import { goto } from "$app/navigation";
</script>

<div class="flex flex-col items-center gap-2">
    <Card type="filled">{page.status} {page.error?.message}</Card>

    <div class="flex flex-row gap-1">
        <Button type="text" on:click={() => window.history.back()}>Go back?</Button>
        <Button type="text" on:click={() => goto("/")}>Go home?</Button>
    </div>
</div>