import { NodeContextObj } from "../../nodes/context";

import { updateGraph } from "../../state/graphs";

export class GraphWatcher {
    public static observe(nodeContext: NodeContextObj) {
        const { editor, area, pathToGraph } = nodeContext;

        if (!editor || !area || !pathToGraph.length) return;

        editor.addPipe(async (context) => {
            if (
                (
                    [
                        "nodecreated",
                        "noderemoved",
                        "connectioncreated",
                        "connectionremoved",
                        "cleared",
                    ] as (typeof context.type)[]
                ).includes(context.type)
            ) {
                await updateGraph(editor, area, pathToGraph);
            }
            return context;
        });

        // TODO: debounce fast-firing events

        area.addPipe(async (context) => {
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                    "cleared",
                    "noderesized",
                    "nodedragged",
                    "nodetranslated",
                    "reordered",
                    "translated",
                    "zoomed",
                ].includes(context.type)
            ) {
                await updateGraph(editor, area, pathToGraph);
            }
            return context;
        });
    }
}
