import { notification } from "antd";

type Notification = {
    type: "error" | "info" | "warning" | "success";
    ts: number;
    text: string;
    duration: number;
};

export const showNotification = (n: Notification) => {
    notification.open({
        message: n.type[0].toUpperCase() + n.type.substring(1),
        description: n.text,
        type: n.type,
        duration: n.duration,
    });
};
