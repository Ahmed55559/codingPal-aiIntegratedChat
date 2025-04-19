import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

console.log("Starting to read files...");
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const getStructure = (dirname) => {
  if (!fs.existsSync(dirname)) {
    return []; // Return an empty array if the directory does not exist
  }
  return fs
    .readdirSync(dirname, { withFileTypes: true })
    .map((entry) => {
      if (
        entry.name === "node_modules" ||
        entry.name.startsWith(".") ||
        entry.name === ".git"
      ) {
        return null; // Skip node_modules, .git, and hidden files/folders
      }
      const fullPath = path.join(dirname, entry.name);
      if (entry.isDirectory()) {
        return {
          [entry.name]: getStructure(fullPath),
        };
      } else {
        return fullPath; // Return the full path for files
      }
    })
    .filter(Boolean); // Remove null entries
};

async function readFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    return null;
  }
}
export { getStructure, readFileContent };
