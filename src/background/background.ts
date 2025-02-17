import { defaultPreferences, state } from "@/store/state";
import { loadQuotes } from "./utils";
import { preferenceFunction } from "./functions/preference";
import { EncryptedData, secureIndexedDBStorage } from "@/db/SecureIndexDb";


// Function to encrypt preferences before storage
export const encryptPreferences = async (preferences: any): Promise<EncryptedData> => {
  const dataString = JSON.stringify(preferences);
  const encrypted = await secureIndexedDBStorage.additionalEncryption(dataString);
  return {
    encrypted,
    iv: '', // Fill in if using AES or similar encryption
    authTag: '', // Fill in if using AES-GCM
    salt: '' // Fill in if using key derivation
  };
};


// Function to decrypt preferences after retrieval
export const decryptPreferences = (encryptedData: EncryptedData): any => {
  try {
    return secureIndexedDBStorage.decryptStoredData(encryptedData.encrypted, );
  } catch (error) {
    console.error('Failed to decrypt preferences:', error);
    return null;
  }
};

// Initialize state with database check
const initializeState = async () => {
  try {
    const encryptedPrefs = await secureIndexedDBStorage.retrieveData('preferences');
    const storedPrefs = JSON.parse(await decryptPreferences(encryptedPrefs));
    console.log("storedPrefs", Object.keys(storedPrefs),  Object.values(storedPrefs))
    if (storedPrefs) {
      Object.assign(state.preferences, storedPrefs);
    } else {
      // If no stored preferences, use defaults and store them
      const encryptedDefaultPrefs = encryptPreferences(defaultPreferences);
      await secureIndexedDBStorage.storeData('preferences', await encryptedDefaultPrefs);
    }
  } catch (error) {
    console.error('Failed to initialize state from DB:', error);
    // Use default preferences if retrieval fails
    Object.assign(state.preferences, defaultPreferences);
    const encryptedDefaultPrefs = await encryptPreferences(defaultPreferences);
    await secureIndexedDBStorage.storeData('preferences', encryptedDefaultPrefs);
  }
};
// Triggered when the extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  console.log("AdFriend installed!");
  await initializeState();


  try {
    const storedState = await new Promise<any>((resolve) => {
      chrome.storage.local.get("state", resolve);
    });

    const quotes = await loadQuotes(); // Ensure quotes are loaded properly

    if (quotes) {
      state.quotes = quotes;
      state.quoteKeys = Object.keys(quotes);

      const newState = { ...state, quotes, quoteKeys: state.quoteKeys };
      Object.assign(state, newState);

      chrome.storage.local.set({ state: newState }, () => {
        console.log("State saved to storage:", newState);
      });

    }

    if (storedState.state) {
      Object.assign(state, storedState.state);
    }

  } catch (error) {
    console.error("Error loading state or quotes:", error);
  }
  
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  switch (request.action) {
    case "GET_MOTIVATIONAL_QUOTES_KEYS":
    case "GET_MOTIVATIONAL_QUOTES":
    case "UPDATE_PREFERENCES":
    case "GET_PREFERENCES":
    case "SAVE_PREFERENCES":
    case "GET_SAVED":
      preferenceFunction(request, _, sendResponse);
      break;
  }
  return true; // Required for async response handling
});

// Listen for storage changes (keeps state updated)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.state?.newValue) {
    console.log("State updated in storage:", changes.state.newValue);
    Object.assign(state, changes.state.newValue);
  }
});

// Load quotes when the extension starts
chrome.runtime.onStartup.addListener(() => {
  loadQuotes()
    .then((quotes) => {
      if (quotes) {
        state.quotes = quotes;
        state.quoteKeys = Object.keys(quotes);
        chrome.storage.local.set({ state });
        console.log("Quotes refreshed on startup:", quotes);
      }
    })
    .catch((err) => console.error("Error loading quotes on startup:", err));
});
