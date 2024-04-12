import { atom } from "jotai";

import { appStore } from ".";
import { ApiKeyUtils } from "../util/ApiKeyUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ApiKey } from "../data/types";

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

// ACTIONS //

export const createApiKey = (name = "New Key") => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_apiKeyStorageAtom);
        const created: ApiKey = ApiKeyUtils.empty(name);
        const id = created.apiKeyId;
        appStore.set(_apiKeyStorageAtom, {
            ...s,

            [id]: created,
        });
        await db.apiKeys.add(created);
    });
};

export const updateApiKeyName = (apiKeyId: string, name: string) => {
    QueueUtils.addTask(async () => {
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
    });
};

export const updateApiKeyContent = (apiKeyId: string, content: string) => {
    QueueUtils.addTask(async () => {
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
    });
};

export const deleteApiKey = (apiKeyId: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_apiKeyStorageAtom);

        appStore.set(
            _apiKeyStorageAtom,
            Object.fromEntries(
                Object.entries(s).filter(([id, _]) => id !== apiKeyId)
            )
        );
        await db.apiKeys.delete(apiKeyId);
    });
};
