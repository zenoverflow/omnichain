import React, { useState, useMemo } from "react";
import { Button, Input, Modal, Space, Empty } from "antd";
import {
    DeleteOutlined,
    KeyOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";

import {
    apiKeyStorage,
    createApiKey,
    updateApiKeyName,
    updateApiKeyContent,
    deleteApiKey,
} from "../../state/apiKeys";
import { useOuterState } from "../../util/ObservableUtilsReact";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [apiKeys] = useOuterState(apiKeyStorage);

    const apiKeysSorted = useMemo(
        () =>
            Object.values(apiKeys)
                //
                .sort((a, b) => b.created - a.created),
        [apiKeys]
    );

    return (
        <Modal
            title={<h3>API keys</h3>}
            open={true}
            afterClose={closeModal}
            // onOk={handleApply}
            onCancel={closeModal}
            footer={() => <></>}
            // footer={(_, { OkBtn, CancelBtn }) => (
            //     <>
            //         {/* <CancelBtn />
            //         <OkBtn /> */}
            //     </>
            // )}
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
                    onClick={() => {
                        createApiKey();
                    }}
                    icon={<PlusCircleOutlined />}
                >
                    {"API key"}
                </Button>
                {!apiKeysSorted.length ? (
                    <Empty />
                ) : (
                    apiKeysSorted.map((a) => (
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
                                    onChange={(e) => {
                                        updateApiKeyName(
                                            a.apiKeyId,
                                            e.target.value.trim()
                                        );
                                    }}
                                />
                                <div style={{ width: "5px" }} />
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => {
                                        deleteApiKey(a.apiKeyId);
                                    }}
                                    icon={<DeleteOutlined />}
                                    danger
                                />
                            </div>
                            <Input.Password
                                value={a.content}
                                onChange={(e) => {
                                    updateApiKeyContent(
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
