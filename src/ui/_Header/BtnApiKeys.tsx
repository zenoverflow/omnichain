import React, { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { Button, Input, Modal, Space, Empty } from "antd";
import {
    DeleteOutlined,
    KeyOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";

import {
    apiKeyStorageAtom,
    createApiKey,
    updateApiKeyName,
    updateApiKeyContent,
    deleteApiKey,
} from "../../state/apiKeys";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [apiKeyStorage] = useAtom(apiKeyStorageAtom);

    const apiKeys = useMemo(
        () =>
            Object.values(apiKeyStorage)
                //
                .sort((a, b) => b.created - a.created),
        [apiKeyStorage]
    );

    return (
        <Modal
            title={<h3>API keys</h3>}
            open={true}
            afterClose={closeModal}
            // onOk={handleApply}
            onCancel={closeModal}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    {/* <CancelBtn />
                    <OkBtn /> */}
                </>
            )}
        >
            <Space
                direction="vertical"
                size="large"
                style={{ width: "100%", marginTop: "10px" }}
            >
                <Button
                    type="primary"
                    size="large"
                    style={{ width: "100%" }}
                    onClick={() => createApiKey()}
                    icon={<PlusCircleOutlined />}
                >
                    {"API key"}
                </Button>
                {!apiKeys.length ? (
                    <Empty />
                ) : (
                    apiKeys.map((a) => (
                        <Space
                            key={a.apiKeyId}
                            style={{ width: "100%" }}
                            direction="vertical"
                        >
                            <div
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Input
                                    style={{ flex: "1" }}
                                    type="text"
                                    value={a.name}
                                    onChange={async (e) => {
                                        await updateApiKeyName(
                                            a.apiKeyId,
                                            e.target.value
                                        );
                                    }}
                                />
                                <div style={{ width: "5px" }} />
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => deleteApiKey(a.apiKeyId)}
                                    icon={<DeleteOutlined />}
                                    danger
                                />
                            </div>
                            <Input.Password
                                value={a.content}
                                onChange={async (e) => {
                                    await updateApiKeyContent(
                                        a.apiKeyId,
                                        e.target.value
                                    );
                                }}
                            />
                        </Space>
                    ))
                )}
            </Space>
        </Modal>
    );
};

export const BtnApiKeys: React.FC = () => {
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
                icon={<KeyOutlined />}
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
