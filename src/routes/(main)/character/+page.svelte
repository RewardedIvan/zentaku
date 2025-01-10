<script lang="ts">
	import { CircularProgressIndeterminate, Icon } from "m3-svelte";
	import { page } from "$app/state";
	import { format } from "date-fns";
	import { getCharacter, type Character } from "$lib/anilist";

    import MediaC from "../Media.svelte";
	import Favourite from "$lib/ui/Favourite.svelte";
	import Spoiler from "$lib/ui/Spoiler.svelte";
	import Markdown from "$lib/ui/Markdown.svelte";

    function formatBirthday(birthday: { year?: number, month?: number, day?: number }) {
        const date = new Date(birthday.year ?? 0, (birthday.month ?? 0) - 1, birthday.day);
        let res = "";

        if (birthday.month) {
            res += format(date, "MMM");
        }
        if (birthday.day) {
            if (res.length) res += " ";
            res += format(date, "do");
        }
        if (birthday.year) {
            if (res.length) res += " ";
            res += format(date, "yyyy");
        }
        
        return res;
    }
</script>

{#await getCharacter(parseInt(page.url.searchParams.get("id") ?? ""))}
    <CircularProgressIndeterminate />
{:then character}
    {#if character}
        {@render main(character)}
    {/if}
{/await}

{#snippet main(character: Character)}
    <div class="flex flex-col gap-2 bg-surface-container p-2 overflow-hidden">
        <div class="flex flex-row gap-1">
            <img src={character.image.large} alt={character.name.userPreferred} class="rounded" />
            <div class="flex flex-col w-full">
                <div class="flex flex-row justify-between">
                    <div class="flex flex-row items-end gap-1">
                        <span class="font-afacad-flux text-4xl text-primary underline underline-offset-4">{character.name.userPreferred}</span>
                        <span class="font-afacad-flux text-lg text-secondary underline underline-offset-4">{character.name.alternative.join(", ")}</span>

                        {#each character.name.alternativeSpoiler as spoiler}
                            <span class="font-afacad-flux text-lg text-secondary">,</span>

                            <Spoiler tooltipPlacement="bottom">
                                {#snippet content(shown: boolean)}
                                    <span class="font-afacad-flux text-lg text-secondary underline underline-offset-4" class:invisible={!shown}>
                                        {spoiler}
                                    </span>
                                {/snippet}
                            </Spoiler>
                        {/each}
                    </div>

                    <Favourite
                        id={{ characterId: parseInt(page.url.searchParams.get("id") ?? "") }}
                        initial={character.isFavourite}
                    />
                </div>

                {#snippet stat(name: string, value: string)}
                    <span>
                        <b class="text-primary">{name}:</b> <span class="text-secondary">{value}</span>
                    </span>
                {/snippet}
                
                {#if character.dateOfBirth && !(!character.dateOfBirth.day && !character.dateOfBirth.month && !character.dateOfBirth.year )}
                    {@render stat("Birthday", formatBirthday(character.dateOfBirth))}
                {/if}
                {#if character.age} {@render stat("Age", character.age)} {/if}
                {#if character.gender} {@render stat("Gender", character.gender)} {/if}
                {#if character.bloodType} {@render stat("Blood Type", character.bloodType)} {/if}

                <Markdown md={character.description} />
            </div>
        </div>

        <p class="font-afacad-flux text-2xl">
            Featured in
        </p>

        <div class="grid grid-flow-col justify-start overflow-x-auto overflow-y-hidden">
            {#each character.media.edges as r}
                <MediaC media={r.node} />
            {/each}
        </div>
    </div>
{/snippet}