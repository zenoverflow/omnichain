import React, { useCallback } from "react";
import { Button, Tooltip } from "antd";
import { ImportOutlined } from "@ant-design/icons";

import { importGraph } from "../../state/graphs";
import { finishGlobalLoading, startGlobalLoading } from "../../state/loader";

export const BtnImportGraph: React.FC = () => {
    const handleImport = useCallback(() => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        // accept only json
        fileInput.accept = ".json";

        fileInput.onchange = async () => {
            if (fileInput.files?.length) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string | null;
                    if (result && typeof result === "string") {
                        try {
                            const data = JSON.parse(result);
                            if (data) {
                                void importGraph(data);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    finishGlobalLoading();
                };
                // Stop loading on errors
                reader.onerror = () => {
                    finishGlobalLoading();
                };
                reader.onabort = () => {
                    finishGlobalLoading();
                };
                startGlobalLoading();
                reader.readAsText(file);
            }
        };

        const cleanup = () => {
            fileInput.remove();
        };

        fileInput.oncancel = cleanup;
        fileInput.onabort = cleanup;

        fileInput.click();
    }, []);

    return (
        <Tooltip title="Import" placement="topRight">
            <Button
                type="primary"
                size="large"
                onClick={handleImport}
                icon={<ImportOutlined />}
                style={{
                    marginRight: "3px",
                }}
            />
        </Tooltip>
    );
};
