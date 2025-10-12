import { createStoreLocalStorage } from "./localstorage";

export const SourceSettings = createStoreLocalStorage<Record<string, any>>("sourceSettings", {});
export const TrustStore = createStoreLocalStorage<Record<string, string>>("sourceTrust", {});
