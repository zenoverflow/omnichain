import { NodeContextObj } from "../../nodes/context";

export const FlowWatcher = {
    observe(nodeContext: NodeContextObj) {
        const { editor, control, dataflow, area } = nodeContext;

        if (!area) return;

        const removeFromFlow = (id: string) => {
            // Nodes might not be added to both flows
            try {
                control.remove(id);
            } catch (error) {
                console.error(error);
            }
            try {
                dataflow.remove(id);
            } catch (error) {
                console.error(error);
            }
        };

        editor.addPipe((context) => {
            if (context.type === "noderemoved") {
                removeFromFlow(context.data.id);
            }
            return context;
        });

        area.addPipe((context) => {
            if (context.type === "noderemoved") {
                removeFromFlow(context.data.id);
            }
            return context;
        });
    },
};
