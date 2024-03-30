import React, { useRef, useState } from "react";
import { useAtom } from "jotai";
import { Button, Input, Modal, Select, Space } from "antd";
import {
    SettingOutlined,
    UploadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import {
    optionsAtom,
    setChatChain,
    setApiChain,
    setApiPort,
} from "../../state/options";
import { graphStorageAtom } from "../../state/graphs";

export const BtnOptions: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [{ chain_chat_id, chain_api_id, api_port }] = useAtom(optionsAtom);
    const [graphStorage] = useAtom(graphStorageAtom);
    const chains: { label: string; value: string }[] = Object.values(
        graphStorage
    )
        .sort((a, b) => b.created - a.created)
        .map((c) => ({
            label: c.name,
            value: c.graphId,
        }));
    // const [valOfName, setValOfName] = useState<string>("New Module");
    // const inputRef = useRef<any>();

    const handleOpenModal = () => {
        setModalOpen(true);
        // setTimeout(() => {
        //     inputRef?.current?.focus();
        // });
    };

    const handleCloseModal = () => {
        // setValOfName("New Module");
        setModalOpen(false);
    };

    const handleApply = () => {
        // TODO
        setModalOpen(false);
    };

    // const handleCreate = () => {
    //     createModule(valOfName);
    //     setModalOpen(false);
    // };

    return (
        <>
            <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<SettingOutlined />}
                style={{
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClick={handleOpenModal}
                disabled={modalOpen}
            />
            <Modal
                title={<h3>Options</h3>}
                open={modalOpen}
                onOk={handleApply}
                onCancel={handleCloseModal}
                okText="Apply"
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <CancelBtn />
                        <OkBtn />
                    </>
                )}
            >
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%", marginTop: "10px" }}
                >
                    <Space
                        direction="horizontal"
                        size="middle"
                        style={{ width: "100%" }}
                    >
                        <Button icon={<DownloadOutlined />}>
                            Export chains
                        </Button>
                        <Button icon={<UploadOutlined />}>Import chains</Button>
                    </Space>

                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                    >
                        <span>Chat chain</span>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select a chain..."
                            defaultValue={chain_chat_id}
                            options={chains}
                        />
                    </Space>

                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                    >
                        <span>Default API chain</span>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select a chain..."
                            defaultValue={chain_api_id}
                            options={chains}
                        />
                    </Space>

                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                    >
                        <span>API port</span>
                        <Input
                            type="number"
                            style={{ width: "100%" }}
                            defaultValue={api_port}
                        />
                    </Space>
                </Space>
            </Modal>
        </>
    );
};
