import { IncomingMessage, ServerResponse, createServer } from "http";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HEADER_JSON = { "Content-Type": "application/json" };

const PATH_DIR_CHAINS = join(__dirname, "chains");
const PATH_FILE_SETTINGS = join(__dirname, "data", "settings.json");

/**
 * @param {IncomingMessage} req
 * @returns {Promise<Record<string, any>>}
 */
const readRequestJson = (req) => {
    return new Promise((res, rej) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on("end", () => {
            if (!body.length) {
                rej("Empty data!");
            } else {
                try {
                    const data = JSON.parse(body);
                    res(data);
                } catch (error) {
                    rej(error);
                }
            }
        });
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const saveSettingsHandler = async (req, res) => {
    const data = await readRequestJson(req);
    writeFileSync(PATH_FILE_SETTINGS, JSON.stringify(data));
    res.writeHead(200);
    res.end();
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const readSettingsHandler = (req, res) => {
    if (!existsSync(PATH_FILE_SETTINGS)) {
        res.writeHead(200, HEADER_JSON);
        res.end("{}");
        return;
    }
    const content = readFileSync(join(chainsDir, PATH_FILE_SETTINGS));
    res.writeHead(200, HEADER_JSON);
    res.end(JSON.stringify(content));
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const saveGraphHandler = async (req, res) => {
    const data = await readRequestJson(req);
    if (data.graphId) {
        writeFileSync(
            join(PATH_DIR_CHAINS, `${data.graphId}.json`),
            JSON.stringify(data)
        );
    } else {
        throw new Error("Corrupted data");
    }
    res.writeHead(200);
    res.end();
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const readAllGraphsHandler = (req, res) => {
    if (!existsSync(PATH_DIR_CHAINS)) {
        res.writeHead(200, HEADER_JSON);
        res.end("{}");
        return;
    }

    const files = readdirSync(PATH_DIR_CHAINS);

    const content = {};
    for (const file of files) {
        const parsed = JSON.parse(readFileSync(join(PATH_DIR_CHAINS, file)));
        content[parsed.graphId] = parsed;
    }

    res.writeHead(200, HEADER_JSON);
    res.end(JSON.stringify(content));
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

    let contentType = "text/plain";

    switch (ext) {
        case ".html":
            contentType = "text/html";
            break;
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

    if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
    }

    const data = readFileSync(filePath);

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
};

const server = createServer((req, res) => {
    console.log(req.url);

    try {
        switch (req.url) {
            case "/api/graphs/read/all":
                readAllGraphsHandler(req, res);
                break;
            case "/api/graphs/save":
                saveGraphHandler(req, res);
                break;
            case "/api/settings/read":
                readSettingsHandler(req, res);
                break;
            case "/api/settings/save":
                saveSettingsHandler(req, res);
                break;
            default:
                staticServer(req, res);
                break;
        }
    } catch (error) {
        res.writeHead(500, HEADER_JSON);
        res.end(JSON.stringify(error));
    }
});

server.listen(8080, () => {
    console.log("Server listening on http://localhost:8080");
});
