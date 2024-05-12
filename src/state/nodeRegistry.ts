import { StatefulObservable } from "../util/ObservableUtils";
import { CustomNodeUtils } from "../util/CustomNodeUtils";
import * as NODE_MAKERS from "../nodes";
import type { CustomNode } from "../nodes/_nodes/_Base";

export const nodeRegistryStorage = new StatefulObservable<
    Record<string, CustomNode>
>({});

export const loadNodeRegistry = async () => {
    const registry = await CustomNodeUtils.consumeBackendRegistry();
    nodeRegistryStorage.set({
        ...NODE_MAKERS,
        ...registry,
    });
};
