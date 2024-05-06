import { makeNode } from "./_Base";

import { MsgUtils } from "../../util/MsgUtils";

const doc = [
    "Creates a response message with the assistant role",
    "and adds it to the current session. Can optionally",
    "be sent from a specific avatar by specifying its name",
    "(purely cosmetic, does not affect the OpenAI-compatible API).",
]
    .join(" ")
    .trim();

export const ResponseNode = makeNode(
    {
        nodeName: "ResponseNode",
        nodeIcon: "CommentOutlined",
        dimensions: [350, 300],
        doc,
    },
    {
        inputs: [
            { name: "triggerIn", type: "trigger", label: "trigger in" },
            { name: "content", type: "string", label: "content" },
            { name: "fileSingle", type: "file", label: "file (single)" },
            { name: "filesArray", type: "fileArray", label: "files (array)" },
        ],
        outputs: [
            { name: "triggerOut", type: "trigger", label: "trigger out" },
        ],
        controls: [
            {
                name: "avatarName",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        label: "avatar",
                    },
                },
            },
        ],
    },
    {
        controlFlow: {
            inputs: ["triggerIn"],
            outputs: ["triggerOut"],
            async logic(_node, context, controls, fetchInputs, forward) {
                const inputs = await fetchInputs();
                const files = [...((inputs.filesArray || [])[0] || [])];
                const fileSingle = (inputs.fileSingle || [])[0];
                if (fileSingle) {
                    files.push(fileSingle);
                }
                const message = MsgUtils.freshFromAssistant(
                    context.graphId,
                    (inputs.content || [])[0] || "",
                    (controls.avatarName || undefined) as string | undefined,
                    files
                );
                await context.onExternalAction({
                    type: "addMessageToSession",
                    args: { message },
                });
                forward("triggerOut");
            },
        },
        dataFlow: {
            inputs: ["content", "fileSingle", "filesArray"],
            outputs: [],
            async logic(_node, _context, _controls, _fetchInputs) {
                return {};
            },
        },
    }
);
