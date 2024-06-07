import React, { useEffect, useState } from "react";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CommentOutlined,
} from "@ant-design/icons";
import { Button, Layout, Space, Spin } from "antd";

import { Sider } from "./Sider";
import { ComplexErrorModal } from "./_Editor/ComplexErrorModal";
import { EditorGraph } from "./EditorGraph";
import { ChatInterface } from "./Chat";
import { BtnAvatars } from "./_Header/BtnAvatars";
import { BtnApiKeys } from "./_Header/BtnApiKeys";
import { BtnNodeIndex } from "./_Header/BtnNodeIndex";

import { editorTargetStorage, closeEditor } from "../state/editor";
import { loaderStorage } from "../state/loader";
import { useOuterState } from "../util/ObservableUtilsReact";

const { Header, Content } = Layout;

const EditorContent: React.FC = () => {
    const [graphId] = useOuterState(editorTargetStorage);

    const [key, setKey] = useState<string>("no-graph-open");

    useEffect(() => {
        if (graphId) {
            setKey(`${graphId}-${Date.now()}`);
        } else {
            setKey("no-graph-open");
        }
    }, [graphId]);

    return (
        <Content
            id="TheEditor"
            key={key}
            style={{
                margin: 0,
                padding: 0,
                overflow: "auto",
                height: "100%",
                position: "relative",
                animation: "fadeIn .5s",
            }}
        >
            {graphId ? <EditorGraph /> : <ChatInterface />}
        </Content>
    );
};

export const Editor: React.FC = () => {
    const [siderCollapsed, setSiderCollapsed] = useState(false);
    const [graphId] = useOuterState(editorTargetStorage);
    const [loading] = useOuterState(loaderStorage);

    return (
        <>
            <Layout style={{ height: "100vh", maxHeight: "100vh" }}>
                <Header
                    style={{
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingLeft: 10,
                        paddingRight: 10,
                        color: "#f2f2f2",
                    }}
                >
                    <Space>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setSiderCollapsed(!siderCollapsed);
                            }}
                        >
                            {siderCollapsed ? (
                                <MenuUnfoldOutlined
                                    style={{ fontSize: "32px" }}
                                />
                            ) : (
                                <MenuFoldOutlined
                                    style={{ fontSize: "32px" }}
                                />
                            )}
                        </div>
                        <span
                            style={{
                                margin: 0,
                                marginLeft: 10,
                                fontSize: "14px",
                            }}
                        >
                            {`OmniChain v${
                                (import.meta as any).env.PACKAGE_VERSION
                            }`}
                        </span>
                    </Space>
                    <Space align="center">
                        {graphId ? (
                            <Button
                                type="primary"
                                size="large"
                                onClick={closeEditor}
                                icon={<CommentOutlined />}
                            >
                                {"Chat"}
                            </Button>
                        ) : null}
                        <Space align="center">
                            <BtnAvatars />
                            <BtnApiKeys />
                            <BtnNodeIndex />
                        </Space>
                    </Space>
                </Header>
                <Layout style={{ background: "#343541" }} hasSider>
                    <Sider
                        collapsed={siderCollapsed}
                        setCollapsed={setSiderCollapsed}
                    />
                    <EditorContent />
                </Layout>
            </Layout>

            <ComplexErrorModal />

            {loading ? <Spin fullscreen /> : null}
        </>
    );
};
