import { useMemo } from "react";

import Prism from "prismjs";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export const CMarkdown: React.FC<{
    content: string;
    stylizeContent?: boolean;
}> = ({ content, stylizeContent = true }) => {
    const stringContent = useMemo(() => `${content as any}`, [content]);

    const stylizedContent = useMemo(() => {
        // Add spans with orange text color around text with double quotes
        // Ignore anything within code blocks (denoted by triple backticks)
        const stylizedQuotes = stringContent.replace(
            /```[\s\S]*?```|`[\s\S]*?`|"(.*?)"/g,
            (_, p1) => {
                if (p1) {
                    return `<span style="color: #fa8c16;">"${p1}"</span>`;
                }
                return _;
            }
        );

        // Add spans with grey color around text surrounded by '*'
        // The '*' are removed
        // Ignore anything within code blocks (denoted by triple backticks)
        const stylizedBold = stylizedQuotes.replace(
            /```[\s\S]*?```|`[\s\S]*?`|\*(.*?)\*/g,
            (_, p1) => {
                if (p1) {
                    return `<span style="color: #f0f0f0; font-style: italic;">${p1}</span>`;
                }
                return _;
            }
        );

        return stylizedBold;
    }, [stringContent]);

    return (
        <Markdown
            // className="c__keep-whitespace"
            rehypePlugins={[rehypeRaw]}
            components={{
                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");

                    if (!match) {
                        return (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        );
                    }

                    const prismLanguage = Prism.languages[match[1]];

                    if (!(prismLanguage as any)) {
                        return (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        );
                    }

                    return (
                        <div
                            style={{ backgroundColor: "#000", padding: "10px" }}
                            dangerouslySetInnerHTML={{
                                __html: Prism.highlight(
                                    String(children).replace(/\n$/, ""),
                                    prismLanguage,
                                    match[1]
                                ),
                            }}
                            {...(rest as any)}
                            className={className}
                        />
                    );
                },

                a(props) {
                    if ((props.href ?? "").startsWith("http")) {
                        return (
                            <a
                                href={props.href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {props.children}
                            </a>
                        );
                    }
                    return props.href || "";
                },
            }}
        >
            {stylizeContent ? stylizedContent : stringContent}
        </Markdown>
    );
};
