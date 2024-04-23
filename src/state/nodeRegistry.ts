import { StatefulObservable } from "../util/ObservableUtils";
import { CustomNodeUtils } from "../util/CustomNodeUtils";
import * as NODE_MAKERS from "../nodes";

export const nodeRegistryStorage = new StatefulObservable<Record<string, any>>(
    {}
);

export const loadNodeRegistry = async () => {
    const registry = await CustomNodeUtils.consumeBackendRegistry();
    nodeRegistryStorage.set({
        ...NODE_MAKERS,
        ...registry,
    });
};
