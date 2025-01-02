import { type Writable, type Subscriber, type Updater } from "svelte/store";

export function createStoreLocalStorage<T>(name: string, defaultValue: T): Writable<T> {
	let subscribers: Set<[Subscriber<T>, (() => void) | undefined]> = new Set();

	const inform = (v: T) => {
		subscribers.forEach(([sub, invalidate]) => {
			invalidate?.();
			sub(v);
		});
	};

	return {
		set(v: T) {
			localStorage.setItem(name, JSON.stringify(v));
			inform(v);
		},

		update(updater: Updater<T>) {
			let val = localStorage.getItem(name);
			let newVal = updater(val ? JSON.parse(val) : defaultValue);

			localStorage.setItem(name, JSON.stringify(newVal));
			inform(newVal);
		},

		subscribe(s: Subscriber<T>, invalidate?: () => void) {
			subscribers.add([s, invalidate]);

			let v = localStorage.getItem(name);
			inform(v ? JSON.parse(v) : defaultValue);

			return () => {
				subscribers.delete([s, invalidate]);
			};
		},
	};
}
