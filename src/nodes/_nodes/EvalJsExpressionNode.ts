import { makeNode } from "./_Base";

const doc = [
    //
    "Evaluate a JavaScript expression.",
    "If the 'in' input is used, an expression can be passed in.",
    "Params inside the expression can be accessed via the 'params' object.",
    "All params are passed as strings, so you may need to parse them if you need a different type.",
    "The result is always returned as a string.",
    "Note that this node only supports evaluation of a single expression.",
    "To write complex code, use the EvalJsCode node.",
]
    .join(" ")
    .trim();

export const EvalJsExpressionNode = makeNode(
    {
        nodeName: "EvalJsExpressionNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 510],
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

            const oldValue = context.getAllControls(nodeId).val as string;
            const expr = (inputs.in || [])[0] || oldValue;

            // Update graph if necessary
            if (expr !== oldValue) {
                await context.updateControl(nodeId, "val", expr);
            }

            const stringifyParamValue = (p: any) => {
                if (typeof p === "string") {
                    return '"' + p + '"';
                } else {
                    return `${p}`;
                }
            };

            const params = inputs.params || [];
            const paramString = params
                .map((p) => p.name + ": " + stringifyParamValue(p.value))
                .join(", ");
            const paramObj = `{ ${paramString} }`;

            try {
                const result = eval(
                    `(function(params) { return (${expr}); })(${paramObj})`
                );

                return { result: `${result}` };
            } catch (error) {
                return { result: `${error}` };
            }
        },
    }
);
