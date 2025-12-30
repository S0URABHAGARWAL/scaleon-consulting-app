/**
 * CENTRAL CONFIGURATION FOR SCALEON STRATEGIC DISCOVERY
 * All environment variables and constants in one place
 */

// API Keys
export const API_CONFIG = {
  gemini: import.meta.env.VITE_GEMINI_API_KEY || "",
  webScraping: import.meta.env.VITE_WEBSCRAPING_API_KEY || "",
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Application Settings
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || "ScaleOn Strategic Discovery",
  version: import.meta.env.VITE_APP_VERSION || "2.0.0",
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || "en",
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || "USD",
};

// Feature Flags
export const FEATURES = {
  deepResearch: import.meta.env.VITE_ENABLE_DEEP_RESEARCH === "true",
  imageGeneration: import.meta.env.VITE_ENABLE_IMAGE_GENERATION === "true",
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  export: import.meta.env.VITE_ENABLE_EXPORT === "true",
};

// API Endpoints
export const ENDPOINTS = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || "",
};

// Development Settings
export const DEV_CONFIG = {
  debugMode: import.meta.env.VITE_DEBUG_MODE === "true",
  logLevel: import.meta.env.VITE_LOG_LEVEL || "info",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validation
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!API_CONFIG.gemini) {
    errors.push("❌ VITE_GEMINI_API_KEY is required. Get it from https://aistudio.google.com/apikey");
  }

  if (!FIREBASE_CONFIG.apiKey) {
    errors.push("⚠️ Firebase is not configured. Some features may not work.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Log configuration status on import
if (DEV_CONFIG.isDevelopment) {
  const validation = validateConfig();
  if (!validation.valid) {
    console.warn("⚠️ Configuration Issues:");
    validation.errors.forEach(error => console.warn(error));
  } else {
    console.log("✅ Configuration validated successfully");
  }
}
