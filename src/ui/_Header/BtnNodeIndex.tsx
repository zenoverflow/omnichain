import React, { useState, useMemo } from "react";
import { Button, Modal, Space, Collapse, CollapseProps, Input } from "antd";
import { ReadOutlined } from "@ant-design/icons";

import { NodeDoc } from "../_Global/NodeDoc";

import { useOuterState } from "../../util/ObservableUtilsReact";
import { nodeRegistryStorage } from "../../state/nodeRegistry";
import { getMenuIcon } from "../_Rete/NodeIcons";

const _Modal: React.FC<{ closeModal: () => any }> = ({ closeModal }) => {
    const [nodeRegistry] = useOuterState(nodeRegistryStorage);
    const [filter, setFilter] = useState("");

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
                children: <NodeDoc node={node} />,
            }));

        const filtered = r.filter((i) =>
            filter.length
                ? (i.key as string).toLowerCase().includes(filter.toLowerCase())
                : true
        );

        if (filtered.length) return filtered;
        return r;
    }, [filter, nodeRegistry]);

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
            <Input
                type="text"
                value={filter}
                onChange={(e) => {
                    setFilter((e.target.value || "").toLowerCase());
                }}
                placeholder="Filter..."
                // onMouseEnter={haltTimeout}
                style={{ marginBottom: "10px" }}
                autoFocus
            />
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
