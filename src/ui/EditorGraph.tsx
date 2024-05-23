import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRete } from "rete-react-plugin";
import {
    DeleteOutlined,
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined,
    ExportOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Space, Input, Popconfirm, Select } from "antd";

import { createEditor } from "./_Rete";
import { ContextMenu } from "./_EditorGraph/ContextMenu";
import { useOuterState } from "../util/ObservableUtilsReact";

import {
    graphStorage,
    updateGraphName,
    updateGraphExecPersistence,
    deleteGraph,
} from "../state/graphs";
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

    const otherGraphIsActive = useMemo(
        () => (executor ? executor.graphId !== editorTarget : false),
        [editorTarget, executor]
    );

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
                onClick={() => {
                    void stopGraph();
                }}
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
            disabled={otherGraphIsActive}
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

    const handleExport = useCallback(() => {
        if (!currentGraph) return;

        const link = document.createElement("a");

        link.href =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(currentGraph, null, 2));

        link.download = `${currentGraph.name}.json`;

        link.click();
    }, [currentGraph]);

    const handleCopyId = useCallback(async () => {
        if (!currentGraph) return;
        try {
            await navigator.clipboard.writeText(currentGraph.graphId);
        } catch (error) {
            console.error(error);
        }
    }, [currentGraph]);

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

    if (!editorTarget || !currentGraph) return null;

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
                destroyOnClose
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
                <Space direction="vertical">
                    <Button
                        type="primary"
                        size="large"
                        icon={<ExportOutlined />}
                        onClick={() => {
                            handleExport();
                        }}
                    >
                        {"Export"}
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CopyOutlined />}
                        onClick={() => {
                            void handleCopyId();
                        }}
                    >
                        {"Copy ID"}
                    </Button>
                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%", marginTop: "10px" }}
                    >
                        <span style={{ opacity: 0.7 }}>Name</span>
                        <Input
                            size="large"
                            defaultValue={currentGraph.name}
                            maxLength={120}
                            onChange={(e) => {
                                updateGraphName(editorTarget, e.target.value);
                            }}
                        />
                    </Space>
                    <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%", marginTop: "10px" }}
                    >
                        <span style={{ opacity: 0.7 }}>Save mode</span>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select an option..."
                            options={[
                                { label: "On change", value: "onChange" },
                                { label: "On demand", value: "onDemand" },
                            ]}
                            onChange={(v) => {
                                updateGraphExecPersistence(editorTarget, v);
                            }}
                            defaultValue={currentGraph.execPersistence}
                        />
                        <span
                            className="c__mstyle"
                            style={{ fontSize: "16px", opacity: 0.7 }}
                        >
                            Restart the running chain for this to take effect!
                            The chain can update its own state and save it to
                            disk during execution. This can bottleneck
                            performance, and is the reason why the SaveState
                            node exists. When you select the On Demand option,
                            the chain will only save its state when a SaveState
                            node is triggered. This can vastly improve
                            performance, especially for complex chains.
                        </span>
                    </Space>
                </Space>
            </Drawer>
        </>
    );
};
