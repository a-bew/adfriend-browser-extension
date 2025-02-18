import { secureIndexedDBStorage } from "@/db/SecureIndexDb";
import { state } from "@/store/state";
import { sendRequest } from "@/utils";
import { decryptPreferences, encryptPreferences } from "../background";

export const preferenceFunction = async (request: any, _: any, sendResponse: any) => {
    try {
        switch (request.action) {
            case "GET_MOTIVATIONAL_QUOTES_KEYS":
                if (state.quoteKeys.length > 0) {
                    sendResponse({ quoteKeys: state.quoteKeys, widgetType: state.preferences.widgetType });
                } else {
                    sendResponse({ quoteKeys: ["success"] }); // Default category
                }
                break;
            
            case "GET_RANDOM_REMINDER":
                const randomReminder = state.preferences.reminders[Math.floor(Math.random() * state.preferences.reminders.length)];
                console.log("Sending random reminder:", randomReminder);
                sendResponse({ reminder: randomReminder?.text || "No reminders set." });
                break;

            case "GET_MOTIVATIONAL_QUOTES":
                console.log("Fetching motivational quote for key:", request.quoteKey);
                
                chrome.storage.local.get(["quotes"], (result) => {

                    if (result.quotes && request.quoteKey?.toLowerCase() in result.quotes) {
                        const quotesList = result.quotes[request.quoteKey?.toLowerCase()];

                        if (quotesList?.length > 0) {
                            const randomQuote = quotesList[Math.floor(Math.random() * quotesList?.length)];
                            sendResponse({ quote: `${randomQuote.quote} - ${randomQuote.author}`, quoteKey: request.quoteKey });
                        } else {
                            sendResponse({ quote: "No quotes available for this category." });
                        }

                    } else {

                        console.warn("No stored motivational quotes found. Using default quotes.");

                        const defaultQuotes = [
                            "Believe you can and you're halfway there. - Theodore Roosevelt",
                            "You are capable of amazing things!",
                        ];
                        
                        sendResponse({ quote: defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)] });
                        
                    }
                });

                return true; // Needed for async response

                case "UPDATE_PREFERENCES":
                    try {
                        const encryptedData = await encryptPreferences({
                            ...state.preferences,
                            enableQuotes: request.enableQuotes,
                            theme: request.theme,
                            widgetType: request.widgetType,
                            refreshInterval: request.refreshInterval,
                            reminders: request.reminders
                        }); // Use a secure method for password in production
                        
                        await secureIndexedDBStorage.storeData('preferences', encryptedData);
                        
                        // Update state in memory
                        state.saved = !!request.saved;
                        state.preferences = {
                            ...state.preferences,
                            enableQuotes: request.enableQuotes,
                            theme: request.theme,
                            widgetType: request.widgetType,
                            refreshInterval: request.refreshInterval,
                            reminders: request.reminders
                        };
                
                        // Update chrome.storage.local for immediate access by other parts of the extension
                        chrome.storage.local.set({ preferences: state.preferences }, () => {
                            
                            // Notify content script if widget type changed
                            sendRequest("GET_MOTIVATIONAL_QUOTES", { quoteKey: request.widgetType });
                            
                            setTimeout(() => {

                                // Notify content script if widget type or extension enabled/disabled changed
                                if (request.widgetType !== state.preferences.widgetType || request.enableQuotes !== state.preferences.enableQuotes) {
                                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                                        chrome.tabs.sendMessage(tabs[0].id!, { 
                                            action: "WIDGET_TYPE_CHANGE", 
                                            widgetType: request.widgetType,  
                                        });
                                    });
                                }

                            }, 100);
                
                            // Send a success response back
                            sendResponse({ success: true });
                        });
                
                    } catch (error) {
                        console.error("Failed to update preferences:", error);
                        sendResponse({ success: false, error: "Failed to update preferences" });
                    }
                    return true;

            case "SAVE_PREFERENCES":
                chrome.storage.sync.set({ saved: request.saved }, () => {
                    state.saved = request.saved;
                });
                break;

            case "GET_SAVED":
                sendResponse({ saved: state.saved });
                break;

            case "GET_PREFERENCES":
                try {
                    const encryptedPrefs = await secureIndexedDBStorage.retrieveData('preferences');
                    const preferences = await decryptPreferences(encryptedPrefs); // Secure password management needed
                    console.log("preferences db", preferences);

                chrome.storage.local.get(["quoteKeys", "preferences"], (result) => {

                    sendResponse({
                        preferences: preferences || state.preferences,
                        quoteKeys: result.quoteKeys || [],
                    });
                });
            } catch (error) {
                console.error("Failed to get preferences:", error);
                // Fallback to in-memory state if secure storage fails
                chrome.storage.local.get(["quoteKeys"], (result) => {
                    sendResponse({
                        preferences: state.preferences,
                        quoteKeys: result.quoteKeys || state.quoteKeys || [],
                    });
                });
            }
                return true; // Needed for async response

            default:
                console.warn(`Unknown action received: ${request.action}`);
                break;
        }
    } catch (error) {
        console.error("Error in motivationFunction:", error);
    }
};
