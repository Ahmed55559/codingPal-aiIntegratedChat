import fs from "fs/promises";
import { exec } from "child_process";
import util from "util";
import path from "path";
import { getContext } from "./contextStore.js";
import { aiCall } from "./AiCall.js";
import ora from "ora";
import {
  getFixInput,
  getReTryConfirmation,
  getFixConfirmation,
} from "./Questions.js";
import { readFileContent } from "./folderAwarence.js";

const execPromise = util.promisify(exec);

let currentDir = process.cwd(); // Start with the root directory

async function executeTask(task) {
  switch (task.type) {
    case "cli": {
      if (task.command.startsWith("cd ")) {
        const target = task.command.slice(3).trim();
        const newDir = path.resolve(currentDir, target);
        currentDir = newDir;
        console.log(`📁 Changed directory to: ${currentDir}`);
        return;
      }

      if (task.command.startsWith("echo ")) {
        const filePath = task.command.split(">>")[1]?.trim();
        if (filePath) {
          const fullPath = path.resolve(currentDir, filePath);
          try {
            await fs.access(path.dirname(fullPath)); // Ensure the directory exists
          } catch {
            console.error(`❌ Directory does not exist for file: ${fullPath}`);
            break;
          }
        }
      }

      console.log(`🔧 Executing CLI: ${task.command}`);
      const { stdout, stderr } = await execPromise(task.command, {
        cwd: currentDir, // Use the updated currentDir
      });
      if (stdout) console.log(stdout.trim());
      if (stderr) console.error(stderr.trim());
      break;
    }

    case "writeFile": {
      const ctx = getContext();
      const fullPath = path.join(ctx.rootDir || currentDir, task.path);

      try {
        // Check if the file already exists
        await fs.access(fullPath);
        console.error(`❌ File already exists: ${fullPath}`);
        break;
      } catch {
        // File does not exist, proceed to write
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, task.content);
        console.log(`📝 File written: ${fullPath}`);
      }
      break;
    }

    case "appendFile": {
      const ctx = getContext();
      const fullPath = path.join(ctx.rootDir || ".", task.path);

      try {
        await fs.access(fullPath);
      } catch {
        // File does not exist, create the directory
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
      }

      let contentToWrite = task.content;
      if (typeof contentToWrite === "object") {
        contentToWrite = JSON.stringify(contentToWrite, null, 2);
      }

      await fs.appendFile(fullPath, contentToWrite);
      console.log(`📝 File appended: ${fullPath}`);
      break;
    }

    case "editFile": {
      const ctx = getContext();
      const fullPath = path.join(ctx.rootDir || currentDir, task.path);

      // Read the file content before editing
      const existingContent = await readFileContent(fullPath);
      if (existingContent === null) {
        console.error(`❌ Cannot edit non-existent file: ${fullPath}`);
        break;
      }

      let contentToWrite = task.content;
      if (typeof contentToWrite === "object") {
        contentToWrite = JSON.stringify(contentToWrite, null, 2);
      }

      await fs.writeFile(fullPath, existingContent + "\n" + contentToWrite);
      console.log(`📝 File edited: ${fullPath}`);
      break;
    }

    case "installPackages": {
      const ctx = getContext();
      const targetDir = ctx.rootDir || ".";
      console.log("📦 Installing packages...");
      await execPromise(`cd "${targetDir}" && npm install`);
      console.log("✅ Packages installed.");
      break;
    }

    case "generateLogic": {
      const logicCode = await aiCall(
        `Write full code in required languages - return valid code without any syntax error - for: ${task.description}`
      );
      const logicPath = path.join(currentDir, task.path || "generatedLogic.js");
      await fs.mkdir(path.dirname(logicPath), { recursive: true });
      await fs.writeFile(logicPath, logicCode);
      console.log(`🤖 Logic generated and saved to ${logicPath}`);
      break;
    }

    default:
      console.warn(`⚠️ Unknown Task Type: ${task.type}`, task);
      break;
  }
}

async function runFlow(tasks) {
  if (!Array.isArray(tasks)) {
    throw new Error("❌ Invalid tasks array provided.");
  }

  const completed = [];
  const failed = [];

  for (const task of tasks) {
    console.log(`📌 Current Directory: ${currentDir}`);
    console.log(`📌 Current Task:`, task);

    const spinner = ora("").start();
    try {
      await executeTask(task);
      completed.push(task.type);
      spinner.succeed(`Task completed: ${task.type}`);
    } catch (err) {
      spinner.fail(`Task failed: ${task.type}`);
      console.error("❌ Error during execution:", err.message);
      failed.push({ task, error: err.message });

      const reRun = await getReTryConfirmation();
      if (reRun) {
        try {
          console.log("🔄 Retrying task:", task.type);
          await executeTask(task);
          completed.push(task.type);
          spinner.succeed(`Task re-run successfully: ${task.type}`);
        } catch (error) {
          console.error("❌ Error during re-run:", error.message);
          failed.push({ task, error: error.message });
          break;
        }
      } else {
        break;
      }
    }
  }

  console.log("\n📊 Execution Summary:");
  console.log("✅ Completed:", completed.join(", ") || "None");
  if (failed.length > 0) {
    console.log("❌ Failed at:", failed[0].task.type);
    console.log("🪲 Error:", failed[0].error);
  } else {
    console.log("🎉 All tasks completed successfully!");
  }

  const doFix = await getFixConfirmation();
  if (doFix) {
    const fixPrompt = await getFixInput();
    const spinner = ora("🤖 Fixing...").start();
    try {
      const fixCode = await aiCall(fixPrompt);
      if (fixCode?.tasks) {
        await runFlow(fixCode.tasks);
        console.log("🤖 Fixing completed.");
      } else {
        spinner.fail("🤖 No tasks generated for fixing.");
      }
    } catch (error) {
      console.error("❌ Error during fix:", error.message);
      spinner.fail("🤖 Fixing failed.");
    }
  } else {
    console.log("❎ Fixing cancelled by the user.");
  }
}

export default runFlow;
