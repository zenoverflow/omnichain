import type { CustomNode } from "../data/typesCustomNodes";

import { StatefulObservable } from "../util/ObservableUtils";
import { CustomNodeUtils } from "../util/CustomNodeUtils";

export const nodeRegistryStorage = new StatefulObservable<
    Record<string, CustomNode>
>({});

export const loadNodeRegistry = async () => {
    nodeRegistryStorage.set(await CustomNodeUtils.consumeBackendRegistry());
};
