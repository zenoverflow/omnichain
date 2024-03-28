// import { atom } from "jotai";

import { notification } from "antd";

// import { appStore } from ".";

type Notification = {
    type: "error" | "info" | "warning" | "success";
    ts: number;
    text: string;
    duration: number;
};

// type NotificationState = Record<number, Notification>

// const _notificationAtom = atom<NotificationState>({});

// export const notificationAtom = atom((get) => ({ ...get(_notificationAtom) }));

export const showNotification = (n: Notification) => {
    notification.open({
        message: n.type[0].toUpperCase() + n.type.substring(1),
        description: n.text,
        type: n.type,
        duration: n.duration,
    });
};
