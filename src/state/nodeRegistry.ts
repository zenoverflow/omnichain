import axios from "axios";

import { EnvUtils } from "../util/EnvUtils";
import { StatefulObservable } from "../util/ObservableUtils";

import type { CustomNode } from "../data/typesCustomNodes";

export const nodeRegistryStorage = new StatefulObservable<
    Record<string, CustomNode>
>({});

export const loadNodeRegistry = async () => {
    try {
        const res = await axios.get(`${EnvUtils.baseUrl()}/api/node_registry`);
        nodeRegistryStorage.set(res.data);
    } catch (error) {
        // Handle error
        console.error("Failed to load node registry:", error);
    }
};
