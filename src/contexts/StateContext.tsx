// StateContext.tsx
import {state} from '@/store/state';
import React, { createContext, useContext, useEffect, useState } from 'react';
// import state from './state';

const StateContext = createContext<typeof state>(state);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState(state);

  useEffect(() => {
    const listener = () => setAppState({ ...state });
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return <StateContext.Provider value={appState}>{children}</StateContext.Provider>;
};

export const useAppState = () => useContext(StateContext);