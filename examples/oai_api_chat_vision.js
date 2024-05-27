import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const img = fs.readFileSync("oai_api_chat_testimg.jpg").toString("base64");

const result = await fetch("http://localhost:5002/v1/chat/completions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "8a4267fb-c6e4-425b-9f52-ab28bd0e3342", // # ID of the chain to use
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "What's in this image?" },
                    {
                        type: "image_url",
                        image_url: {
                            url: "data:image/jpeg;base64," + img,
                        },
                    },
                ],
            },
        ],
        // ...any other OAI arguments are ignored
        //
        // Custom omnichain arguments...
        //
        // Clear the chat session after the request (default: true)
        // _ocClearSession: false, //
    }),
});

const data = await result.json();

console.log(JSON.stringify(data, null, 2));
