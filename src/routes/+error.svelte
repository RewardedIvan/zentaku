<script lang="ts">
	import { Button, Card } from "m3-svelte";

	import { page } from "$app/state";
	import { goto } from "$app/navigation";
</script>

<div class="flex flex-col items-center gap-2">
	<Card variant="filled">{page.status} {page.error?.message}</Card>

	<div class="flex flex-row gap-1">
		<Button variant="text" onclick={() => window.history.back()}>Go back?</Button>
		<Button variant="text" onclick={() => goto("/")}>Go home?</Button>
		<Button variant="text" onclick={() => window.location.reload()}>Reload?</Button>
	</div>
</div>
