import { v4 as uuidv4 } from "uuid";

import type { ApiKey } from "../data/types";

export const ApiKeyUtils = {
    empty(name: string): ApiKey {
        return {
            apiKeyId: uuidv4(),
            created: Date.now(),
            name,
            content: "",
        };
    },
};
