import { makeNode } from "./_Base";

import { MsgUtils } from "../../util/MsgUtils";

const doc = [
    "Creates a message with the assistant role",
    "and outputs it to a different node. Can optionally",
    "be sent from a specific avatar by specifying its name",
    "(purely cosmetic, does not affect the OpenAI-compatible API).",
    "Files can be passed in as a single file or an array of files.",
    "If both a single file and an array of files are passed in,",
    "the single file will be appended to the array.",
]
    .join(" ")
    .trim();

export const BuildMessageNode = makeNode(
    {
        nodeName: "BuildMessageNode",
        nodeIcon: "CommentOutlined",
        dimensions: [350, 290],
        doc,
    },
    {
        inputs: [
            { name: "content", type: "string", label: "content" },
            { name: "filesArray", type: "fileArray", label: "files (array)" },
            { name: "fileSingle", type: "file", label: "file (single)" },
            { name: "avatarName", type: "string", label: "avatar name" },
        ],
        outputs: [{ name: "message", type: "chatMessage", label: "message" }],
        controls: [
            {
                name: "role",
                control: {
                    type: "select",
                    defaultValue: "assistant",
                    config: {
                        label: "role",
                        values: [
                            { label: "assistant", value: "assistant" },
                            { label: "user", value: "user" },
                        ],
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const role = context.getAllControls(nodeId).role as string;

            const avatarName: string | undefined =
                (inputs.avatarName || [])[0] || undefined;

            const files = [...((inputs.filesArray || [])[0] || [])];

            const fileSingle = (inputs.fileSingle || [])[0];
            if (fileSingle) {
                files.push(fileSingle);
            }

            if (role === "user") {
                const message = MsgUtils.freshFromUser(
                    context.graphId,
                    (inputs.content || [])[0] || "",
                    avatarName,
                    files
                );
                return { message };
            }

            const message = MsgUtils.freshFromAssistant(
                context.graphId,
                (inputs.content || [])[0] || "",
                avatarName,
                files
            );

            return { message };
        },
    }
);
