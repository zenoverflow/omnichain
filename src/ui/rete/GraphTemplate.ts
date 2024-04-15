import { StartNode } from "../../nodes";
import { NodeContextObj } from "../../nodes/context";

export class GraphTemplate {
    public static async empty(context: NodeContextObj) {
        await context.editor.addNode(new StartNode(context));
    }
}
