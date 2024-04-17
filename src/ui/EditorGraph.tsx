import React, { useMemo, useState, useEffect } from "react";
import { useRete } from "rete-react-plugin";
import { useAtom } from "jotai";

import {
    DeleteOutlined,
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";

import { Button, Drawer, Space, Input, Popconfirm } from "antd";

import { createEditor } from "./rete";

import {
    currentGraphAtom,
    deleteCurrentGraph,
    deleteSelectedNodes,
    editorStateAtom,
    runCurrentGraph,
    stopCurrentGraph,
    updateCurrentGraphName,
} from "../state/editor";

import { nodeSelectionAtom } from "../state/nodeSelection";
import { appStore } from "../state";
import { ExecutorInstance, executorAtom } from "../state/executor";

import { NodeContextObj } from "../nodes/context";
import { ContextMenu } from "./_EditorGraph/ContextMenu";

type DeleteButtonProps = {
    nodeContext: NodeContextObj;
    disabled?: boolean;
};

const NodeDeleteButton: React.FC<DeleteButtonProps> = (props) => {
    const [targets] = useAtom(nodeSelectionAtom);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === "Delete" && targets.length) {
                // Prevent deletions on active graph
                const editorState = appStore.get(editorStateAtom);
                if (editorState.graphId) {
                    const executorState = appStore.get(executorAtom);
                    const currentExec = executorState[
                        editorState.graphId
                    ] as ExecutorInstance | null;
                    if (!currentExec) {
                        void deleteSelectedNodes(props.nodeContext);
                    }
                }
            }
        };

        window.addEventListener("keyup", listener);

        return () => {
            window.removeEventListener("keyup", listener);
        };
    }, [targets, props.nodeContext]);

    if (!targets.length) return null;

    return (
        <Popconfirm
            title={
                `Deleting ${targets.length.toString()} node` +
                (targets.length === 1 ? "" : "s")
            }
            description="Are you sure?"
            onConfirm={() => {
                void deleteSelectedNodes(props.nodeContext);
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
    const [{ graphId }] = useAtom(editorStateAtom);
    const [executor] = useAtom(executorAtom);

    const graphIsActive = useMemo(
        () => (graphId ? !!executor[graphId] : false),
        [graphId, executor]
    );

    if (graphIsActive) {
        return (
            <Button
                type="primary"
                size="large"
                icon={<StopOutlined />}
                onClick={stopCurrentGraph}
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
                void runCurrentGraph();
            }}
            style={{ pointerEvents: "all" }}
        />
    );
};

export const EditorGraph: React.FC = () => {
    const [ref, editor] = useRete(createEditor);

    const [propertiesOpen, setPropertiesOpen] = useState(false);

    const [currentGraph] = useAtom(currentGraphAtom);

    const [{ graphId }] = useAtom(editorStateAtom);

    const [executor] = useAtom(executorAtom);

    // Disable editing if graph is active
    const editingDisabled = useMemo(
        () => (graphId ? !!executor[graphId] : false),
        [executor, graphId]
    );

    // Disable/enable controls manually
    useEffect(() => {
        if (currentGraph && editor) {
            if (editingDisabled && !editor.readonly.enabled) {
                editor.readonly.enable();

                document
                    .querySelectorAll(".c__nodecontrol")
                    .forEach((i: any) => {
                        i.disabled = true;
                    });

                document
                    .querySelectorAll(".c__nodecontrol input")
                    .forEach((i: any) => {
                        i.disabled = true;
                    });
            } else if (!editingDisabled && editor.readonly.enabled) {
                editor.readonly.disable();

                document
                    .querySelectorAll(".c__nodecontrol")
                    .forEach((i: any) => {
                        i.disabled = false;
                    });

                document
                    .querySelectorAll(".c__nodecontrol input")
                    .forEach((i: any) => {
                        i.disabled = false;
                    });
            }
        }
    }, [currentGraph, editor, editingDisabled]);

    if (!currentGraph) return null;

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
                    {editor ? (
                        <NodeDeleteButton
                            nodeContext={editor.nodeContext}
                            disabled={editingDisabled}
                        />
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
                            onConfirm={deleteCurrentGraph}
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
                    value={currentGraph.name}
                    maxLength={120}
                    onChange={(e) => {
                        updateCurrentGraphName(e.target.value);
                    }}
                />
            </Drawer>
        </>
    );
};
