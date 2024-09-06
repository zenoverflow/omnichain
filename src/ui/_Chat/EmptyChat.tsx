import { CMarkdown } from "./CMarkdown";

const whatIsNew = `
### External Python Module (beta)

The new external Python module is now in beta! This module exists as a separate Python-based project
built for plugging into OmniChain. It augments the core of OmniChain with several features:

- Use FasterWhisper to transcribe speech to text in the integrated chat view.

- Load and use the lightweight Microsoft Florence2 image-processing models directly via their
respective nodes (ExtLoadFlorence2 and ExtFlorence2).

- Write custom Python functions which you can call via the new ExtCallPythonModule node

- Call your custom Python functions in custom nodes and JS eval nodes via the "callExternalModule" extra
action in the \`context\` parameter (exposed as \`_context\` in the eval nodes).

This module will slowly be expanded to include more integrated features. Note that it's fresh off the
production line, has no documentation yet, and may have bugs. If you find a bug, please report it
on the project's GitHub issues page.

You can find the repo [here](https://github.com/zenoverflow/omnichain_external_python).
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
