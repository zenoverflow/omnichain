import React, { useState, useMemo } from "react";
import { Button, Modal, Space, Collapse, CollapseProps } from "antd";
import { ReadOutlined } from "@ant-design/icons";

import { useOuterState } from "../../util/ObservableUtilsReact";
import { nodeRegistryStorage } from "../../state/nodeRegistry";
import { getMenuIcon } from "../_Rete/NodeIcons";

const _typeLabelStyle: React.CSSProperties = {
    backgroundColor: "lightgray",
    borderRadius: "6px",
    padding: "3px 10px",
    marginLeft: "5px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
};

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [nodeRegistry] = useOuterState(nodeRegistryStorage);

    const items = useMemo(() => {
        const r: CollapseProps["items"] = Object.values(nodeRegistry)
            .sort((a, b) =>
                a.config.baseConfig.nodeName.localeCompare(
                    b.config.baseConfig.nodeName
                )
            )
            .map((node) => ({
                key: node.config.baseConfig.nodeName,
                label: (
                    <Space>
                        {getMenuIcon(node.config.baseConfig.nodeName)}
                        <span>{node.config.baseConfig.nodeName}</span>
                    </Space>
                ),
                children: (
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ width: "100%" }}>
                            {node.config.baseConfig.doc}
                        </div>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <span style={{ fontWeight: "bold" }}>Inputs:</span>
                            {node.config.ioConfig.inputs.map((i) => (
                                <span key={i.name}>
                                    {i.label || i.name}
                                    <span style={_typeLabelStyle}>
                                        {i.type}
                                    </span>
                                </span>
                            ))}
                        </Space>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <span style={{ fontWeight: "bold" }}>Outputs:</span>
                            {node.config.ioConfig.outputs.map((i) => (
                                <span key={i.name}>
                                    {i.label || i.name}
                                    <span style={_typeLabelStyle}>
                                        {i.type}
                                    </span>
                                </span>
                            ))}
                        </Space>
                    </Space>
                ),
            }));
        return r;
    }, [nodeRegistry]);

    return (
        <Modal
            title={<h3>Index of Nodes (custom included)</h3>}
            open={true}
            // onOk={() => {
            //     void handleApply();
            // }}
            afterClose={closeModal}
            onCancel={closeModal}
            // okText="Apply"
            width={"80vw"}
            footer={() => <></>}
            destroyOnClose
            centered
            // footer={(_, { OkBtn, CancelBtn }) => (
            //     <>
            //         <CancelBtn />
            //         <OkBtn />
            //     </>
            // )}
        >
            <div
                style={{
                    width: "100%",
                    height: "70vh",
                    overflowY: "auto",
                }}
            >
                <Collapse items={items} accordion />
            </div>
        </Modal>
    );
};

export const BtnNodeIndex: React.FC = () => {
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
                icon={<ReadOutlined />}
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
