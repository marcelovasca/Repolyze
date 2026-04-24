import { createOpenAI } from "@ai-sdk/openai";
import { EnvConfig } from "./types";

// Using Llama 3.3 70B on DeepInfra as default, but allowing override via ENV
export const MODEL_ID = process.env.DEEPINFRA_MODEL_ID || "meta-llama/Llama-3.3-70B-Instruct";

export const AI_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 4000,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 10, 
} as const;

function validateEnvVariables(): EnvConfig {
  const deepinfraApiKey = process.env.DEEPINFRA_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  const errors: string[] = [];

  if (!deepinfraApiKey) {
    errors.push("DEEPINFRA_API_KEY is required but not configured");
  } else if (deepinfraApiKey.length < 20) {
    errors.push("DEEPINFRA_API_KEY appears to be invalid (too short)");
  }

  if (!githubToken) {
    console.warn(
      "⚠️  GITHUB_TOKEN is not configured. API rate limits will be restricted."
    );
  }

  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors
      .map((e) => `  - ${e}`)
      .join("\n")}`;
    console.error(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  console.log("✅ Environment variables validated successfully");

  return {
    DEEPINFRA_API_KEY: deepinfraApiKey!,
    GITHUB_TOKEN: githubToken,
  };
}

let envConfig: EnvConfig;

try {
  envConfig = validateEnvVariables();
} catch (error) {
  if (process.env.NODE_ENV === "production") {
    throw error;
  }
  console.error("Environment validation failed:", error);
  envConfig = {
    DEEPINFRA_API_KEY: "",
    GITHUB_TOKEN: undefined,
  };
}

export { envConfig };

export function getDeepInfraClient() {
  if (!envConfig.DEEPINFRA_API_KEY) {
    throw new Error(
      "DEEPINFRA_API_KEY environment variable is not configured"
    );
  }

  return createOpenAI({
    apiKey: envConfig.DEEPINFRA_API_KEY,
    baseURL: "https://api.deepinfra.com/v1/openai",
  });
}

export function isConfigured(): boolean {
  return !!envConfig.DEEPINFRA_API_KEY;
}

export function hasGitHubToken(): boolean {
  return !!envConfig.GITHUB_TOKEN;
}
