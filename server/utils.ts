import fs from "fs";

export const readJsonFile = (path: string) =>
    JSON.parse(fs.readFileSync(path, "utf-8")) as Record<string, any>;

export const ensureDirExists = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
};
