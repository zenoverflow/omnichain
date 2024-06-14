import { createRequire } from "module";

import { makeNode } from "./_Base";

const doc = [
    //
    "Evaluate JavaScript code (multiline).",
    "If the 'in' input is used, an expression can be passed in.",
    "Params inside the code can be accessed via the '__params' object.",
    "All params are passed as strings, so you may need to parse them if you need a different type.",
    "The result is always returned as a string.",
    "The id of the node and the flow context object are also available",
    "to your code as '__nodeId' and '__context', making this node a simple alternative",
    "to implementing a full custom node if dataflow is all you need.",
]
    .join(" ")
    .trim();

export const EvalJsCodeNode = makeNode(
    {
        nodeName: "EvalJsCodeNode",
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
            const codeStr = (inputs.in || [])[0] || oldValue;

            // Update graph if necessary
            if (codeStr !== oldValue) {
                await context.updateControl(nodeId, "val", codeStr);
            }
            const params = inputs.params || [];

            const paramObj = Object.fromEntries(
                params.map((p) => [p.name, p.value])
            );

            try {
                const require = createRequire(import.meta.url);

                let result = "";

                const fakeConsole = {
                    log: (...msg: any[]) => {
                        try {
                            result += `${msg.join(" ")}\n`;
                        } catch (error) {
                            console.error(error);
                        }
                    },
                    error: (...msg: any[]) => {
                        try {
                            result += `${msg.join(" ")}\n`;
                        } catch (error) {
                            console.error(error);
                        }
                    },
                    warn: (...msg: any[]) => {
                        try {
                            result += `${msg.join(" ")}\n`;
                        } catch (error) {
                            console.error(error);
                        }
                    },
                };

                const evalResult = eval(
                    `(function(_params, _nodeId, _context, _require, console) { ${codeStr} })`
                )(paramObj, nodeId, context, require, fakeConsole);

                if (evalResult) {
                    if (result.length > 0) {
                        result += "\n";
                    }
                    result +=
                        typeof evalResult === "string" ||
                        typeof evalResult === "number"
                            ? `${evalResult}`
                            : JSON.stringify(evalResult);
                }

                if (controls.clearOnEval === "true") {
                    await context.updateControl(nodeId, "val", "");
                }

                return { result };
            } catch (error) {
                return { result: `${error}` };
            }
        },
    }
);
