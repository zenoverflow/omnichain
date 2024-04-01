import React, { useState, useMemo, useEffect } from "react";
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

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [{ chainChatId, chainApiId, apiPort }] = useAtom(optionsAtom);
    const [graphStorage] = useAtom(graphStorageAtom);

    const [updates, setUpdates] = useState({
        chainChatId,
        chainApiId,
        apiPort,
    });

    const options = useMemo(
        () =>
            Object.values(graphStorage)
                .sort((a, b) => b.created - a.created)
                .map((c) => ({
                    label: c.name,
                    value: c.graphId,
                })),
        [graphStorage]
    );

    // validate and fix
    useEffect(() => {
        const currentChains = Object.values(graphStorage).map((c) => c.graphId);
        const chatChainValid = currentChains.find(
            //
            (v) => v === chainChatId
        );
        const apiChainValid = currentChains.find(
            //
            (v) => v === chainApiId
        );
        if (!chatChainValid) {
            setChatChain(null);
            setUpdates((u) => ({ ...u, chainChatId: null }));
        }
        if (!apiChainValid) {
            setApiChain(null);
            setUpdates((u) => ({ ...u, chainApiId: null }));
        }
    }, []);

    const handleApply = () => {
        setChatChain(updates.chainChatId);
        setApiChain(updates.chainApiId);
        setApiPort(updates.apiPort);
        // TODO: restart api server
        closeModal();
    };

    return (
        <Modal
            title={<h3>Options</h3>}
            open={true}
            onOk={handleApply}
            onCancel={closeModal}
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
                    <Button icon={<DownloadOutlined />}>Export chains</Button>
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
                        options={options}
                        onChange={(v) =>
                            setUpdates((u) => ({
                                ...u,
                                chainChatId: v,
                            }))
                        }
                        value={updates.chainChatId}
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
                        options={options}
                        onChange={(v) =>
                            setUpdates((u) => ({
                                ...u,
                                chainApiId: v,
                            }))
                        }
                        value={updates.chainApiId}
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
                        value={updates.apiPort}
                        onChange={(e) =>
                            setUpdates((u) => ({
                                ...u,
                                apiPort: e.target.valueAsNumber,
                            }))
                        }
                    />
                </Space>
            </Space>
        </Modal>
    );
};

export const BtnOptions: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

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
            {modalOpen ? <_Modal closeModal={handleCloseModal} /> : null}
        </>
    );
};
