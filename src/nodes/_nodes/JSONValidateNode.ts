import { makeNode } from "./_Base";

const doc = [
    "Takes a string and attempts to parse it in order to validate it as JSON.",
    "If the string is valid JSON, the 'valid' output is triggered.",
    "Otherwise, the 'invalid' output is triggered.",
]
    .join(" ")
    .trim();

export const JSONValidateNode = makeNode(
    {
        nodeName: "JSONValidateNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 250],
        doc,
    },
    {
        inputs: [
            //
            { name: "triggerIn", type: "trigger", label: "trigger-in" },
            { name: "value", type: "string", label: "string (json)" },
        ],
        outputs: [
            { name: "valid", type: "trigger", label: "valid" },
            { name: "invalid", type: "trigger", label: "invalid" },
        ],
        controls: [],
    },
    {
        async controlFlow(nodeId, context) {
            try {
                const inputs = await context.fetchInputs(nodeId);
                const value = (inputs.value || [])[0] || "";

                try {
                    JSON.parse(value);
                    return "valid";
                } catch (error) {
                    return "invalid";
                }
            } catch (error) {
                console.error("--ERROR--\n", error);
                return "error";
            }
        },
    }
);
