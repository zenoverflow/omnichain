import React, { useRef, useState } from "react";
import { Button, Input, Modal, InputRef } from "antd";

import { PlusCircleOutlined } from "@ant-design/icons";

import { createGraph } from "../../state/graphs";

export const BtnCreateGraph: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [valOfName, setValOfName] = useState<string>("New Chain");
    const inputRef = useRef<InputRef>(null);

    const handleOpenModal = () => {
        setModalOpen(true);
        setTimeout(() => {
            inputRef.current?.focus();
        });
    };

    const handleCloseModal = () => {
        setValOfName("New Chain");
        setModalOpen(false);
    };

    const handleCreate = () => {
        setModalOpen(false);
        createGraph(valOfName);
    };

    return (
        <>
            <Button
                type="primary"
                size="large"
                style={{ width: "100%" }}
                disabled={modalOpen}
                onClick={handleOpenModal}
                icon={<PlusCircleOutlined />}
            >
                {"Chain"}
            </Button>
            <Modal
                title="Create a Chain"
                open={modalOpen}
                onOk={handleCreate}
                onCancel={handleCloseModal}
            >
                <Input
                    // onPointerDown={(e) => e.stopPropagation()}
                    ref={inputRef}
                    type="text"
                    placeholder="Name of chain"
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
                />
            </Modal>
        </>
    );
};
