import React, { useState, useMemo } from "react";
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
    setUserAvatar,
} from "../../state/options";
import { graphStorageAtom } from "../../state/graphs";
import { avatarStorageAtom } from "../../state/avatars";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [{ chainChatId, chainApiId, apiPort, userAvatarId }] =
        useAtom(optionsAtom);
    const [graphStorage] = useAtom(graphStorageAtom);
    const [avatarStorage] = useAtom(avatarStorageAtom);

    const [updates, setUpdates] = useState({
        userAvatarId,
        chainChatId,
        chainApiId,
        apiPort,
    });

    const avatarOptions = useMemo(
        () =>
            Object.values(avatarStorage)
                .sort((a, b) => b.created - a.created)
                .map((c) => ({
                    label: c.name,
                    value: c.avatarId,
                })),
        [avatarStorage]
    );

    const chainOptions = useMemo(
        () =>
            Object.values(graphStorage)
                .sort((a, b) => b.created - a.created)
                .map((c) => ({
                    label: c.name,
                    value: c.graphId,
                })),
        [graphStorage]
    );

    const handleApply = () => {
        setUserAvatar(updates.userAvatarId);
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
            afterClose={closeModal}
            onCancel={closeModal}
            okText="Apply"
            // footer={(_, { OkBtn, CancelBtn }) => (
            //     <>
            //         <CancelBtn />
            //         <OkBtn />
            //     </>
            // )}
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
                    <span>User chat avatar</span>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select an avatar..."
                        options={avatarOptions}
                        onChange={(v) =>
                            setUpdates((u) => ({
                                ...u,
                                userAvatarId: v,
                            }))
                        }
                        value={updates.userAvatarId}
                    />
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
                        options={chainOptions}
                        onChange={(v) =>
                            setUpdates((u) => ({
                                ...u,
                                chainChatId: v,
                            }))
                        }
                        value={updates.chainChatId}
                    />
                </Space>

                {/* <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                >
                    <span>Default API chain</span>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a chain..."
                        options={chainOptions}
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
                </Space> */}
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
