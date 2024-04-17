import React, { useState, useMemo } from "react";
import { Button, Input, Modal, Avatar, Space, Empty } from "antd";
import {
    DeleteOutlined,
    TeamOutlined,
    PlusCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";

import {
    avatarStorage,
    createAvatar,
    updateAvatarName,
    updateAvatarImage,
    deleteAvatar,
} from "../../state/avatars";
import { useOuterState } from "../../util/ObservableUtilsReact";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [avatars] = useOuterState(avatarStorage);

    const avatarsSorted = useMemo(
        () =>
            Object.values(avatars)
                //
                .sort((a, b) => b.created - a.created),
        [avatars]
    );

    const handleAvatarUpdate = (avatarId: string) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";

        fileInput.onchange = () => {
            if (fileInput.files?.length) {
                const file = fileInput.files[0];
                updateAvatarImage(avatarId, file);
            }
        };

        const cleanup = () => {
            fileInput.remove();
        };

        fileInput.oncancel = cleanup;
        fileInput.onabort = cleanup;

        fileInput.click();
    };

    return (
        <Modal
            title={<h3>Avatars</h3>}
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
                        createAvatar();
                    }}
                    icon={<PlusCircleOutlined />}
                >
                    {"Avatar"}
                </Button>
                {!avatarsSorted.length ? (
                    <Empty />
                ) : (
                    avatarsSorted.map((a) => (
                        <div
                            key={a.avatarId}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "5px",
                            }}
                        >
                            <Avatar
                                size={42}
                                {...(a.imageBase64.length
                                    ? { src: a.imageBase64 }
                                    : { icon: <UserOutlined /> })}
                                style={{
                                    backgroundColor: "grey",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    handleAvatarUpdate(a.avatarId);
                                }}
                            />
                            <div style={{ width: "5px" }} />
                            <Input
                                type="text"
                                value={a.name}
                                onChange={(e) => {
                                    updateAvatarName(
                                        a.avatarId,
                                        e.target.value
                                    );
                                }}
                                style={{ flex: "1" }}
                            />
                            <div style={{ width: "5px" }} />
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                    deleteAvatar(a.avatarId);
                                }}
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </div>
                    ))
                )}
            </Space>
        </Modal>
    );
};

export const BtnAvatars: React.FC = () => {
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
                icon={<TeamOutlined />}
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
