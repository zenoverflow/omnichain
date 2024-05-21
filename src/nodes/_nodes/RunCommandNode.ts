import { exec } from "child_process";

import { makeNode } from "./_Base";

const doc = [
    //
    "Runs a system command using child_process.exec and returns",
    "the result as a JSON string in the format",
    "{errors: string[], output: string}.",
    "Note that there may be errors (from stderr) even if the",
    "command runs successfully. Note that any error from the",
    "code itself will also be caught and included in the errors array.",
]
    .join(" ")
    .trim();

export const RunCommandNode = makeNode(
    {
        nodeName: "RunCommandNode",
        nodeIcon: "CodeOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            {
                name: "command",
                type: "string",
                label: "command (string)",
            },
        ],
        outputs: [
            //
            {
                name: "result",
                type: "string",
                label: "result (json)",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);

                const cmd = (inputs.command || [])[0];

                if (!cmd?.length) {
                    throw new Error("Missing command input!");
                }

                const errors: string[] = [];
                let output = "";

                await new Promise((resolve) => {
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            errors.push(error.message);
                            resolve(null);
                            return;
                        }
                        if (stderr) {
                            errors.push(stderr);
                        }
                        output = stdout;
                        resolve(null);
                    });
                });

                return {
                    result: JSON.stringify(
                        {
                            errors,
                            output,
                        },
                        null,
                        2
                    ),
                };
            } catch (error: any) {
                return {
                    result: JSON.stringify(
                        {
                            errors: [error.message],
                            output: "",
                        },
                        null,
                        2
                    ),
                };
            }
        },
    }
);
