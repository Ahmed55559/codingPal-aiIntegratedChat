import dotenv from "dotenv";
import fetch from "node-fetch";
import ora from "ora";
dotenv.config();

const apiKey = process.env.apiKey;
const aiCall = async (prompt) => {
  const spinner = ora("🤖 Thinking...").start();
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "", // Optional. Site URL for rankings on openrouter.ai.
          "X-Title": "", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "open-r1/olympiccoder-7b:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API call failed");
    }
    spinner.succeed("loading finished");
    // console.log(data);
    return data.choices[0]?.message.content || data.choices[0]?.message?.text;
  } catch (error) {
    spinner.fail("loading finished");

    console.error("❌ Error:", error.message);
  }
};
function extractJSON(text) {
  try {
    // Find all possible JSON substrings using regex
    const matches = text.match(/{[\s\S]*}/g);
    if (!matches) throw new Error("No JSON object found.");

    for (const match of matches) {
      try {
        const json = JSON.parse(match);
        return json; // Return the first valid JSON found
      } catch (e) {
        // Not a valid JSON, continue to next match
        continue;
      }
    }
    throw new Error("No valid JSON found.");
  } catch (err) {
    console.error("Failed to extract JSON:", err.message);
    return null;
  }
}

export { aiCall, extractJSON };
