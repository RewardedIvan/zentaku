<script lang="ts">
	import Spoiler from "./Spoiler.svelte";

	interface Props {
		md: string;
	}

	let { md }: Props = $props();

	// did i neeeed to make a parser for it? no..
	// did i waant to? yes.

	interface Token {
		type: "text" | "bold" | "italic" | "newline" | "spoiler";
		value: string;
		index: number;
	}

	type TokenType = Token["type"];

	let tokenized = $derived.by(() => {
		let tokens: Token[] = [];

		let currentRawText = "";
		let currentRawTextStart = 0;
		let i = 0;

		const emptyCurrentRawText = () => {
			if (currentRawText.length > 0) {
				tokens.push({
					value: currentRawText,
					type: "text",
					index: currentRawTextStart,
				});
				currentRawText = "";
			}
		};

		while (i < md.length) {
			const ifMatched = (regex: RegExp, fn: (matched: string) => Token | undefined) => {
				const match = md.substring(i).match(regex);

				if (!match) {
					return undefined;
				}

				return fn(match[0]);
			};

			const regexes: Record<TokenType, RegExp> = {
				bold: /^(__|\*\*)/,
				italic: /^(_|\*)/,
				newline: /^( {0,}\n)/,
				spoiler: /^(~!|!~)/,
				text: /$a/, // will never match, i handle it later
			};

			let matched: Token | undefined = undefined;

			Object.entries(regexes).forEach(([type, regex]) => {
				if (!matched) {
					matched = ifMatched(regex, m => {
						i += m.length;
						return {
							value: m,
							type: type as TokenType,
							index: i - m.length,
						};
					});
				}
			});

			if (matched) {
				emptyCurrentRawText();
				tokens.push(matched);
			} else {
				if (currentRawText.length == 0) {
					currentRawTextStart = i;
				}

				currentRawText += md.charAt(i);
				i += 1;
			}
		}

		emptyCurrentRawText();
		return tokens;
	});

	interface MarkdownNode {
		type: "markdown";
		children: Node[];
		parent: null;
	}

	interface ModifierNode {
		type: "bold" | "italic" | "spoiler";
		children: Node[];
		parent: BranchNode;
	}

	interface NewlineNode {
		type: "newline";
	}

	interface TextNode {
		type: "text";
		text: string;
	}

	type BranchNode = MarkdownNode | ModifierNode;
	type Node = BranchNode | NewlineNode | TextNode;

	let parsed = $derived.by(() => {
		let tree: Node = { type: "markdown", children: [], parent: null };

		let textModifierStack: Token["type"][] = [];
		// just hope javascript doesn't make a copy
		let currentBranchRef: BranchNode = tree;

		tokenized.forEach(t => {
			if (t.type == "text") {
				currentBranchRef.children.push({
					type: "text",
					text: t.value,
				});
			} else if (t.type == "bold" || t.type == "italic" || t.type == "spoiler") {
				const lastTextModifier = textModifierStack[textModifierStack.length - 1];
				if (lastTextModifier == t.type) {
					textModifierStack.pop();
					if (currentBranchRef.parent) {
						currentBranchRef = currentBranchRef.parent;
					}
				} else {
					let newNode = {
						type: t.type,
						children: [],
						parent: currentBranchRef,
					};

					textModifierStack.push(t.type);
					// pray that javascript doesn't make a copy while pushing too
					currentBranchRef.children.push(newNode);
					currentBranchRef = newNode;
				}
			} else if (t.type == "newline") {
				currentBranchRef.children.push({
					type: "newline",
				});
			}
		});

		return tree;
	});
</script>

{#snippet renderNode(node: Node)}
	{#if node.type == "markdown"}
		<div>
			{#each node.children as child}
				{@render renderNode(child)}
			{/each}
		</div>
	{:else if node.type == "bold"}
		{#each node.children as child}
			<b>{@render renderNode(child)}</b>
		{/each}
	{:else if node.type == "italic"}
		{#each node.children as child}
			<i>{@render renderNode(child)}</i>
		{/each}
	{:else if node.type == "spoiler"}
		<Spoiler>
			{#snippet content(shown: boolean)}
				<span class:invisible={!shown}>
					{#each node.children as child}
						{@render renderNode(child)}
					{/each}
				</span>
			{/snippet}
		</Spoiler>
	{:else if node.type == "text"}
		<span>{node.text}</span>
	{:else if node.type == "newline"}
		<br />
	{/if}
{/snippet}

{@render renderNode(parsed)}
