import {
    useRef,
    useEffect,
    useMemo,
    useState,
    useCallback,
    KeyboardEvent,
} from "react";
import { Input, Avatar, Space, Button, Spin } from "antd";
import {
    UserOutlined,
    SendOutlined,
    FileAddOutlined,
    FileImageOutlined,
    CloseOutlined,
    DownloadOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { ChatMessage } from "../data/types";
import { optionsStorage } from "../state/options";
import { avatarStorage } from "../state/avatars";
import { useOuterState } from "../util/ObservableUtilsReact";
import { addUserMessage, executorStorage } from "../state/executor";
import { startGlobalLoading, finishGlobalLoading } from "../state/loader";

const { TextArea } = Input;

const CMarkdown: React.FC<{ content: string }> = ({ content }) => {
    return (
        <Markdown
            // className="c__keep-whitespace"
            rehypePlugins={[rehypeRaw]}
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
            {content}
        </Markdown>
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

export const FileGrid: React.FC<{
    files: ChatMessage["files"];
    type: "image" | "file";
    onRemove?: (index: number) => any;
}> = ({ files, type, onRemove }) => {
    const handleDownload = useCallback(
        (index: number) => {
            const file = files[index];
            const link = document.createElement("a");
            link.href = `data:${file.mimetype};base64,${file.content}`;
            link.download = file.name;
            link.click();
        },
        [files]
    );
    return (
        <div
            style={{
                // display: "flex",
                overflowX: "auto",
                // height: "110px",
                // padding: "5px",
                whiteSpace: "nowrap",
                position: "relative",
            }}
            onWheel={(event) =>
                (event.currentTarget.scrollLeft +=
                    event.deltaY > 0 ? 100 : -100)
            }
        >
            {files.map((file, i) => (
                <div
                    key={`${files.length.toString()}-${i.toString()}`}
                    style={{
                        position: "relative",
                        display: "inline-block",
                        marginRight: "5px",
                    }}
                >
                    {type === "image" ? (
                        <div
                            style={{
                                width: "100px",
                                height: "100px",
                                background: `url(data:${file.mimetype};base64,${file.content})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                paddingRight: "25px",
                                textAlign: "center",
                            }}
                        >
                            {file.name}
                        </div>
                    )}
                    {onRemove ? (
                        <CloseOutlined
                            style={{
                                position: "absolute",
                                top: "0",
                                right: "0",
                                color: "red",
                                cursor: "pointer",
                                backgroundColor: "white",
                            }}
                            onClick={() => {
                                onRemove(i);
                            }}
                        />
                    ) : (
                        <DownloadOutlined
                            style={{
                                position: "absolute",
                                top: "0",
                                right: "0",
                                color: "green",
                                cursor: "pointer",
                                backgroundColor: "white",
                            }}
                            onClick={() => {
                                handleDownload(i);
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const SingleMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [avatars] = useOuterState(avatarStorage);

    const avatar = useMemo(() => {
        return Object.values(avatars).find((a) => a.name === message.from);
    }, [avatars, message]);

    const images = useMemo(() => {
        return message.files.filter((f) => f.mimetype.startsWith("image/"));
    }, [message]);

    const files = useMemo(() => {
        return message.files.filter((f) => !f.mimetype.startsWith("image/"));
    }, [message]);

    // const content = useMemo(() => {
    //     // Add images as markdown at the bottom of message.content
    //     // Note that each image is a base64 string
    //     let content = message.content;
    //     const images = message.files.filter((f) =>
    //         f.mimetype.startsWith("image/")
    //     );
    //     if (images.length) {
    //         content += "\n\n";
    //     }
    //     for (const img of images) {
    //         content += `![Image](${img.content})\n`;
    //     }
    //     return content;
    // }, [message]);

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
                    {avatar?.name ??
                        (message.role === "user" ? "User" : "Assistant")}
                </div>
            </div>
            <CMarkdown content={message.content} />

            {images.length ? <FileGrid files={images} type="image" /> : null}

            {files.length ? <FileGrid files={files} type="file" /> : null}
        </Space>
    );
};

export const ChatInterface: React.FC = () => {
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<any>(null);

    const [{ userAvatarId }] = useOuterState(optionsStorage);
    const [executor] = useOuterState(executorStorage);
    const [avatars] = useOuterState(avatarStorage);

    const [message, setMessage] = useState("");
    const [images, setImages] = useState<ChatMessage["files"]>([]);
    const [files, setFiles] = useState<ChatMessage["files"]>([]);

    const messages = useMemo(() => executor?.sessionMessages ?? [], [executor]);

    const initCondSatisfied = useMemo(() => !!executor, [executor]);

    const blocked = executor?.chatBlocked || false;

    const sendMessage = useCallback(() => {
        if (!blocked && initCondSatisfied && message.length > 0) {
            const chainId = executor?.graphId;
            if (chainId) {
                addUserMessage(
                    chainId,
                    message,
                    userAvatarId ? avatars[userAvatarId].name : "User",
                    [...images, ...files]
                );
            }
            setMessage("");
            setFiles([]);
            setImages([]);
        }
    }, [
        avatars,
        blocked,
        executor?.graphId,
        files,
        images,
        initCondSatisfied,
        message,
        userAvatarId,
    ]);

    const handleTextboxEnter = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        },
        [sendMessage]
    );

    const handleAddFile = useCallback(
        (accept?: string) => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            if (accept) {
                fileInput.accept = accept;
            }

            fileInput.onchange = async () => {
                if (fileInput.files?.length) {
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result;
                        if (typeof base64 === "string") {
                            // Extract base64 content
                            const base64Pure = base64.split(",")[1] as
                                | string
                                | null;
                            if (base64Pure?.length) {
                                // Check if it's an image
                                if (accept?.startsWith("image/")) {
                                    setImages([
                                        ...images,
                                        {
                                            mimetype: file.type,
                                            content: base64Pure,
                                            name: file.name,
                                        },
                                    ]);
                                }
                                // Otherwise it's a file
                                else {
                                    setFiles([
                                        ...files,
                                        {
                                            mimetype: file.type,
                                            content: base64Pure,
                                            name: file.name,
                                        },
                                    ]);
                                }
                            }
                        }
                        finishGlobalLoading();
                    };
                    // Stop loading on errors
                    reader.onerror = () => {
                        finishGlobalLoading();
                    };
                    reader.onabort = () => {
                        finishGlobalLoading();
                    };
                    startGlobalLoading();
                    reader.readAsDataURL(file);
                }
            };

            const cleanup = () => {
                fileInput.remove();
            };

            fileInput.oncancel = cleanup;
            fileInput.onabort = cleanup;

            fileInput.click();
        },
        [files, images]
    );

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages.length, blocked]);

    useEffect(() => {
        if (inputRef.current && !blocked) {
            inputRef.current.focus();
        }
    }, [blocked]);

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
                            overflowY: "auto",
                        }}
                    >
                        {messages.map((m) => (
                            <SingleMessage key={m.messageId} message={m} />
                        ))}
                        {blocked ? (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Spin
                                    indicator={
                                        <LoadingOutlined
                                            style={{ fontSize: 48 }}
                                            spin
                                        />
                                    }
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Images list */}
                    {images.length ? (
                        <div style={{ marginLeft: "5px" }}>
                            <FileGrid
                                files={images}
                                type="image"
                                onRemove={(index) => {
                                    const updatedImages = [...images];
                                    updatedImages.splice(index, 1);
                                    setImages(updatedImages);
                                }}
                            />
                        </div>
                    ) : null}

                    {/* Files list */}
                    {files.length ? (
                        <div style={{ marginLeft: "5px" }}>
                            <FileGrid
                                files={files}
                                type="file"
                                onRemove={(index) => {
                                    const updatedFiles = [...files];
                                    updatedFiles.splice(index, 1);
                                    setFiles(updatedFiles);
                                }}
                            />
                        </div>
                    ) : null}

                    {/* Input area */}
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
                            className="c__mstyle"
                            ref={inputRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                            onKeyDown={handleTextboxEnter}
                            placeholder="Type a message..."
                            autoSize={{ minRows: 2, maxRows: 8 }}
                            style={{ flex: "1" }}
                            disabled={blocked}
                            autoFocus
                        />
                        <div style={{ width: "5px" }} />
                        <Button
                            type="primary"
                            size="large"
                            icon={<FileAddOutlined />}
                            style={{ height: "100%" }}
                            onClick={() => {
                                handleAddFile();
                            }}
                            disabled={blocked}
                        />
                        <div style={{ width: "5px" }} />
                        <Button
                            type="primary"
                            size="large"
                            icon={<FileImageOutlined />}
                            style={{ height: "100%" }}
                            onClick={() => {
                                handleAddFile("image/*");
                            }}
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
