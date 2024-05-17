import React, { useEffect, useState, useRef, useMemo } from "react";
import { Menu, MenuProps, Input } from "antd";

import {
    hideContextMenu,
    menuStateStorage,
} from "../../state/editorContextMenu";
import { useOuterState } from "../../util/ObservableUtilsReact";
import { getMenuIcon } from "../_Rete/NodeIcons";

export const ContextMenu: React.FC = () => {
    const [menu] = useOuterState(menuStateStorage);
    const menuRef = useRef<any>();

    const [active, setActive] = useState(!!menu);
    const [filter, setFilter] = useState("");

    // const [hideTimeout, setHideTimeout] = useState<
    //     NodeJS.Timeout | undefined
    // >();

    // const haltTimeout = useCallback(() => {
    //     if (hideTimeout) clearTimeout(hideTimeout);
    // }, [hideTimeout]);

    // const startTimeout = () => {
    //     setHideTimeout(
    //         setTimeout(() => {
    //             hideContextMenu();
    //         }, 1200)
    //     );
    // };

    useEffect(() => {
        if (!!menu && !active) {
            setActive(true);
            setFilter("");
        }
        //
        else if (!menu && active) {
            // haltTimeout();
            setActive(false);
            setFilter("");
        }
    }, [menu, active]);

    // useEffect(() => {
    //     if (active) startTimeout();
    // }, [active]);

    useEffect(() => {
        const listener = (e: any) => {
            if (menuRef.current) {
                if (!(menuRef.current as Node).contains(e.target)) {
                    // haltTimeout();
                    hideContextMenu();
                }
            }
        };

        window.addEventListener("click", listener);

        return () => {
            window.removeEventListener("click", listener);
        };
    }, [menuRef]);

    const items: MenuProps["items"] = useMemo(() => {
        if (!menu || !active) return [];

        return menu.items
            .filter((i) =>
                filter.length ? i.label.toLowerCase().includes(filter) : true
            )
            .map((item) => ({
                key: item.key,
                icon: getMenuIcon(item.label),
                label: item.label,
                onClick() {
                    hideContextMenu();
                    item.handler();
                },
            }));
    }, [menu, active, filter]);

    if (!menu || !active) return <></>;

    return (
        <div
            ref={menuRef}
            style={{
                position: "fixed",
                zIndex: 9001,
                top: menu.clientY,
                left: menu.clientX,
                borderRadius: "10px",
                backgroundColor: "#001529",
                paddingBottom: "5px",
                overflow: "hidden",
            }}
            // onMouseEnter={haltTimeout}
            // onMouseLeave={startTimeout}
        >
            {menu.isRoot ? (
                <Input
                    type="text"
                    value={filter}
                    onChange={(e) => {
                        setFilter((e.target.value || "").toLowerCase());
                    }}
                    placeholder="Search..."
                    // onMouseEnter={haltTimeout}
                    style={{ marginBottom: "10px" }}
                    autoFocus
                />
            ) : null}
            {filter.length && !items.length ? (
                <span
                    style={{
                        display: "block",
                        padding: "5px 0px",
                        textAlign: "center",
                        width: "100$",
                        color: "#fff",
                        opacity: 0.6,
                    }}
                >
                    No matches!
                </span>
            ) : (
                <Menu
                    mode="vertical"
                    theme="dark"
                    items={items}
                    style={{
                        minWidth: "200px",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                    // onMouseEnter={haltTimeout}
                />
            )}
        </div>
    );
};
