import { useMemo, useState } from "react";
import { Input, Button, Modal } from "antd";
import { FullscreenOutlined } from "@ant-design/icons";
import CodeMirror from "@uiw/react-codemirror";
import { javascript as syntaxJs } from "@codemirror/lang-javascript";
import { markdown as syntaxMd } from "@codemirror/lang-markdown";
import { json as syntaxJson } from "@codemirror/lang-json";

import { BaseControl, useControlState } from "./_Control";

export type TextControlConfig = {
    large?: boolean;
    label?: string;
    modalSyntaxHighlight?: "json" | "markdown" | "javascript";
};

const _Modal: React.FC<{
    closeModal: () => any;
    value: string;
    onChange: (v: string) => any;
    modalSyntaxHighlight?: string;
}> = ({ closeModal, value, onChange, modalSyntaxHighlight }) => {
    const syntaxExtensions = useMemo(() => {
        switch (modalSyntaxHighlight) {
            case "json":
                return [syntaxJson()];
            case "markdown":
                return [syntaxMd({})];
            case "javascript":
                return [syntaxJs({})];
            default:
                return [];
        }
    }, [modalSyntaxHighlight]);
    return (
        <Modal
            title={<div style={{ height: "30px" }} />}
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
            width={"80vw"}
        >
            <CodeMirror
                value={value}
                onKeyDown={(e) => {
                    // stop propagation of del key
                    if (e.key === "Delete") {
                        e.stopPropagation();
                    }
                }}
                onKeyUp={(e) => {
                    // stop propagation of del key
                    if (e.key === "Delete") {
                        e.stopPropagation();
                    }
                }}
                onChange={(val, _viewUpdate) => {
                    onChange(val);
                }}
                height="80vh"
                maxHeight="80vh"
                extensions={syntaxExtensions}
                autoFocus
            />
        </Modal>
    );
};

export class TextControl extends BaseControl<string, TextControlConfig> {
    public component() {
        const self = this;

        const _Component: React.FC = () => {
            const controlState = useControlState(
                self.graphId,
                self.nodeId,
                self.controlName,
                self.grabValue()
            );

            const [modalOpen, setModalOpen] = useState(false);

            if (controlState.hidden) return null;

            return self.config.large ?? false ? (
                <>
                    <Input.TextArea
                        disabled={self.readOnly || controlState.disabled}
                        value={controlState.value}
                        onChange={(e) => {
                            const v = e.target.value;
                            controlState.setValue(v);
                            self.value = v;
                        }}
                        className="c__nodecontrol"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            width: "100%",
                            height: "300px",
                            resize: "none",
                        }}
                    />
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            type="primary"
                            size="middle"
                            style={{
                                marginTop: "10px",
                                padding: "0px 5px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fafafa",
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation();
                                setModalOpen(true);
                            }}
                            disabled={
                                self.readOnly ||
                                controlState.disabled ||
                                modalOpen
                            }
                        >
                            <FullscreenOutlined style={{ color: "#000" }} />
                        </Button>
                    </div>
                    {modalOpen ? (
                        <_Modal
                            modalSyntaxHighlight={
                                self.config.modalSyntaxHighlight
                            }
                            closeModal={() => {
                                setModalOpen(false);
                            }}
                            value={controlState.value}
                            onChange={(v) => {
                                controlState.setValue(v);
                                self.value = v;
                            }}
                        />
                    ) : null}
                </>
            ) : (
                <Input
                    disabled={self.readOnly || controlState.disabled}
                    value={controlState.value}
                    onChange={(e) => {
                        const v = e.target.value;
                        self.value = v;
                        controlState.setValue(v);
                    }}
                    className="c__nodecontrol"
                    onPointerDown={(e) => {
                        e.stopPropagation();
                    }}
                    onPointerUp={(e) => {
                        e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                    }}
                    addonBefore={self.config.label ?? "text"}
                    styles={{
                        prefix: {
                            backgroundColor: "#fafafa",
                        },
                    }}
                    style={{ width: "100%" }}
                />
            );
        };

        return _Component;
    }
}
