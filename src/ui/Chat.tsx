import { useRef, useEffect } from "react";
import { Input, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// @ts-ignore
import Markdown from "react-markdown";

import { optionsAtom } from "../state/options";

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

const UserMessage: React.FC<{ children: string }> = ({ children }) => {
    return (
        <Space direction="vertical" className="c__msg">
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ marginRight: "5px", backgroundColor: "#1677FF" }}
                />
                <div>{"You"}</div>
            </div>
            <CMarkdown>{children}</CMarkdown>
        </Space>
    );
};

const RoboMessage: React.FC<{ children: string }> = ({ children }) => {
    return (
        <Space direction="vertical" className="c__msg">
            <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ marginRight: "5px", backgroundColor: "#1677FF" }}
                />
                <div>{"AI"}</div>
            </div>
            <CMarkdown>{children}</CMarkdown>
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
                To start chatting here, create a chain (+Chain in the sidebar on
                the left) and select it from the options menu (the cog icon in
                the top bar).
            </div>
        </div>
    );
};

export const ChatInterface: React.FC = () => {
    const listRef = useRef<HTMLDivElement>();
    const [{ chainChatId }] = useAtom(optionsAtom);

    const mockMessages = [];

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [listRef.current]);

    if (!chainChatId || !mockMessages.length) {
        return <EmptyChat />;
    }

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
            <div
                ref={listRef}
                style={{
                    flexGrow: 1,
                    color: "white",
                    padding: "10px",
                }}
            >
                <UserMessage>{"Example message."}</UserMessage>
                <RoboMessage>{exampleMarkdown}</RoboMessage>
            </div>
            <TextArea
                // value={value}
                // onChange={(e) => setValue(e.target.value)}
                placeholder="Ask me anything..."
                autoSize={{ minRows: 2, maxRows: 8 }}
            />
        </div>
    );
};
