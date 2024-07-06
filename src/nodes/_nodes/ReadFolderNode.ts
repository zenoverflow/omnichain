import fs from "fs";
import path from "path";

import { makeNode } from "./_Base";

const doc = [
    //
    "Lists the content of a folder from disk, from a specified location.",
    "Returns the list as string array of file names.",
    "You can set the type control to specify whether to list files or folders.",
    "You can set the extension control to filter by file extension.",
]
    .join(" ")
    .trim();

export const ReadFolderNode = makeNode(
    {
        nodeName: "ReadFolderNode",
        nodeIcon: "FileOutlined",
        dimensions: [330, 220],
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
                name: "list",
                type: "stringArray",
                label: "list (array)",
            },
        ],
        controls: [
            {
                name: "type",
                control: {
                    type: "select",
                    defaultValue: "files",
                    config: {
                        label: "type",
                        values: [
                            { value: "files", label: "files" },
                            { value: "folders", label: "folders" },
                        ],
                    },
                },
            },
            {
                name: "extension",
                control: {
                    type: "text",
                    defaultValue: "",
                    config: {
                        label: "extension",
                    },
                },
            },
        ],
    },
    {
        async dataFlow(nodeId, context) {
            const inputs = await context.fetchInputs(nodeId);
            const controls = context.getAllControls(nodeId);

            const directoryPath: string | undefined = (inputs.path || [])[0];

            if (!directoryPath?.length) {
                throw new Error("Missing file path!");
            }

            const type = controls.type as "files" | "folders";
            const extension = (controls.extension as string).trim();

            // First, read folder stats to check if it exists.
            const dirStats: fs.Stats = await new Promise((resolve, reject) => {
                fs.stat(directoryPath, (err, stats) => {
                    if (err) reject(err);
                    else resolve(stats);
                });
            });

            if (!dirStats.isDirectory()) {
                throw new Error("Path is not a folder!");
            }

            const list = await new Promise<string[]>((resolve, reject) => {
                fs.readdir(directoryPath, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            const filteredByType = list.filter((item) => {
                const itemPath = path.join(directoryPath, item);
                const stats = fs.statSync(itemPath);
                return type === "files" ? stats.isFile() : stats.isDirectory();
            });

            const filteredByExtension =
                type === "files" && extension.length
                    ? filteredByType.filter((item) =>
                          item.toLowerCase().endsWith(extension.toLowerCase())
                      )
                    : filteredByType;

            return {
                list: filteredByExtension,
            };
        },
    }
);
