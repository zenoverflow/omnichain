import { v4 as uuidv4 } from "uuid";
import { ApiKey } from "../db/data";

export class ApiKeyUtils {
    public static empty(name: string): ApiKey {
        return {
            apiKeyId: uuidv4(),
            created: Date.now(),
            name,
            content: "",
        };
    }
}
