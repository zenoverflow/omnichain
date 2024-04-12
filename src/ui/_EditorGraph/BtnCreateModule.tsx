import React, { useRef, useState } from "react";
import { Button, Input, Modal } from "antd";

import { PlusCircleOutlined } from "@ant-design/icons";

import { createModule } from "../../state/editor";

export const BtnCreateModule: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [valOfName, setValOfName] = useState<string>("New Module");
    const inputRef = useRef<any>();

    const handleOpenModal = () => {
        setModalOpen(true);
        setTimeout(() => {
            inputRef?.current?.focus();
        });
    };

    const handleCloseModal = () => {
        setValOfName("New Module");
        setModalOpen(false);
    };

    const handleCreate = async () => {
        setModalOpen(false);
        createModule(valOfName);
    };

    return (
        <>
            <Button
                type="primary"
                size="large"
                icon={<PlusCircleOutlined />}
                onClick={handleOpenModal}
                disabled={modalOpen}
            >
                {"Module"}
            </Button>
            <Modal
                title="Create a Module"
                open={modalOpen}
                onOk={handleCreate}
                onCancel={handleCloseModal}
            >
                <Input
                    // onPointerDown={(e) => e.stopPropagation()}
                    ref={inputRef}
                    type="text"
                    placeholder="Name of module"
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
