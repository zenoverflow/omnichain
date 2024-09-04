import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

export const ExtFlorence2Node = makeNode(
    {
        nodeName: "ExtFlorence2Node",
        nodeIcon: "CodeOutlined",
        dimensions: [500, 250],
        externalModules: ["python"],
        doc: [
            //
            "Use the Florence2 vision model via OmniChain's external Python module.",
            "You need to install and run the external Python module to use this node.",
        ].join(" "),
    },
    {
        inputs: [
            //
            {
                name: "image",
                type: "file",
                label: "image",
            },
            {
                name: "text_input",
                type: "string",
                label: "text_input (for caption to phrase grounding)",
            },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result (json)" },
        ],

        controlsOverride: {
            action: "action",
        },
        controls: [
            {
                name: "action",
                control: {
                    type: "select",
                    defaultValue: "<CAPTION_TO_PHRASE_GROUNDING>",
                    config: {
                        label: "action",
                        values: [
                            {
                                label: "caption to phrase grounding",
                                value: "<CAPTION_TO_PHRASE_GROUNDING>",
                            },
                            {
                                label: "caption",
                                value: "<CAPTION>",
                            },
                            {
                                label: "caption detailed",
                                value: "<DETAILED_CAPTION>",
                            },
                            {
                                label: "caption more detailed",
                                value: "<MORE_DETAILED_CAPTION>",
                            },
                            {
                                label: "caption dense region",
                                value: "<DENSE_REGION_CAPTION>",
                            },
                            {
                                label: "region proposal",
                                value: "<REGION_PROPOSAL>",
                            },
                            {
                                label: "object detection",
                                value: "<OD>",
                            },
                            {
                                label: "ocr",
                                value: "<OCR>",
                            },
                            {
                                label: "ocr with region",
                                value: "<OCR_WITH_REGION>",
                            },
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getControlsWithOverride(nodeId, inputs);

            const img: ChatMessageFile | null = (inputs.image || [])[0];
            const text_input: string = (inputs.text_input || [])[0] || "";

            if (!img) {
                throw new Error("ExternalFlorence2Node: Image is required!");
            }

            const result = await context.extraAction({
                type: "callExternalModule",
                args: {
                    module: "python",
                    action: "/florence2/action",
                    data: {
                        image: img.content,
                        task_prompt: controls.action,
                        text_input: text_input,
                    },
                },
            });

            return { result: JSON.stringify(result, null, 2) };
        },
    }
);
