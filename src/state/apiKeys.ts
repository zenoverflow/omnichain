import { StatefulObservable } from "../util/ObservableUtils";
import { ApiKeyUtils } from "../util/ApiKeyUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ApiKey } from "../data/types";

export const apiKeyStorage = new StatefulObservable<Record<string, ApiKey>>({});

export const loadApiKeysFromDb = async () => {
    apiKeyStorage.set(
        Object.fromEntries(
            (await db.apiKeys.toArray()).map((c) => [c.apiKeyId, c])
        )
    );
};

// ACTIONS //

export const createApiKey = (name = "New Key") => {
    QueueUtils.addTask(async () => {
        const created: ApiKey = ApiKeyUtils.empty(name);
        apiKeyStorage.set({
            ...apiKeyStorage.get(),
            [created.apiKeyId]: created,
        });
        await db.apiKeys.add(created);
    });
};

export const updateApiKeyName = (apiKeyId: string, name: string) => {
    QueueUtils.addTask(async () => {
        const storage = apiKeyStorage.get();
        const target = storage[apiKeyId];

        const update: ApiKey = {
            ...target,
            name,
        };

        apiKeyStorage.set({
            ...storage,
            [apiKeyId]: update,
        });
        await db.apiKeys.put(update);
    });
};

export const updateApiKeyContent = (apiKeyId: string, content: string) => {
    QueueUtils.addTask(async () => {
        const storage = apiKeyStorage.get();
        const target = storage[apiKeyId];

        const update: ApiKey = {
            ...target,
            content,
        };

        apiKeyStorage.set({
            ...storage,
            [apiKeyId]: update,
        });
        await db.apiKeys.put(update);
    });
};

export const deleteApiKey = (apiKeyId: string) => {
    QueueUtils.addTask(async () => {
        apiKeyStorage.set(
            Object.fromEntries(
                Object.entries(apiKeyStorage.get()).filter(
                    ([id]) => id !== apiKeyId
                )
            )
        );
        await db.apiKeys.delete(apiKeyId);
    });
};
