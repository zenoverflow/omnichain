import React, { useMemo, useState, useEffect } from "react";
import { useRete } from "rete-react-plugin";
import {
    DeleteOutlined,
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Space, Input, Popconfirm } from "antd";

import { createEditor } from "./_Rete";
import { ContextMenu } from "./_EditorGraph/ContextMenu";
import { useOuterState } from "../util/ObservableUtilsReact";

import { graphStorage, updateGraphName, deleteGraph } from "../state/graphs";
import { deleteSelectedNodes, editorTargetStorage } from "../state/editor";
import { nodeSelectionStorage } from "../state/nodeSelection";
import { executorStorage, stopGraph, runGraph } from "../state/executor";
import { controlDisabledObservable } from "../state/watcher";

const NodeDeleteButton: React.FC<{
    disabled?: boolean;
}> = (props) => {
    const [targets] = useOuterState(nodeSelectionStorage);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === "Delete" && targets.length) {
                // Prevent deletions on active graph
                const executorState = executorStorage.get();
                if (!executorState) {
                    void deleteSelectedNodes();
                }
            }
        };

        window.addEventListener("keyup", listener);

        return () => {
            window.removeEventListener("keyup", listener);
        };
    }, [targets]);

    if (!targets.length) return null;

    return (
        <Popconfirm
            title={
                `Deleting ${targets.length.toString()} node` +
                (targets.length === 1 ? "" : "s")
            }
            description="Are you sure?"
            onConfirm={() => {
                void deleteSelectedNodes();
            }}
            okText="Yes"
            cancelText="No"
            placement="leftTop"
        >
            <Button
                type="primary"
                size="large"
                icon={<DeleteOutlined />}
                style={{ pointerEvents: "all" }}
                disabled={props.disabled}
                danger
            />
        </Popconfirm>
    );
};

const GraphRunButton: React.FC = () => {
    const [editorTarget] = useOuterState(editorTargetStorage);
    const [executor] = useOuterState(executorStorage);

    const graphIsActive = useMemo(
        () => (editorTarget ? executor?.graphId === editorTarget : false),
        [editorTarget, executor]
    );

    if (!editorTarget) return null;

    if (graphIsActive) {
        return (
            <Button
                type="primary"
                size="large"
                icon={<StopOutlined />}
                onClick={stopGraph}
                style={{ pointerEvents: "all" }}
                danger
            />
        );
    }

    return (
        <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={() => {
                void runGraph(editorTarget);
            }}
            style={{ pointerEvents: "all" }}
        />
    );
};

export const EditorGraph: React.FC = () => {
    const [ref, editorData] = useRete(createEditor);

    const [propertiesOpen, setPropertiesOpen] = useState(false);

    const [graphs] = useOuterState(graphStorage);

    const [editorTarget] = useOuterState(editorTargetStorage);

    const [executor] = useOuterState(executorStorage);

    const currentGraph = useMemo(
        () => (editorTarget ? graphs[editorTarget] : null),
        [editorTarget, graphs]
    );

    // Disable editing if graph is active
    const editingDisabled = useMemo(
        () => executor?.graphId === editorTarget,
        [executor, editorTarget]
    );

    // Disable/enable controls manually
    useEffect(() => {
        if (editorTarget && editorData) {
            if (editingDisabled && !editorData.readonly.enabled) {
                editorData.readonly.enable();
                controlDisabledObservable.next([editorTarget, true]);
            } else if (!editingDisabled && editorData.readonly.enabled) {
                editorData.readonly.disable();
                controlDisabledObservable.next([editorTarget, false]);
            }
        }
    }, [editorTarget, editorData, editingDisabled]);

    // Cleanup after unmount
    useEffect(() => {
        return () => {
            if (editorData) editorData.destroy();
        };
    }, [editorData]);

    if (!editorTarget) return null;

    return (
        <>
            <div
                ref={ref}
                data-context-menu="root"
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    fontSize: "1rem",
                    textAlign: "left",
                }}
            ></div>

            <ContextMenu />

            <div
                style={{
                    position: "absolute",
                    top: 5,
                    left: 5,
                    right: 5,
                    pointerEvents: "none",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Space align="center" style={{ pointerEvents: "all" }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setPropertiesOpen(true);
                            }}
                            disabled={editingDisabled}
                        />
                        <GraphRunButton />
                    </Space>
                    {editorData ? (
                        <NodeDeleteButton disabled={editingDisabled} />
                    ) : null}
                </div>
            </div>

            <Drawer
                title="Properties"
                placement="right"
                onClose={() => {
                    setPropertiesOpen(false);
                }}
                open={propertiesOpen}
                extra={
                    <Space>
                        <Popconfirm
                            title="Deleting graph"
                            description="Are you sure?"
                            onConfirm={() => {
                                setPropertiesOpen(false);
                                void deleteGraph(editorTarget);
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="leftTop"
                        >
                            <Button
                                type="primary"
                                size="large"
                                icon={<DeleteOutlined />}
                                danger
                            >
                                {"Delete"}
                            </Button>
                        </Popconfirm>
                    </Space>
                }
            >
                <Input
                    size="large"
                    addonBefore="name"
                    value={currentGraph?.name ?? ""}
                    maxLength={120}
                    onChange={(e) => {
                        updateGraphName(editorTarget, e.target.value);
                    }}
                />
            </Drawer>
        </>
    );
};
