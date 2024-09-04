import axios from "axios";
import { register } from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";

import { EnvUtils } from "./EnvUtils";

import { finishGlobalLoading, startGlobalLoading } from "../state/loader";

const blobToBase64 = async (blob: Blob) => {
    const result = await new Promise<string>((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });

    // Extract base64 content
    const base64Pure = result.split(",")[1] as string | null;

    return base64Pure;
};

/**
 * MediaRecorderUtils
 *
 * FRONTEND-ONLY UTILITY
 * DO NOT IMPORT ON THE BACKEND!
 */
export const MediaRecorderUtils = {
    async init() {
        await register(await connect());
    },

    async callTranscriptionAPI(audioBlob: Blob) {
        try {
            const audioRaw = await blobToBase64(audioBlob);

            if (!audioRaw) {
                console.error("Failed to convert audio blob to base64");
                return null;
            }

            const response = await axios.post(
                `${EnvUtils.baseUrl()}/api/transcribe`,
                {
                    audioRaw: await blobToBase64(audioBlob),
                }
            );

            const res = response.data as Record<string, any>;

            return (res.result || "") as string;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async reloadTranscriptionModel() {
        try {
            startGlobalLoading();
            await axios.post(`${EnvUtils.baseUrl()}/api/transcribe-force-load`);
        } catch (error) {
            console.error(error);
            return null;
        }
        finishGlobalLoading();
    },

    async unloadTranscriptionModel() {
        try {
            startGlobalLoading();
            await axios.post(`${EnvUtils.baseUrl()}/api/transcribe-unload`);
        } catch (error) {
            console.error(error);
            return null;
        }
        finishGlobalLoading();
    },
};
