import { v4 as uuidv4 } from "uuid";

import type { ChatAvatar } from "../data/types";

export const ImgUtils = {
    empty(name = "Anon"): ChatAvatar {
        return {
            avatarId: uuidv4(),
            name,
            imageBase64: "",
            created: Date.now(),
        };
    },

    resizeImage(
        file: File,
        maxWidth: number,
        maxHeight: number
    ): Promise<string> {
        // const file = fileInput.files[0];
        const reader = new FileReader();

        return new Promise((res, _rej) => {
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        res("");
                        return;
                    }

                    // Set the image smoothing quality
                    // ctx.imageSmoothingQuality = "high";

                    // Calculate the scaling factor to keep aspect ratio
                    const scale = Math.min(
                        maxWidth / img.width,
                        maxHeight / img.height
                    );

                    // Set canvas dimensions scaled down according to the calculated factor
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;

                    // Draw the scaled image on the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Get the resized image data
                    const dataUrl = canvas.toDataURL(file.type);

                    // Call the callback with the result
                    res(dataUrl);
                };
                img.src = (event.target?.result ?? "") as string;
            };
            reader.readAsDataURL(file);
        });
    },
};
