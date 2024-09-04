import { CMarkdown } from "./CMarkdown";

const whatIsNew = `
### External Python Module beta!

The new external Python module is now in beta! This module exists as a separate Python-based project
built for plugging into OmniChain. It allows you to use Python code in your custom nodes, as well as
predefined models. For now it's mainly used for enabling Whisper transcriptions in the chat view.
You can find the project [here](https://github.com/zenoverflow/omnichain_external_python).

Note that this module is highly experimental, has no documentation yet, and may have bugs. If you
find a bug, please report it on the project's GitHub issues page.

### Whisper Transcription in the chat view

If you installed the Python module, you can now use any models available via FasterWhisper to transcribe
your speech into text messages when using the chat view. You can enable this feature in the settings menu.

### Florence2 nodes

The new Python module also allows you to use Microsoft's Florence2 models via two new nodes
(ExtLoadFlorence2 and ExtFlorence2). These nodes support all actions listed on the Florence2 HuggingFace repo.
`.trim();

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
                overflowY: "scroll",
            }}
        >
            <div style={{ maxWidth: "700px" }}>
                To start chatting, create a chain (+Chain in the sidebar on the
                left), configure it, click the run button to start it, and then
                come back here.
                <div
                    className="c__mstyle"
                    style={{
                        textAlign: "center",
                        marginTop: "80px",
                        marginBottom: "20px",
                        fontSize: "32px",
                    }}
                >
                    {"What's new?"}
                </div>
                <CMarkdown content={whatIsNew} />
            </div>
        </div>
    );
};
