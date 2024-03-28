import React, { useEffect, useState } from "react";
import { Menu, MenuProps } from "antd";
import { useAtom } from "jotai";

import { hideContextMenu, menuStateAtom } from "../../state/editorContextMenu";
import { getMenuIcon } from "../../nodes/icons";

export const ContextMenu: React.FC = () => {
    const [menu] = useAtom(menuStateAtom);

    const [active, setActive] = useState(!!menu);

    const [hideTimeout, setHideTimeout] = useState<number | undefined>();

    const haltTimeout = () => {
        if (hideTimeout) clearTimeout(hideTimeout);
    };

    const startTimeout = () => {
        setHideTimeout(
            setTimeout(() => {
                hideContextMenu();
            }, 2500)
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

    if (!menu || !active) return <></>;

    const items: MenuProps["items"] = menu.items.map((item) => ({
        key: item.key,
        icon: getMenuIcon(item.label),
        label: item.label,
        onClick() {
            hideContextMenu();
            item.handler();
        },
        children: item.subitems
            ? item.subitems.map((subitem) => ({
                  key: subitem.key,
                  icon: getMenuIcon(subitem.label),
                  label: subitem.label,
                  onClick() {
                      hideContextMenu();
                      subitem.handler();
                  },
              }))
            : undefined,
    }));

    return (
        <Menu
            style={{
                position: "fixed",
                zIndex: 9001,
                top: menu.clientY,
                left: menu.clientX,
                borderRadius: "10px",
            }}
            mode="vertical"
            theme="dark"
            items={items}
            onMouseEnter={haltTimeout}
            onMouseLeave={startTimeout}
        />
    );
};
