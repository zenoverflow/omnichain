import { atom } from "jotai";

import { appStore } from ".";
import { ApiKeyUtils } from "../util/ApiKeyUtils";
import { ApiKey, db } from "../db";

const _apiKeyStorageAtom = atom<Record<string, ApiKey>>({});

export const apiKeyStorageAtom = atom((get) => ({
    ...get(_apiKeyStorageAtom),
}));

export const loadApiKeysFromDb = async () => {
    appStore.set(
        _apiKeyStorageAtom,
        Object.fromEntries(
            (await db.apiKeys.toArray()).map((c) => [c.apiKeyId, c])
        )
    );
};

export const createApiKey = (name: string = "New Key"): void => {
    const s = appStore.get(_apiKeyStorageAtom);
    const created: ApiKey = ApiKeyUtils.empty(name);
    const id = created.apiKeyId;
    appStore.set(_apiKeyStorageAtom, {
        ...s,

        [id]: created,
    });
    db.apiKeys.add(created);
};

export const updateApiKeyName = (apiKeyId: string, name: string) => {
    const s = appStore.get(_apiKeyStorageAtom);
    const target = s[apiKeyId];

    const update: ApiKey = {
        ...target,
        name,
    };

    appStore.set(_apiKeyStorageAtom, {
        ...s,
        [apiKeyId]: update,
    });
    db.apiKeys.put(update);
};

export const updateApiKeyContent = async (
    apiKeyId: string,
    content: string
) => {
    const s = appStore.get(_apiKeyStorageAtom);
    const target = s[apiKeyId];

    const update: ApiKey = {
        ...target,
        content,
    };

    appStore.set(_apiKeyStorageAtom, {
        ...s,
        [apiKeyId]: update,
    });
    db.apiKeys.put(update);
};

export const deleteApiKey = (apiKeyId: string) => {
    const s = appStore.get(_apiKeyStorageAtom);

    appStore.set(
        _apiKeyStorageAtom,
        Object.fromEntries(
            Object.entries(s).filter(([id, _]) => id !== apiKeyId)
        )
    );
    db.apiKeys.delete(apiKeyId);
};
