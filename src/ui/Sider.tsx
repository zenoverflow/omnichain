import { Layout, Menu, MenuProps } from "antd";

import { graphStorage } from "../state/graphs";
import { editorStateStorage, openGraph } from "../state/editor";
import { useOuterState } from "../util/ObservableUtilsReact";
import { ItemIcon } from "./_Sider/ItemIcon";
import { BtnCreateGraph } from "./_Sider/BtnCreateGraph";

const { Sider: AntSider } = Layout;

export const Sider: React.FC<{
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
    const [graphs] = useOuterState(graphStorage);
    const [editorState] = useOuterState(editorStateStorage);

    const items: MenuProps["items"] = Object.values(graphs)
        .sort((a, b) => b.created - a.created)
        .map((graph) => ({
            key: graph.graphId,
            icon: <ItemIcon graphId={graph.graphId} />,
            label: graph.name.trim().length ? graph.name.trim() : "Chain",
        }));

    const handleMenuClick: MenuProps["onClick"] = ({ keyPath }) => {
        const [key] = keyPath;
        openGraph(key);
    };

    return (
        <AntSider
            style={{ overflowY: "auto", overflowX: "hidden" }}
            collapsed={collapsed}
            onBreakpoint={(broken) => {
                setCollapsed(broken);
            }}
            collapsible
            breakpoint="sm"
            trigger={null}
            collapsedWidth={0}
            width={300}
        >
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "stretch",
                    alignItems: "center",
                    padding: "5px 5px",
                }}
            >
                <BtnCreateGraph />
            </div>
            {!collapsed ? (
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={
                        editorState.graphId ? [editorState.graphId] : []
                    }
                    items={items}
                    onClick={handleMenuClick}
                    // openKeys={openKeys}
                    // onOpenChange={setOpenKeys}
                />
            ) : null}
        </AntSider>
    );
};
