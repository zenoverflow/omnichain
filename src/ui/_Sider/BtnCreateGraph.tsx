import React, { useRef, useState } from "react";
import { Button, Input, Modal, InputRef } from "antd";

import { PlusCircleOutlined } from "@ant-design/icons";

import { createGraph } from "../../state/graphs";

export const BtnCreateGraph: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [valOfName, setValOfName] = useState<string>("New Chain");
    const inputRef = useRef<InputRef>();

    const handleOpenModal = () => {
        setModalOpen(true);
        setTimeout(() => {
            inputRef?.current?.focus();
        });
    };

    const handleCloseModal = () => {
        setValOfName("New Chain");
        setModalOpen(false);
    };

    const handleCreate = async () => {
        await createGraph(valOfName);
        setModalOpen(false);
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
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            await handleCreate();
                        }
                    }}
                    autoFocus
                />
            </Modal>
        </>
    );
};
