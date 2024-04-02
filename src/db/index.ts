import Dexie, { Table } from "dexie";

export type SerializedNode = {
    nodeType: string;
    nodeId: string;
    controls: Record<string, any>;
    positionX: number;
    positionY: number;
};

export type SerializedGraph = {
    name: string;
    graphId: string;
    nodes: SerializedNode[];
    connections: any[];
    modules: Record<string, SerializedGraph>;
    zoom: number;
    areaX: number;
    areaY: number;
    created: number;
};

class _DB extends Dexie {
    chains!: Table<SerializedGraph>;

    constructor() {
        super("__db__");
        this.version(1).stores({
            chains: "graphId, name",
        });
    }
}

export const db = new _DB();
