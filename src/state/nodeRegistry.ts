import { EnvUtils } from "../util/EnvUtils";
import { StatefulObservable } from "../util/ObservableUtils";

import type { CustomNode } from "../data/typesCustomNodes";

export const nodeRegistryStorage = new StatefulObservable<
    Record<string, CustomNode>
>({});

export const loadNodeRegistry = async () => {
    const res = await fetch(`${EnvUtils.baseUrl()}/api/node_registry`);
    nodeRegistryStorage.set(await res.json());
};
