import {
    useRef,
    useEffect,
    useMemo,
    useState,
    useCallback,
    KeyboardEvent,
} from "react";
import { Input, Avatar, Space, Button } from "antd";
import { UserOutlined, SendOutlined } from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";

import { ChatMessage } from "../data/types";
import { optionsStorage } from "../state/options";
import { avatarStorage } from "../state/avatars";
import { chatBlockStorage } from "../state/chatBlock";
import { useOuterState } from "../util/ObservableUtilsReact";
import { addUserMessage, executorStorage } from "../state/executor";

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
                            language={match[1]}
                            style={atomDark}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
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

const SingleMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [avatars] = useOuterState(avatarStorage);

    const avatar = useMemo(() => {
        return Object.values(avatars).find((a) => a.name === message.from);
    }, [avatars, message]);

    return (
        <Space direction="vertical" className="c__msg">
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={32}
                    {...(avatar?.imageBase64.length
                        ? { src: avatar.imageBase64 }
                        : { icon: <UserOutlined /> })}
                    style={{ marginRight: "5px", backgroundColor: "#1677FF" }}
                />
                <div>
                    {avatar?.name ?? message.role === "user"
                        ? "User"
                        : "Assistant"}
                </div>
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
                To start chatting, create a chain (+Chain in the sidebar on the
                left), configure it, click the run button to start it, and then
                come back here.
            </div>
        </div>
    );
};

export const ChatInterface: React.FC = () => {
    const listRef = useRef<HTMLDivElement>(null);
    const [{ userAvatarId }] = useOuterState(optionsStorage);
    const [blocked] = useOuterState(chatBlockStorage);
    const [executor] = useOuterState(executorStorage);
    const [avatars] = useOuterState(avatarStorage);

    const [message, setMessage] = useState("");

    const messages = executor?.sessionMessages ?? [];

    const initCondSatisfied = useMemo(() => !!executor, [executor]);

    const sendMessage = useCallback(() => {
        if (!blocked && initCondSatisfied && message.length > 0) {
            const chainId = executor?.graphId;
            if (chainId) {
                addUserMessage(
                    chainId,
                    userAvatarId ? avatars[userAvatarId].name : "User",
                    message
                );
            }
            setMessage("");
        }
    }, [avatars, blocked, executor, initCondSatisfied, message, userAvatarId]);

    const handleTextboxEnter = useCallback(
        (e: KeyboardEvent) => {
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
    }, [listRef]);

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
                            <SingleMessage key={m.messageId} message={m} />
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
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
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
