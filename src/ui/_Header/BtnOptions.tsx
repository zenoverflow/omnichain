import React, { useRef, useState } from "react";
import { Button, Input, Modal, Select, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";

// import { createModule } from "../../state/editor";

export const BtnOptions: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    // const [valOfName, setValOfName] = useState<string>("New Module");
    const inputRef = useRef<any>();

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
                onOk={handleCloseModal}
                onCancel={handleCloseModal}
                okText="Close"
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        {/* <CancelBtn /> */}
                        {/* <OkBtn /> */}
                    </>
                )}
            >
                {/* <Input
                    // onPointerDown={(e) => e.stopPropagation()}
                    ref={inputRef}
                    type="text"
                    placeholder="Name of module"
                    value={valOfName}
                    onChange={(e) => {
                        setValOfName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleCreate();
                        }
                    }}
                    autoFocus
                /> */}

                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%", marginTop: "10px" }}
                >
                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                    >
                        <span>Chat chain</span>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select a chain..."
                            options={[
                                { label: "Chain 1", value: "c1" },
                                { label: "Chain 2", value: "c2" },
                            ]}
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
                            options={[
                                { label: "Chain 1", value: "c1" },
                                { label: "Chain 2", value: "c2" },
                            ]}
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
                            defaultValue={13000}
                        />
                    </Space>
                </Space>
            </Modal>
        </>
    );
};