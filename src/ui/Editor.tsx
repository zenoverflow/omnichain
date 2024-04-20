import React, { useState } from "react";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CommentOutlined,
    BellOutlined,
} from "@ant-design/icons";
import { Button, Layout, Space, Spin } from "antd";

import { Sider } from "./Sider";
import { EditorGraph } from "./EditorGraph";
import { ChatInterface } from "./Chat";
import { BtnOptions } from "./_Header/BtnOptions";
import { BtnAvatars } from "./_Header/BtnAvatars";
import { BtnApiKeys } from "./_Header/BtnApiKeys";

import { editorTargetStorage, closeEditor } from "../state/editor";
import { loaderStorage } from "../state/loader";
import { useOuterState } from "../util/ObservableUtilsReact";

const { Header, Content } = Layout;

const EditorContent: React.FC = () => {
    const [graphId] = useOuterState(editorTargetStorage);
    return (
        <Content
            id="TheEditor"
            key={graphId}
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
                            <MenuUnfoldOutlined style={{ fontSize: "32px" }} />
                        ) : (
                            <MenuFoldOutlined style={{ fontSize: "32px" }} />
                        )}
                    </div>
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
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<BellOutlined />}
                                style={{
                                    display: "inline-flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            />
                            <BtnAvatars />
                            <BtnApiKeys />
                            <BtnOptions />
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

            {loading ? <Spin fullscreen /> : null}
        </>
    );
};
