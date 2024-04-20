import React, { useState } from "react";
import { Modal } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const _Modal: React.FC<{
    closeModal: () => any;
    nodeName: string;
    doc: string;
}> = ({ closeModal, nodeName, doc }) => {
    return (
        <Modal
            title={<h3>{nodeName}</h3>}
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
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>{doc}</div>
        </Modal>
    );
};

export const BtnDoc: React.FC<{ doc: string; nodeName: string }> = ({
    nodeName,
    doc,
}) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <>
            <QuestionCircleOutlined onClick={handleOpenModal} />
            {modalOpen ? (
                <_Modal
                    closeModal={handleCloseModal}
                    nodeName={nodeName}
                    doc={doc}
                />
            ) : null}
        </>
    );
};
