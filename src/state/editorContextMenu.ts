import { StatefulObservable } from "../util/ObservableUtils";

type MenuItem = {
    key: string;
    label: string;
    handler: () => any;
};

type MenuState = {
    clientX: number;
    clientY: number;
    layerX: number;
    layerY: number;
    items: MenuItem[];
    isRoot: boolean;
};

export const menuStateStorage = new StatefulObservable<MenuState | null>(null);

export const showContextMenu = (menu: MenuState) => {
    menuStateStorage.set(menu);
};

export const hideContextMenu = () => {
    menuStateStorage.set(null);
};
