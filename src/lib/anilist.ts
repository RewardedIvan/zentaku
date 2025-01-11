import { invoke } from "@tauri-apps/api/core";
import { format } from "date-fns";

interface Viewer {
	name: string;
	id: number;
	avatar: {
		full: string;
		medium: string;
	};
}

interface MediaListCollection {
	lists: List[];
}

export interface List {
	name: string;
	entries: {
		id: number;
		media: Media;
	}[];
}

export interface CharacterEdge {
	role: string;
	node: {
		id: number;
		image: {
			medium: string;
		};
		name: {
			full: string;
			native: string;
			userPreferred: string;
		};
	};
	voiceActors: {
		languageV2: string;
		id: number;
		name: {
			full: string;
			native: string;
			userPreferred: string;
		};
		image: {
			medium: string;
		};
	}[];
}

export interface Media {
	id: number;
	bannerImage: string;
	description: string;
	episodes: number;
	status: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
	nextAiringEpisode?: {
		episode: number;
		airingAt: number;
	};
	coverImage: {
		large: string;
		color: string;
	};
	genres: string[];
	title: Title;
	characters: {
		edges: CharacterEdge[];
	};
	recommendations: {
		nodes: {
			mediaRecommendation: Media;
		}[];
	};
}

export interface Character {
	age: string;
	bloodType: any;
	name: {
		userPreferred: string;
		alternative: string[];
		alternativeSpoiler: string[];
	};
	dateOfBirth: {
		day?: number;
		month?: number;
		year?: number;
	};
	favourites: number;
	image: {
		large: string;
	};
	isFavourite: boolean;
	description: string;
	siteUrl: string;
	gender: string;
	media: {
		edges: {
			id: number;
			characterRole: string;
			node: Media;
		}[];
	};
}

interface Title {
	userPreferred: string;
	romaji: string;
	english?: string;
}

interface ToggleFavourite {
	anime: {
		pageInfo: {
			total: number;
		};
	};
	manga: {
		pageInfo: {
			total: number;
		};
	};
	characters: {
		pageInfo: {
			total: number;
		};
	};
	staff: {
		pageInfo: {
			total: number;
		};
	};
	studios: {
		pageInfo: {
			total: number;
		};
	};
}

interface Query {
	data: {
		Viewer?: Viewer;
		MediaListCollection?: MediaListCollection;
		Media?: Media;
		Character?: Character;
		ToggleFavourite: ToggleFavourite;
	};
}

export async function getUserId() {
	const q = await invoke<Query>("graphql", {
		query: `
			query {
				Viewer {
					id
				}
			}
		`,
		variables: {},
	});

	return q.data.Viewer?.id;
}

export async function getProfile() {
	const q = await invoke<Query>("graphql", {
		query: `
			query {
				Viewer {
					name
					avatar {
						medium
					}
				}
			}
		`,
		variables: {},
	});

	return {
		name: q.data.Viewer?.name,
		avatar: q.data.Viewer?.avatar?.medium,
	};
}

export async function getMediaLists(type: "anime" | "manga") {
	const q = await invoke<Query>("graphql", {
		query: `
			query($type: MediaType!, $userId: Int!) {
				MediaListCollection(type: $type, userId: $userId) {
					lists {
						name
						entries {
							id
							media {
								id
								coverImage {
									large
									color
								}
								title {
									romaji
									english
								}
							}
						}
					}
				}
			}
		`,
		variables: {
			type: type.toUpperCase(),
			userId: await getUserId(),
		},
	});

	return q.data.MediaListCollection?.lists;
}

export async function getMedia(id: number) {
	const q = await invoke<Query>("graphql", {
		query: `
			query($id: Int!) {
				Media(id: $id) {
					id
					bannerImage
					description
					episodes
					status
					genres
					coverImage {
						large
						color
					}
					title {
						romaji
						english
					}
					nextAiringEpisode {
						episode
						airingAt
					}
					characters {
						edges {
							role
							node {
								id
								image {
									medium
								}
								name {
									userPreferred
									native
									full
								}
							}
							voiceActors {
								languageV2
								id
								name {
									userPreferred
									native
									full
								}
								image {
									medium
								}
							}
						}
					}
					recommendations {
						nodes {
							mediaRecommendation {
								id
								coverImage {
									large
								}
								title {
									romaji
									english
								}
							}
						}
					}
				}
			}
		`,
		variables: {
			id,
		},
	});

	return q.data.Media;
}

export interface ToggleFavouriteVariables {
	animeId?: number;
	mangaId?: number;
	characterId?: number;
	staffId?: number;
	studioId?: number;
}

export async function toggleFavourite(id: ToggleFavouriteVariables) {
	const q = await invoke<Query>("graphql", {
		query: `
			mutation (
				$animeId: Int
				$mangaId: Int
				$characterId: Int
				$staffId: Int
				$studioId: Int
			) {
				ToggleFavourite(
					animeId: $animeId
					mangaId: $mangaId
					characterId: $characterId
					staffId: $staffId
					studioId: $studioId
				) {
					anime {
						pageInfo {
							total
						}
					}
					manga {
						pageInfo {
							total
						}
					}
					characters {
						pageInfo {
							total
						}
					}
					staff {
						pageInfo {
							total
						}
					}
					studios {
						pageInfo {
							total
						}
					}
				}
			}
		`,
		variables: id,
	});

	return q.data.ToggleFavourite;
}

export async function getCharacter(id: number) {
	const q = await invoke<Query>("graphql", {
		query: `
			query($id: Int!) {
				Character(id: $id) {
					age
					bloodType
					name {
						userPreferred
						alternative
						alternativeSpoiler
					}
					dateOfBirth {
						day
						month
						year
					}
					favourites
					image {
						large
					}
					isFavourite
					description
					siteUrl
					gender

					media {
						edges {
							id
							characterRole
							node {
								id
								title {
									english
									romaji
								}
								coverImage {
									large
								}
							}
						}
					}
				}
			}
		`,
		variables: {
			id,
		},
	});

	return q.data.Character;
}

export function formatDate(date: { year?: number; month?: number; day?: number }) {
	const jsDate = new Date(date.year ?? 0, (date.month ?? 0) - 1, date.day ?? 0);
	let res = "";

	if (date.month) {
		res += format(jsDate, "MMM");
	}
	if (date.day) {
		if (res.length) res += " ";
		res += format(jsDate, "do");
	}
	if (date.year) {
		if (res.length) res += " ";
		res += format(jsDate, "yyyy");
	}

	return res;
}
