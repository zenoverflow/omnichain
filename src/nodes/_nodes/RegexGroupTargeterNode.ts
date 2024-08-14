import { makeNode } from "./_Base";

const doc = [
    //
    "Returns the index of the first matching group in the input text.",
    "Note that this node will only produce results if the regex contains",
    "at least one capturing group.",
]
    .join(" ")
    .trim();

export const RegexGroupTargeterNode = makeNode(
    {
        nodeName: "RegexGroupTargeterNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [580, 520],
        doc,
    },
    {
        inputs: [
            //
            { name: "text", type: "string", label: "text" },
        ],
        outputs: [
            //
            { name: "resultIndex", type: "string", label: "result index" },
        ],

        controlsOverride: {
            regex: "regex",
        },
        controls: [
            {
                name: "regex",
                control: {
                    type: "text",
                    defaultValue: "(^ONE$)|(^TWO$)|(^THREE$)",
                    config: {
                        label: "regex",
                        large: true,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const text: string = (inputs.text || [])[0] || "";
            const regex = new RegExp(controls.regex as string);

            const pieces: (string | undefined)[] = (
                text.match(regex) || []
            ).slice(1);

            // find first non-undefined index in pieces
            const resultIndex = pieces.findIndex(
                (piece) => piece !== undefined
            );

            return { resultIndex };
        },
    }
);
