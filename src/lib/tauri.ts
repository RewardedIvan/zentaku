import { invoke } from "@tauri-apps/api/core";

export interface FetchResponse {
	headers: Record<string, string>;
	status: number;
	body: string;
	json<T>(): T;
}

export async function fetch(
	method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH",
	url: string,
	headers?: Record<string, string>,
	body?: string,
): Promise<FetchResponse> {
	const res: FetchResponse = await invoke("fetch", { url, method, body, headers });
	res.json = () => {
		return JSON.parse(res.body);
	};
	return res;
}
