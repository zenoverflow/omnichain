import React, { useState } from "react";
import { Modal } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import type { CustomNode } from "../../data/typesCustomNodes";

import { NodeDoc } from "../_Global/NodeDoc";

const _Modal: React.FC<{
    closeModal: () => any;
    node: CustomNode;
    nodeId: string;
}> = ({ closeModal, node, nodeId }) => {
    return (
        <Modal
            title={
                <>
                    <h3>{node.config.baseConfig.nodeName}</h3>
                    <h6>ID: {nodeId}</h6>
                </>
            }
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
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <NodeDoc node={node} />
            </div>
        </Modal>
    );
};

export const BtnDoc: React.FC<{ node: CustomNode; nodeId: string }> = ({
    node,
    nodeId,
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
                    node={node}
                    nodeId={nodeId}
                />
            ) : null}
        </>
    );
};
