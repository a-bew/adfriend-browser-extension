
export const preferenceFunction = (request: any, _: any, _sendResponse: any) => {
    try {

    switch (request.action) {
        // case 'GET_PREFERENCES':
        //     chrome.storage.sync.get('preferences', (result) => {
        //         sendResponse(result.preferences);
        //     });
        //     return true; // Keep message channel open for async response

        // case 'UPDATE_PREFERENCES':
        //     chrome.storage.sync.set({ preferences: message.preferences }, () => {
        //         // Notify all tabs to update their widgets
        //         chrome.tabs.query({}, (tabs) => {
        //             tabs.forEach(tab => {
        //                 // Create the appropriate widget based on user preferences
        //                 let widget;
        //                 switch (message.preferences.enabledWidgetTypes[0]) {
        //                     case 'gratitude':
        //                         widget = new GratitudeWidget();
        //                         break;
        //                     case 'quote':
        //                         widget = new QuoteWidget();
        //                         break;
        //                     case 'funfact':
        //                         widget = new FunFactWidget();
        //                         break;
        //                     case 'breathing':
        //                         widget = new BreathingWidget();
        //                         break;
        //                 }
        //                 // Send the widget data to the content script
        //                 chrome.tabs.sendMessage(tab.id, { type: 'REFRESH_WIDGETS', widget });
        //             });
        //         });
        //         sendResponse({ success: true });
        //     });
        //     return true;

        // case 'GET_ACTIVE_TAB_STATS':
        //     // Get statistics for the current tab (e.g., number of ads replaced)
        //     if (sender.tab) {
        //         chrome.storage.local.get(`stats_${sender.tab.id}`, (result) => {
        //             sendResponse(result[`stats_${sender.tab.id}`] || { replacedAds: 0 });
        //         });
        //     }
        //     return true;

        default:
            break;

    }

    } catch (error) {
        console.error(error);
    }

}