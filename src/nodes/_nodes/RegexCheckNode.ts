import { makeNode } from "./_Base";

const doc = [
    "Checks if the input data matches the regex pattern.",
    "If it does, the node will fire the 'pass' output.",
    "If it doesn't, the node will fire the 'fail' output.",
]
    .join(" ")
    .trim();

export const RegexCheckNode = makeNode(
    {
        nodeName: "RegexCheckNode",
        nodeIcon: "CodeOutlined",
        dimensions: [580, 620],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "dataIn", type: "string", label: "data in" },
        ],
        outputs: [
            { name: "pass", type: "trigger", label: "pass" },
            { name: "fail", type: "trigger", label: "fail" },
        ],

        controlsOverride: {
            regex: "regex",
        },
        controls: [
            {
                name: "regex",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        large: true,
                    },
                },
            },
        ],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const controls = context.getControlsWithOverride(
                    nodeId,
                    inputs
                );

                const regexRaw = controls.regex as string;

                if (!regexRaw.length) {
                    throw new Error("Missing regex pattern!");
                }

                const regex = new RegExp(regexRaw);

                const data = (inputs.dataIn || [])[0] || "";

                if (regex.test(data)) {
                    return "pass";
                }

                return "fail";
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);
