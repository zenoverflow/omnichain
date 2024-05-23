import React, { useState, useMemo } from "react";
import { Button, Modal, Select, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import { optionsStorage, setOptions } from "../../state/options";
import { graphStorage } from "../../state/graphs";
import { avatarStorage } from "../../state/avatars";
import { useOuterState } from "../../util/ObservableUtilsReact";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [{ defaultChainId, userAvatarId }] = useOuterState(optionsStorage);
    const [graphs] = useOuterState(graphStorage);
    const [avatars] = useOuterState(avatarStorage);

    const [updates, setUpdates] = useState({
        userAvatarId,
        defaultChainId,
    });

    const avatarOptions = useMemo(
        () =>
            Object.values(avatars)
                .sort((a, b) => b.created - a.created)
                .map((c) => ({
                    label: c.name,
                    value: c.avatarId,
                })),
        [avatars]
    );

    const chainOptions = useMemo(
        () =>
            Object.values(graphs)
                .sort((a, b) => b.created - a.created)
                .map((c) => ({
                    label: c.name,
                    value: c.graphId,
                })),
        [graphs]
    );

    const handleApply = async () => {
        await setOptions({
            userAvatarId: updates.userAvatarId || null,
            defaultChainId: updates.defaultChainId || null,
        });
        closeModal();
    };

    return (
        <Modal
            title={<h3>Options</h3>}
            open={true}
            onOk={() => {
                void handleApply();
            }}
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
                {/* User chat avatar setting */}

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
                        onChange={(v) => {
                            setUpdates((u) => ({
                                ...u,
                                userAvatarId: v,
                            }));
                        }}
                        value={updates.userAvatarId}
                    />
                    <span
                        className="c__mstyle"
                        style={{ fontSize: "16px", opacity: 0.7 }}
                    >
                        Info: Avatar for the user in the chat interface. Purely
                        cosmetic.
                    </span>
                </Space>

                {/* Default chain setting */}

                <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                >
                    <span>Default chain</span>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select a chain..."
                        options={chainOptions}
                        onChange={(v) => {
                            setUpdates((u) => ({
                                ...u,
                                chainChatId: v,
                            }));
                        }}
                        value={updates.defaultChainId}
                    />
                    <span
                        className="c__mstyle"
                        style={{ fontSize: "16px", opacity: 0.7 }}
                    >
                        Info: Default chain to execute for chat messages and API
                        calls if no chain is running. Note that API calls may
                        still specify a different chain.
                    </span>
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
