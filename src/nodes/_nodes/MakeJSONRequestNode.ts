import axios, { AxiosRequestConfig } from "axios";
import { makeNode } from "./_Base";

const doc = [
    //
    "Make a request to a JSON-compatible http API.",
    "The headers are expected to be a JSON object as a string.",
    "The body can be any string, like raw text, base64, JSON, etc.",
    "The method is a string, like 'GET', 'POST', 'PUT', 'DELETE'.",
    "The response is returned as a JSON string, in the format",
    "{code: number, data: any, error: string}.",
    "If something goes wrong with the request configuration",
    "itself (before making the request), the error will be in",
    "the 'error' field, and the code will be 0.",
    "The timeout control can be set to 0 to disable it (default).",
    "There is no real difference between this node and the",
    "MakeHttpRequestNode, except the less confusing name.",
]
    .join(" ")
    .trim();

export const MakeJSONRequestNode = makeNode(
    {
        nodeName: "MakeJSONRequestNode",
        nodeIcon: "ApiOutlined",
        dimensions: [620, 290],
        doc,
    },
    {
        inputs: [
            {
                //
                name: "headers",
                type: "string",
                label: "headers (json)",
            },
            {
                //
                name: "body",
                type: "string",
                label: "body (json)",
            },
            {
                //
                name: "method",
                type: "string",
                label: "method",
            },
            {
                //
                name: "url",
                type: "string",
                label: "url",
            },
        ],
        outputs: [
            //
            { name: "result", type: "string", label: "result" },
        ],
        controls: [
            {
                name: "timeout",
                control: {
                    type: "number",
                    defaultValue: 0,
                    config: {
                        label: "timeout (ms)",
                        min: 0,
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            try {
                // Validate inputs
                const headers = (inputs.headers || [])[0] || "{}";
                const body = (inputs.body || [])[0];
                const method = (inputs.method || [])[0];
                const url = (inputs.url || [])[0];

                if (!method || !url) {
                    throw new Error("Missing required inputs!");
                }

                const config: AxiosRequestConfig = {
                    method,
                    headers: JSON.parse(headers),
                    timeout: controls.timeout as number,
                };

                if (body?.length > 0) {
                    config.data = body;
                    config.headers = {
                        "Content-Type": "application/json",
                        ...config.headers,
                    };
                }

                const response = await axios(url, config);

                return {
                    result: JSON.stringify({
                        code: response.status,
                        data: response.data,
                        error: null,
                    }),
                };
            } catch (error: any) {
                console.error(error);
                return {
                    result: JSON.stringify({
                        code: error.response?.status || 0,
                        data: null,
                        error: error.message || error,
                    }),
                };
            }
        },
    }
);
