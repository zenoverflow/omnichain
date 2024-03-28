import { Presets } from "rete-react-plugin";

import { CustomNode, StyledSocket } from "./CustomNode";
import { makeColoredConnection } from "./CustomConnection";

import { renderControl } from "../../nodes/controls";
import { NodeContextObj } from "../../nodes/context";
import { MagneticConnection } from "./magconnection";

export class NodeCustomizer {
    public static presetForNodes(nodeContext: NodeContextObj) {
        const { editor } = nodeContext;

        return Presets.classic.setup({
            customize: {
                node() {
                    return CustomNode;
                },
                control(context) {
                    return renderControl(context.payload);
                },
                socket() {
                    return StyledSocket;
                },
                connection(context) {
                    const connection = context.payload;

                    if ((connection as any).isMagnetic) {
                        return MagneticConnection;
                    }

                    const sourceNode = editor.getNode(connection.source);
                    const targetNode = editor.getNode(connection.target);

                    const output =
                        sourceNode &&
                        (sourceNode.outputs as Record<string, any>)[
                            connection.sourceOutput
                        ];
                    const input =
                        targetNode &&
                        (targetNode.inputs as Record<string, any>)[
                            connection.targetInput
                        ];

                    const source = output?.socket;
                    const target = input?.socket;

                    return makeColoredConnection(
                        target?.wireColor ?? source?.wireColor ?? "#f0f5ff"
                    );
                },
            },
        });
    }
}
