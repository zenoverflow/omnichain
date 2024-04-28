import React, { useState, useMemo } from "react";
import { Button, Modal, Select, Space } from "antd";
import {
    SettingOutlined,
    UploadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import { optionsStorage, setOptions } from "../../state/options";
import { graphStorage } from "../../state/graphs";
import { avatarStorage } from "../../state/avatars";
import { useOuterState } from "../../util/ObservableUtilsReact";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [{ defaultChainId, userAvatarId, execPersistence }] =
        useOuterState(optionsStorage);
    const [graphs] = useOuterState(graphStorage);
    const [avatars] = useOuterState(avatarStorage);

    const [updates, setUpdates] = useState({
        userAvatarId,
        defaultChainId,
        execPersistence,
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            execPersistence: updates.execPersistence || "onChange",
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
                <Space
                    direction="horizontal"
                    size="middle"
                    style={{ width: "100%" }}
                >
                    <Button icon={<DownloadOutlined />}>Export chains</Button>
                    <Button icon={<UploadOutlined />}>Import chains</Button>
                </Space>

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

                {/* Execution persistence setting */}

                <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                >
                    <span>Save chain updates during execution</span>
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Select an option..."
                        options={[
                            { label: "On change", value: "onChange" },
                            { label: "On demand", value: "onDemand" },
                        ]}
                        onChange={(v) => {
                            setUpdates((u) => ({
                                ...u,
                                execPersistence: v,
                            }));
                        }}
                        value={updates.execPersistence}
                    />
                    <span
                        className="c__mstyle"
                        style={{ fontSize: "16px", opacity: 0.7 }}
                    >
                        Restart the running chain for this to take effect! Info:
                        The chain can update its own state and save it to disk
                        during execution. This can bottleneck performance, and
                        is the reason why the SaveState node exists. When you
                        select the On Demand option, the chain will only save
                        its state when the SaveState node is triggered. This can
                        vastly improve performance for complex chains that
                        involve a lot of internal state updates.
                    </span>
                </Space>

                {/* <Space
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
