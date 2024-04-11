import { atom } from "jotai";

import { appStore } from ".";
import { ApiKeyUtils } from "../util/ApiKeyUtils";
import { db } from "../db";
import { ApiKey } from "../db/data";

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

export const createApiKey = async (name = "New Key") => {
    const s = appStore.get(_apiKeyStorageAtom);
    const created: ApiKey = ApiKeyUtils.empty(name);
    const id = created.apiKeyId;
    appStore.set(_apiKeyStorageAtom, {
        ...s,

        [id]: created,
    });
    await db.apiKeys.add(created);
};

export const updateApiKeyName = async (apiKeyId: string, name: string) => {
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
    await db.apiKeys.put(update);
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
    await db.apiKeys.put(update);
};

export const deleteApiKey = async (apiKeyId: string) => {
    const s = appStore.get(_apiKeyStorageAtom);

    appStore.set(
        _apiKeyStorageAtom,
        Object.fromEntries(
            Object.entries(s).filter(([id, _]) => id !== apiKeyId)
        )
    );
    await db.apiKeys.delete(apiKeyId);
};
