import type { NodeEditor } from "rete";
import { Presets } from "rete-react-plugin";
import styled from "styled-components";

import { CustomNode, StyledSocket } from "./CustomNode";
import { makeColoredConnection } from "./CustomConnection";

import { NumberControl } from "../../nodes/_controls/NumberControl";
import { TextControl } from "../../nodes/_controls/TextControl";
import { SelectControl } from "../../nodes/_controls/SelectControl";

export const renderControl = (payload: any) => {
    const makers = [
        //
        NumberControl,
        TextControl,
        SelectControl,
    ];

    for (const Maker of makers) {
        if (payload instanceof Maker) {
            return payload.component();
        }
    }

    throw new Error(`Invalid renderControl payload ${JSON.stringify(payload)}`);
};

export const NodeCustomizer = {
    presetForNodes(editor: NodeEditor<any>) {
        return Presets.classic.setup({
            customize: {
                node() {
                    return CustomNode;
                },
                control(context) {
                    return renderControl(context.payload);
                },
                socket(data) {
                    const color = (data.payload as any).wireColor || "#fff";
                    return styled(StyledSocket)`
                        background: ${color};
                    `;
                },
                connection(context) {
                    const connection = context.payload;

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
    },
};
