import { v4 as uuidv4 } from "uuid";
import { ChatAvatar } from "../db";

export class ImgUtils {
    public static empty(name: string = "Anon"): ChatAvatar {
        return {
            avatarId: uuidv4(),
            name,
            imageBase64: "",
        };
    }

    public static resizeImage(
        file: File,
        maxWidth: number,
        maxHeight: number
    ): Promise<string> {
        // const file = fileInput.files[0];
        const reader = new FileReader();

        return new Promise((res, rej) => {
            reader.onload = function (event) {
                let img = new Image();
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Set the image smoothing quality
                    ctx.imageSmoothingQuality = "high";

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
                    let dataUrl = canvas.toDataURL(file.type);

                    // Call the callback with the result
                    res(dataUrl);
                };
                img.src = event.target.result as string;
            };
            reader.readAsDataURL(file);
        });
    }
}
