import { Layout, Menu, MenuProps, Tooltip } from "antd";

import { graphStorage } from "../state/graphs";
import { editorTargetStorage, openEditor } from "../state/editor";
import { useOuterState } from "../util/ObservableUtilsReact";
import { ItemIcon } from "./_Sider/ItemIcon";
import { BtnCreateGraph } from "./_Sider/BtnCreateGraph";
import { useMemo } from "react";

const { Sider: AntSider } = Layout;

export const Sider: React.FC<{
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
    const [graphs] = useOuterState(graphStorage);
    const [editorTarget] = useOuterState(editorTargetStorage);

    const items: MenuProps["items"] = useMemo(
        () =>
            Object.entries(graphs)
                .sort((a, b) => b[1].created - a[1].created)
                .map(([graphId, { name }]) => {
                    const label = name.trim().length ? name.trim() : "Chain";
                    return {
                        key: graphId,
                        icon: <ItemIcon graphId={graphId} />,
                        label: <Tooltip title={label}>{label}</Tooltip>,
                    };
                }),
        [graphs]
    );

    const handleMenuClick: MenuProps["onClick"] = ({ keyPath }) => {
        const [key] = keyPath;
        openEditor(key);
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
                    selectedKeys={editorTarget ? [editorTarget] : []}
                    items={items}
                    onClick={handleMenuClick}
                    // openKeys={openKeys}
                    // onOpenChange={setOpenKeys}
                />
            ) : null}
        </AntSider>
    );
};
