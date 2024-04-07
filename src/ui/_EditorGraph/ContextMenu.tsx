import React, { useEffect, useState, useRef, useMemo } from "react";
import { Menu, MenuProps, Input } from "antd";
import { useAtom } from "jotai";

import { hideContextMenu, menuStateAtom } from "../../state/editorContextMenu";
import { getMenuIcon } from "../../nodes/icons";

export const ContextMenu: React.FC = () => {
    const [menu] = useAtom(menuStateAtom);
    const menuRef = useRef<any>();

    const [active, setActive] = useState(!!menu);
    const [filter, setFilter] = useState("");

    const [hideTimeout, setHideTimeout] = useState<
        NodeJS.Timeout | undefined
    >();

    const haltTimeout = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
    };

    const startTimeout = () => {
        setHideTimeout(
            setTimeout(() => {
                hideContextMenu();
            }, 1200)
        );
    };

    useEffect(() => {
        if (!!menu && !active) {
            setActive(true);
        }
        //
        else if (!menu && active) {
            haltTimeout();
            setActive(false);
        }
    }, [menu, active]);

    useEffect(() => {
        if (active) startTimeout();
    }, [active]);

    useEffect(() => {
        const listener = (e: any) => {
            if (menuRef.current) {
                if (!(menuRef.current as Node).contains(e.target)) {
                    haltTimeout();
                    hideContextMenu();
                }
            }
        };

        document.addEventListener("click", listener);

        return () => {
            document.removeEventListener("click", listener);
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
            }}
            onMouseEnter={haltTimeout}
            onMouseLeave={startTimeout}
        >
            {menu.isRoot ? (
                <Input
                    type="text"
                    value={filter}
                    onChange={(e) =>
                        setFilter((e.target.value || "").toLowerCase())
                    }
                    placeholder="Search..."
                    onMouseEnter={haltTimeout}
                />
            ) : null}
            <Menu
                mode="vertical"
                theme="dark"
                items={items}
                style={{
                    maxHeight: "420px",
                    overflowY: "auto",
                }}
                onMouseEnter={haltTimeout}
            />
        </div>
    );
};
