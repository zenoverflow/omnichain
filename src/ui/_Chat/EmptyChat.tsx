import { CMarkdown } from "./CMarkdown";

const whatIsNew = `
### External Python Module

This module exists as a separate Python-based project built for plugging into OmniChain.
It augments the core of OmniChain with several features:

- Use FasterWhisper to transcribe speech to text in the integrated chat view.

- Load and use the lightweight Microsoft Florence2 image-processing models directly via their
respective nodes (ExtLoadFlorence2 and ExtFlorence2).

- Write custom Python functions which you can call via the new ExtCallPythonModule node

- Call your custom Python functions in custom nodes and JS eval nodes via the "callExternalModule" extra
action in the \`context\` parameter (exposed as \`_context\` in the eval nodes).

This module will slowly be expanded to include more integrated features. You can find the
repo [here](https://github.com/zenoverflow/omnichain_external_python).

### OpenWebUI Compatibility

The OmniChain API is now compatible with OpenWebUI thanks to [Ivan Charapanau](https://github.com/av)!

The new model listing (\`/v1/models\`) lists all the chains in your project, while the chat completion endpoint
(\`/v1/chat/completions\`) now supports streaming responses.
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
                <CMarkdown content={whatIsNew} stylizeContent={false} />
            </div>
        </div>
    );
};
