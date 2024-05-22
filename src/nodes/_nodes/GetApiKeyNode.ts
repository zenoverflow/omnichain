import { makeNode } from "./_Base";

const doc = [
    //
    "Grab an API key from storage by its name.",
    "If no key is found, an empty string is returned.",
    "You can create and save API keys using the menu",
    "in the top bar. API keys are not stored on the chain",
    "in order to allow safe chain exports.",
]
    .join(" ")
    .trim();

export const GetApiKeyNode = makeNode(
    {
        nodeName: "GetApiKeyNode",
        nodeIcon: "FileTextOutlined",
        dimensions: [330, 140],
        doc,
    },
    {
        inputs: [],
        outputs: [
            //
            {
                name: "key",
                type: "string",
                label: "key (string)",
            },
        ],
        controls: [
            {
                name: "apiKeyName",
                control: {
                    type: "text",
                    defaultValue: "my_api_key",
                    config: {
                        label: "name",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const apiKeyName = context.getAllControls(nodeId)
                .apiKeyName as string;

            const key = context.getApiKeyByName(apiKeyName) || "";

            return { key };
        },
    }
);
