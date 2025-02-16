export const loadQuotes = async (): Promise<Record<string, { quote: string; author: string }[]>> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["quotes"], async (result) => {
        if (result.quotes) {
          resolve(result.quotes);
          return;
        }
  
        // If no stored quotes, load from files
        const quotes: Record<string, { quote: string; author: string }[]> = {};
        const modules = import.meta.glob("../store/quotes/*.ts", { eager: true });
        console.log("modules", modules);
        for (const path in modules) {
          const module = modules[path] as { motivationalQuotes?: { about: string; list: { quote: string; author: string }[] } };
  
          if (module.motivationalQuotes?.list) {
            quotes[module.motivationalQuotes.about?.toLowerCase()] = module.motivationalQuotes.list;
          }
        }
  
        const quoteKeys = Object.keys(quotes);
  
        // Save to storage and resolve
        chrome.storage.local.set({ quotes, quoteKeys }, () => {
          console.log("Quotes saved to chrome.storage:", quotes);
          resolve(quotes);
        });
      });
    });
  };
  