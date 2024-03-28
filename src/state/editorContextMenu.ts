import { atom } from "jotai";

import { appStore } from ".";

type MenuItem = {
    key: string;
    label: string;
    handler: () => any;
    subitems?: MenuItem[];
};

type MenuState = {
    clientX: number;
    clientY: number;
    layerX: number;
    layerY: number;
    items: MenuItem[];
};

type _MenuStateAtom = MenuState | null;

const _menuStateAtom = atom<_MenuStateAtom>(null);

export const menuStateAtom = atom<_MenuStateAtom>(
    //
    (get) => get(_menuStateAtom)
);

export const showContextMenu = (menu: MenuState) => {
    appStore.set(_menuStateAtom, menu);
};

export const hideContextMenu = () => {
    appStore.set(_menuStateAtom, null);
};
