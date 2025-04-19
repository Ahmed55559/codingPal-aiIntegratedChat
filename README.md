
# Coding Pal Project

## 🧠 My Journey with Coding Pal

When I started working on **Coding Pal**, I was mainly a front-end developer. I had experience with HTML, CSS, and JavaScript, but backend development was unfamiliar territory.

This project became my gateway into full-stack development, and I’m proud of the growth it represents.

### 🚧 The Early Stages

The initial version was rough — a single file, messy structure, and the AI simply returned a "Hello World". There was no modularity or clear execution flow.

### 📈 Evolution Over Time

- Separated the codebase into clear, well-defined modules:
  - `AiCall.js`, `Questions.js`, `Execute.js`, `folderAwarence.js`, etc.
- Implemented robust AI response handling using OpenRouter.
- Evolved from simple console logs to generating full **React + Vite** project setups dynamically through AI planning.
- Enhanced console experience with:
  - Animated loading spinners via `ora`
  - Emojis for clearer, friendlier user feedback
  - Much better error detection and recovery

### 🧰 What I Learned

- Backend development with **Node.js**
- File system operations and CLI automation
- How to structure code for **scalability and maintainability**
- Real-time feedback loops with AI and handling edge cases
- The importance of **developer UX** in CLI tools

> *From chaos to clarity — Coding Pal has been my most valuable learning experience so far.*

This project is a developer assistant tool that helps users generate, plan, and execute tasks using AI. It leverages Node.js, Inquirer.js, and OpenRouter AI to provide an interactive and automated workflow.

## Features

- **Interactive Task Input**: Users can input tasks interactively via the terminal.
- **AI-Powered Planning**: Generates actionable plans for tasks using AI.
- **Task Execution**: Executes tasks such as CLI commands, file operations, and package installations.
- **Error Handling and Fixing**: Handles errors during task execution and provides options to retry or fix issues.
- **Folder Awareness**: Dynamically reads and processes the folder structure of the project.

## Project Structure
```

.env
.gitignore
AiCall.js
contextStore.js
Execute.js
folderAwarence.js
index.js
package.json
Questions.js

````

### Key Files

- **[index.js](index.js)**: Entry point of the application. Handles the main workflow.
- **[AiCall.js](AiCall.js)**: Handles AI API calls and JSON extraction.
- **[Questions.js](Questions.js)**: Contains interactive prompts for user input.
- **[Execute.js](Execute.js)**: Executes tasks based on the generated plan.
- **[folderAwarence.js](folderAwarence.js)**: Reads and processes the folder structure.
- **[contextStore.js](contextStore.js)**: Stores and retrieves context data.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add your OpenRouter API key:
   ```
   apiKey=your-api-key
   ```

## Usage

1. Start the application:

   ```bash
   npm start
   ```

2. Follow the prompts to input your task.

3. Review the AI-generated plan and confirm execution.

4. Monitor the execution process and handle any errors interactively.

## Dependencies

- [dotenv](https://www.npmjs.com/package/dotenv)
- [inquirer](https://www.npmjs.com/package/inquirer)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [ora](https://www.npmjs.com/package/ora)

## Development

To run the project in development mode with live reloading:

```bash
npx nodemon index.js
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the ISC License.

## Author

Ahmed55559

