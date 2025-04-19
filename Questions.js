import inquirer from "inquirer";
import os from "os";
const platform = os.platform();
async function getTaskInput() {
  const { userTask } = await inquirer.prompt([
    {
      type: "input",
      name: "userTask",
      message: "How can I help you today?",
    },
  ]);

  const planPrompt = `
You're an expert developer assistant. Given the following task description, analyze it carefully and return a clear, human-readable plan (will be taken by you so make a plan that ai can do) of action.

---
🧾 User Task:
${userTask}
---

✅ Format your response as:
- A clean, numbered list of actionable steps
- Each step must be short, clear, and in logical order
- Mention any file names or languages used if needed
- Include actual shell commands where applicable
- DO NOT include code content or implementation details
- DO NOT use markdown or unnecessary formatting
- Keep the tone concise and professional
-when generating command lines use commands that work on this platform : ${platform}

🎯 Goal: The user will review this plan in a terminal before execution.
  `.trim();

  return planPrompt;
}

async function getPlanConfirmation() {
  const { confirmation } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmation",
      message: "Are you sure you want to execute these tasks?",
      default: false,
    },
  ]);
  return confirmation;
}

function getJsonPromptFromPlan(plan) {
  return `
  Analyze the following plan and return a response in valid complete JSON format only.
  
  ⚠️ Rules:
  - Return ONLY raw JSON. No markdown, no explanations, no extra text.
    - Return exact json formate without any text outside
  - The output JSON must include:
    - "context": useful metadata (e.g. rootDir, framework, packageManager, etc.)
    - "tasks": array of steps with:
      - type: "cli", "writeFile (for simple logic and text files)", "editFile", "installPackages", or "generateLogic (for more complex logic and code files)"
      - required fields based on type
      - when generating a code use "generateLogic" type
      - dont put two commands in one task, each task should be a single command 
  📦 Example output: (please insure this formate)
  {
    "context": {
      "rootDir": "./myProject", // current directory with vaild path use the platform safe commands to get it
      "framework": "Node.js" , //dont include if not specified
      "language": "JavaScript", //dont include if not specified
    },
    "tasks": [
      {
        "type": "cli",
        "command": "mkdir myProject"
      },
      {
        "type": "writeFile",
        "path": "index.js",
        "content": "console.log('Hello, world!');"
      },
      {
        "type": "installPackages",
        "command": "npm install express"
      },
      {
        "type": "generateLogic",
        "path": "utils/findSecondLargest.js",
        "description": "JavaScript function to find the second largest number in an array"
      }
    ]
  }
  
  🧠 Logic Rules:
  - Default to JavaScript if no language is specified
  - Default to Node.js if no framework is mentioned
  - Default to npm if no package manager is mentioned
  - Default to current directory if no folder is mentioned
  - If a folder is mentioned and doesn’t exist → create it
  - If a file is mentioned and doesn’t exist → create it
  - Do not include incomplete commands like: "code index.js" unless the content has already been written
  - Only install packages if they’re not already installed
  - Use the specified platform-safe CLI commands: \`${platform}\`
  - Ensure all tasks are in flat JSON format (no nested data objects or descriptions)
  
  🆕 "generateLogic" tasks must:
  - Include a "description" that clearly defines the required logic
  - Include a "path" to where the logic should be written
  - include a "code" field with the generated code
  - Generate full, working, logically correct code using functions, conditionals, and loops if needed
  - Avoid placeholders or vague instructions
  
  Plan:
  ${plan}
  `.trim();
}

async function getReTryConfirmation() {
  const { confirmation } = await inquirer.prompt([
    {
      type: "confirmReTry",
      name: "confirmation",
      message: "Do you want to ReTry this task?",
      default: false,
    },
  ]);
  return confirmation;
}
async function getFixConfirmation() {
  const { confirmation } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmationFix",
      message: "Do you want to fix something?",
    },
  ]);
  return confirmation;
}
async function getFixInput() {
  const { userFix } = await inquirer.prompt([
    {
      type: "input",
      name: "userFix",
      message: "What things do you want to fix?",
    },
  ]);

  const fixPrompt = `
  Analyze the following fix task and return a response in valid complete JSON format only.
  
  ⚠️ Rules:
  - Return ONLY raw JSON. No markdown, no explanations, no extra text.
  - Return exact json formate without any text outside
  - The output JSON must include:
    - "context": useful metadata (e.g. rootDir, framework, packageManager, etc.)
    - "tasks": array of steps with:
      - type: "cli", "writeFile (for simple logic and text files)", "editFile", "installPackages", or "generateLogic (for more complex logic and code files)"
      - required fields based on type
      - when generating a code use "generateLogic" type
  
  📦 Example output: 
  {
    "context": {
      "rootDir": "./myProject", // current directory with vaild path use the platform safe commands to get it
      "framework": "Node.js" , //dont include if not specified
      "language": "JavaScript", //dont include if not specified
    },
    "tasks": [
      {
        "type": "cli",
        "command": "mkdir myProject"
      },
      {
        "type": "writeFile",
        "path": "index.js",
        "content": "console.log('Hello, world!');"
      },
      {
        "type": "installPackages",
        "command": "npm install express"
      },
      {
        "type": "generateLogic",
        "path": "utils/findSecondLargest.js",
        "description": "JavaScript function to find the second largest number in an array"
      },
      {
      "type": "appendFile", // to edit files and add codes
      "path": "hello.js",
      "content": "new code to append"
      }
    ]
  }
  
  🧠 Logic Rules:
  - Default to JavaScript if no language is specified
  - Default to Node.js if no framework is mentioned
  - Default to npm if no package manager is mentioned
  - Default to current directory if no folder is mentioned
  - If a folder is mentioned and doesn’t exist → create it
  - If a file is mentioned and doesn’t exist → create it
  - Do not include incomplete commands like: "code index.js" unless the content has already been written
  - Only install packages if they’re not already installed
  - Use the specified platform-safe CLI commands: \`${platform}\`
  - Ensure all tasks are in flat JSON format (no nested data objects or descriptions)
  
  🆕 "generateLogic" tasks must:
  - Include a "description" that clearly defines the required logic
  - Include a "path" to where the logic should be written
  - include a "code" field with the generated code
  - Generate full, working, logically correct code using functions, conditionals, and loops if needed
  - Avoid placeholders or vague instructions
  
  fix task:
  ${userFix}
  `.trim();

  return fixPrompt;
}

export {
  getTaskInput,
  getPlanConfirmation,
  getJsonPromptFromPlan,
  getReTryConfirmation,
  getFixInput,
  getFixConfirmation,
};
