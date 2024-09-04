import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import { MediaRecorder } from "extendable-media-recorder";

import { useOuterState } from "../../util/ObservableUtilsReact";

import { executorStorage } from "../../state/executor";
import { optionsStorage } from "../../state/options";
import { MediaRecorderUtils } from "../../util/MediaRecorderUtils";
import { ExternalModuleUtils } from "../../util/ExternalModuleUtils";

export const BtnSpeak: React.FC<{
    onBusyState: (busy: boolean) => any;
    onText: (text: string) => any;
}> = ({ onBusyState, onText }) => {
    const [executor] = useOuterState(executorStorage);
    const [options] = useOuterState(optionsStorage);

    const [pythonAvailable, setPythonAvailable] = useState(false);
    const [onStop, setOnStop] = useState<{ stop: () => any } | null>(null);

    // handle recording start
    const handleMouseDown = useCallback(async () => {
        onBusyState(true);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/wav",
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const rec = new Blob(chunks, { type: "audio/wav" });

            void (async () => {
                if (rec.size > 0) {
                    const result =
                        await MediaRecorderUtils.callTranscriptionAPI(rec);
                    if (result) {
                        onText(result);
                    }
                }
                onBusyState(false);
            })();
        };

        mediaRecorder.start();

        setOnStop({
            stop: () => {
                mediaRecorder.stop();
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            },
        });
    }, [onBusyState, onText]);

    useEffect(() => {
        void (async () => {
            try {
                const pythonAvailable = await ExternalModuleUtils.pingModule(
                    "python"
                );
                setPythonAvailable(pythonAvailable);

                if (!pythonAvailable) return;

                const tempStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                tempStream.getAudioTracks().forEach((track) => {
                    track.stop();
                });
            } catch (error) {
                console.error("Error setting up recording", error);
            }
        })();
    }, []);

    const visible = useMemo(
        () => pythonAvailable && options.whisper !== "disabled",
        [options.whisper, pythonAvailable]
    );

    const blocked = useMemo(() => executor?.chatBlocked || false, [executor]);

    if (!visible) return null;

    return (
        <>
            <div style={{ width: "5px" }} />
            <Button
                type="primary"
                size="large"
                icon={<AudioOutlined />}
                style={{ height: "100%" }}
                disabled={blocked}
                onMouseDown={() => {
                    void handleMouseDown();
                }}
                onMouseUp={() => {
                    onStop?.stop();
                }}
                onMouseLeave={() => {
                    onStop?.stop();
                }}
            />
        </>
    );
};
