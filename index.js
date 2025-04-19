import { aiCall, extractJSON } from "./AiCall.js";
import runFlow from "./Execute.js";
import {
  getPlanConfirmation,
  getTaskInput,
  getJsonPromptFromPlan,
} from "./Questions.js";
import { setContext } from "./contextStore.js";
import { getStructure } from "./folderAwarence.js";

(async () => {
  const planPrompt = await getTaskInput();
  let aiGenPlan = await aiCall(planPrompt);

  if (!aiGenPlan || aiGenPlan.trim() === "") {
    console.error("❌ Error: No plan generated.");

    const retryCalling = setInterval(async () => {
      console.log(`Retrying in 10 seconds ...`);
      aiGenPlan = await aiCall(planPrompt);
      if (aiGenPlan) {
        clearInterval(retryCalling);
      }
    }, 10000);

    return;
  }

  console.log("📋 Plan:\n", aiGenPlan);

  const confirmation = await getPlanConfirmation();
  if (!confirmation) {
    console.log("❎ Plan execution cancelled by the user.");
    return;
  }

  const jsonPrompt = getJsonPromptFromPlan(aiGenPlan);
  let codesJsonRaw = await aiCall(jsonPrompt);
  if (!codesJsonRaw) {
    async () => {
      const retryJson = setInterval(async () => {
        console.error("❌ Error: No JSON response generated.");
        console.log(`Retrying...`);
        codesJsonRaw = await aiCall(jsonPrompt);
        if (retryJson) {
          clearInterval(retryJson);
        }
      }, 5000);
    };
  }
  try {
    const cleanJson = extractJSON(codesJsonRaw);

    console.log("🚀 Executing the plan...");
    console.log("📦 Tasks:", cleanJson?.tasks);

    const folderStructure = getStructure(process.cwd());
    setContext({ ...cleanJson?.context, folderStructure });
    await runFlow(cleanJson?.tasks);
  } catch (err) {
    console.error("❌ Failed to parse AI response as JSON:", err.message);
    console.log("Raw AI Response:\n", codesJsonRaw);
  }
})();
