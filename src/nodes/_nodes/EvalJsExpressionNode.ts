import { createRequire } from "module";

import { makeNode } from "./_Base";

const doc = [
    //
    "Evaluate a JavaScript expression.",
    "If the 'in' input is used, an expression can be passed in.",
    "Params inside the expression can be accessed via the '_params' object.",
    "All params are passed as strings, so you may need to parse them if you need a different type.",
    "The result is always returned as a string.",
    "The id of the node and the flow context object are also available",
    "to your code as '_nodeId' and '_context', making this node a simple alternative",
    "to implementing a full custom node if dataflow is all you need.",
    "Note that this node only supports evaluation of a single expression.",
    "To write complex code, use the EvalJsCode node.",
]
    .join(" ")
    .trim();

export const EvalJsExpressionNode = makeNode(
    {
        nodeName: "EvalJsExpressionNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 560],
        doc,
    },
    {
        inputs: [
            //
            { name: "in", type: "string", label: "in" },
            { name: "params", type: "slot", label: "params", multi: true },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result" },
        ],
        controls: [
            {
                name: "clearOnEval",
                control: {
                    type: "select",
                    defaultValue: "false",
                    config: {
                        label: "Clear on eval",
                        values: [
                            { value: "true", label: "true" },
                            { value: "false", label: "false" },
                        ],
                    },
                },
            },
            {
                name: "val",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        large: true,
                        modalSyntaxHighlight: "javascript",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = (await context.fetchInputs(nodeId)) as {
                in?: string[];
                params?: {
                    name: string;
                    value: string;
                }[];
            };
            const controls = context.getAllControls(nodeId);

            const oldValue = controls.val as string;
            const expr = (inputs.in || [])[0] || oldValue;

            // Update graph if necessary
            if (expr !== oldValue) {
                await context.updateControl(nodeId, "val", expr);
            }

            const params = inputs.params || [];

            const paramObj = Object.fromEntries(
                params.map((p) => [p.name, p.value])
            );

            try {
                const require = createRequire(import.meta.url);
                const result = eval(
                    `(function(_params, _nodeId, _context, _require) { return (${expr}); })`
                )(paramObj, nodeId, context, require);

                if (controls.clearOnEval === "true") {
                    await context.updateControl(nodeId, "val", "");
                }

                return {
                    result:
                        typeof result === "string" || typeof result === "number"
                            ? `${result}`
                            : JSON.stringify(result),
                };
            } catch (error) {
                return { result: `${error}` };
            }
        },
    }
);
