import { IncomingMessage, ServerResponse, createServer } from "http";
import { readFile, readdir, existsSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const saveHandler = (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on("end", () => {
        console.log(body);
        // TODO: read body as json
        // TODO: save chain data to disk
        res.writeHead(200);
        res.end();
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const readAllHandler = (req, res) => {
    const chainsDir = join(__dirname, "chains");

    const emptyRes = (status = 200) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end("{}");
    };

    if (!existsSync(chainsDir)) {
        emptyRes();
        return;
    }

    fs.readdir(chainsDir, (err, filenames) => {
        if (err) {
            emptyRes();
        }
        //
        else {
            const filesContent = {};
            filenames.forEach((filename) => {
                const content = fs.readFileSync(
                    path.join(chainsDir, filename),
                    "utf-8"
                );
                filesContent[filename] = content;
            });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(filesContent));
        }
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const staticServer = (req, res) => {
    const filePath = join(
        __dirname,
        "dist",
        !req.url.length || req.url === "/" ? "/index.html" : req.url
    );

    const ext = extname(filePath);

    let contentType = "text/html";

    switch (ext) {
        case ".js":
            contentType = "application/javascript";
            break;
        case ".css":
            contentType = "text/css";
            break;
        case ".svg":
            contentType = "image/svg+xml";
        default:
            break;
    }

    readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
};

const server = createServer((req, res) => {
    console.log(req.url);

    switch (req.url) {
        case "/api/read/all":
            readAllHandler(req, res);
            break;
        case "/api/save":
            saveHandler(req, res);
            break;
        default:
            staticServer(req, res);
            break;
    }
});

server.listen(8080, () => {
    console.log("Server listening on http://localhost:8080");
});
