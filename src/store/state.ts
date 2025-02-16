import { proxy } from "valtio";

export enum Actions {
  GET_STATE = "get-state",
  SET_STATE = "set-state",
  GET_MOTIVATIONAL_QUOTE = "get-motivational-quote",
  UPDATE_PREFERENCES = "enable-quotes",
}
export type Action = `${Actions}`;

export type QUOTETYPE = any;//Record<string, { quote: string; author: string; }[] | string>;

export const defaultPreferences = {
  enableQuotes: true,
  theme: "light",
  widgetType: "Personal Life",
  refreshInterval: 300,
};

export const state = proxy({
  quotes: {} as QUOTETYPE,
  saved: false,
  quoteKeys: [] as string[],
  preferences: { ...defaultPreferences }
});

export type ExtensionState = typeof state;

export const updateEnableQuotes = (payload: Partial<typeof state>) => {
  chrome.runtime.sendMessage({ type: Actions.UPDATE_PREFERENCES, payload });
};