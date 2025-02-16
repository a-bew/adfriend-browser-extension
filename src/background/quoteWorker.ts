self.onmessage = async (event) => {
    const { quoteKey } = event.data;

    try {
        const modules = import.meta.glob("../store/quotes/*.ts", { eager: false });

        if (modules[`../store/quotes/${quoteKey}.ts`]) {
            const moduleLoader = modules[`../store/quotes/${quoteKey}.ts`];
            const module = await moduleLoader() as { motivationalQuotes?: { about: string; list: { quote: string; author: string }[] } };

            if (module.motivationalQuotes?.list) {
                self.postMessage({ quoteKey, quotes: module.motivationalQuotes.list });
            }
        } else {
            self.postMessage({ error: "Quote category not found" });
        }
    } catch (error:any) {
        self.postMessage({ error: error.message });
    }
};
