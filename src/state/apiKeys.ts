import { StatefulObservable } from "../util/ObservableUtils";
import { ApiKeyUtils } from "../util/ApiKeyUtils";
import { QueueUtils } from "../util/QueueUtils";
import { BackendResourceUtils } from "../util/BackendResourceUtils";
import { ApiKey } from "../data/types";

export const apiKeyStorage = new StatefulObservable<Record<string, ApiKey>>({});

export const loadApiKeys = async () => {
    apiKeyStorage.set(await BackendResourceUtils.getSingle("apiKeys"));
};

const saveApiKeys = async () => {
    await BackendResourceUtils.setSingle("apiKeys", apiKeyStorage.get());
};

// ACTIONS //

export const createApiKey = (name = "New Key") => {
    QueueUtils.addTask(async () => {
        const created: ApiKey = ApiKeyUtils.empty(name);
        apiKeyStorage.set({
            ...apiKeyStorage.get(),
            [created.apiKeyId]: created,
        });
        await saveApiKeys();
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
        await saveApiKeys();
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
        await saveApiKeys();
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
        await saveApiKeys();
    });
};
