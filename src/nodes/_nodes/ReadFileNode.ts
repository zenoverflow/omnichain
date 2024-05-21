import fs from "fs";
import path from "path";

import mime from "mime-types";

import { makeNode } from "./_Base";

import type { ChatMessageFile } from "../../data/types";

const doc = [
    //
    "Reads a file from disk, from a specified location.",
]
    .join(" ")
    .trim();

export const ReadFileNode = makeNode(
    {
        nodeName: "ReadFileNode",
        nodeIcon: "FileOutlined",
        dimensions: [330, 130],
        doc,
    },
    {
        inputs: [
            //
            {
                name: "path",
                type: "string",
                label: "path (string)",
            },
        ],
        outputs: [
            //
            {
                name: "file",
                type: "file",
                label: "file",
            },
        ],
        controls: [],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);

            const filePath: string | undefined = (inputs.path || [])[0];

            if (!filePath?.length) {
                throw new Error("Missing file path!");
            }

            // First, read file stats to check if it exists.
            const fileStats: fs.Stats = await new Promise((resolve, reject) => {
                fs.stat(filePath, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });

            if (!fileStats.isFile()) {
                throw new Error("Path is not a file!");
            }

            const name = path.basename(filePath);

            const mimetype =
                mime.lookup(path.extname(filePath)) || "text/plain";

            const content = await new Promise<string>((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) reject(err);
                    else resolve(data.toString("base64"));
                });
            });

            const file: ChatMessageFile = {
                name,
                mimetype,
                content,
            };

            return { file };
        },
    }
);
