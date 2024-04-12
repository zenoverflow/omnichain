import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { Input, Avatar, Space, Button } from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// @ts-ignore
import Markdown from "react-markdown";

import { ChatMessage } from "../data/types";
import { optionsAtom } from "../state/options";
import {
    messageStorageAtom,
    loadMessagesFromDb,
    unloadMessages,
    addMessage,
} from "../state/messages";
import { avatarStorageAtom } from "../state/avatars";
import { startGlobalLoading, finishGlobalLoading } from "../state/loader";
import { chatBlockAtom } from "../state/chatBlock";

const { TextArea } = Input;

let exampleMarkdown = `
- Li 1
- Li 2
- Li 3
`;

exampleMarkdown += "```javascript";

exampleMarkdown += `
const test = "whatever";

function grog(example) {
    return example;
}
`;
exampleMarkdown += "```";

const CMarkdown: React.FC<{ children: string }> = ({ children }) => {
    return (
        <Markdown
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                        <SyntaxHighlighter
                            {...(rest as any)}
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            style={atomDark}
                            PreTag="div"
                        />
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {children}
        </Markdown>
    );
};

const ChatMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [avatarStorage] = useAtom(avatarStorageAtom);

    const avatar = useMemo(() => {
        return Object.values(avatarStorage).find(
            (a) => a.avatarId === message.avatarId
        );
    }, [avatarStorage]);

    return (
        <Space direction="vertical" className="c__msg">
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={32}
                    {...(avatar.imageBase64.length
                        ? { src: avatar.imageBase64 }
                        : { icon: <UserOutlined /> })}
                    style={{ marginRight: "5px", backgroundColor: "#1677FF" }}
                />
                <div>{avatar.name}</div>
            </div>
            <CMarkdown>{message.content}</CMarkdown>
        </Space>
    );
};

export const EmptyChat: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "#f2f2f2",
            }}
        >
            <div
                className="c__mstyle"
                style={{
                    maxWidth: "700px",
                    fontSize: "32px",
                    marginBottom: "10px",
                }}
            >
                Welcome!
            </div>

            <div style={{ maxWidth: "700px" }}>
                To start chatting here, first create avatars for yourself and
                your AI from the avatars menu in the top bar. Then, create and
                configure a chain (+Chain in the sidebar on the left) to
                communicate with your AI. Finally, use the options menu in the
                top bar to select your own avatar and the chain to use for the
                chat.
            </div>
        </div>
    );
};

export const ChatInterface: React.FC = () => {
    const listRef = useRef<HTMLDivElement>();
    const [{ chainChatId, userAvatarId }] = useAtom(optionsAtom);
    const [messageStorage] = useAtom(messageStorageAtom);
    const [blocked] = useAtom(chatBlockAtom);

    const [message, setMessage] = useState("");

    const messages = useMemo(() => {
        return Object.values(messageStorage).sort(
            (a, b) => b.created - a.created
        );
    }, [messageStorage]);

    const initCondSatisfied = useMemo(
        () => chainChatId && userAvatarId,
        [chainChatId, userAvatarId]
    );

    const sendMessage = useCallback(() => {
        if (!blocked) {
            addMessage(chainChatId, userAvatarId, message);
            setMessage("");
        }
    }, [chainChatId, userAvatarId, message, setMessage]);

    const handleTextboxEnter = useCallback(
        (e: any) => {
            if (e.key === "Enter" && !e.shiftKey) {
                sendMessage();
            }
        },
        [sendMessage]
    );

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [listRef.current]);

    // Load messages for the selected chat chain
    useEffect(() => {
        if (initCondSatisfied) {
            startGlobalLoading();
            void loadMessagesFromDb(chainChatId).then(() => {
                finishGlobalLoading();
            });
        }

        return () => {
            unloadMessages();
        };
    }, [chainChatId, initCondSatisfied]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "#f2f2f2",
            }}
        >
            {initCondSatisfied ? (
                <>
                    <div
                        ref={listRef}
                        style={{
                            flexGrow: 1,
                            color: "white",
                            padding: "10px",
                        }}
                    >
                        {messages.map((m) => (
                            <ChatMessage key={m.messageId} message={m} />
                        ))}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ width: "5px" }} />
                        <TextArea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyUp={handleTextboxEnter}
                            placeholder="Type a message..."
                            autoSize={{ minRows: 2, maxRows: 8 }}
                            style={{ flex: "1" }}
                            disabled={blocked}
                        />
                        <div style={{ width: "5px" }} />
                        <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined />}
                            style={{ height: "100%" }}
                            onClick={sendMessage}
                            disabled={blocked}
                        />
                        <div style={{ width: "5px" }} />
                    </div>
                </>
            ) : (
                <EmptyChat />
            )}
        </div>
    );
};
