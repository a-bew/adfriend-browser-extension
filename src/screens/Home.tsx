import  { useState, useEffect  } from "react";
import styles from "./Home.module.scss";
import { sendRequest } from "@/utils";

const Home = () => {
  const [widgetType, setWidgetType] = useState<string>("Personal Life");
  const [refreshInterval, setRefreshInterval] = useState<number>(300);
  const [theme, setTheme] = useState<string>("light");
  // const [stats, setStats] = useState<{ replacedAds: number } | null>(null);
  const [saved, setSaved] = useState<boolean>(false);
  const [enableQuotes, setEnableQuotes] = useState(true);
  const [motivationQuoteTypes, setMotivationQuoteTypes] = useState<string[]>(["success"]);
  // const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleSavePreference = () => {
    chrome.runtime.sendMessage(
      {
        action: "UPDATE_PREFERENCES",
        enableQuotes,
        theme,
        widgetType,
        refreshInterval,
      },
      (response) => {
        if (response && response.success) {
            sendRequest("SAVE_PREFERENCES", { saved: true });
            setSaved(true);
            // showSaveConfirmation();

            // Close the window after a short delay
            setTimeout(() => {
                sendRequest("SAVE_PREFERENCES", { saved: false });
                setSaved(false);
                window.close(); // Close the popup after saving preferences
            }, 2000);

        }
    }
   
    );
  };

  // UI feedback
  // const showSaveConfirmation = () => {
  //   if (saveButtonRef.current) {
  //     saveButtonRef.current.textContent = 'Saved!';
  //     saveButtonRef.current.classList.add('success');

  //     setTimeout(() => {
  //       if (saveButtonRef.current) {
  //         saveButtonRef.current.textContent = 'Save Settings';
  //         saveButtonRef.current.classList.remove('success');
  //       }
  //     }, 2000);
  //   }
  // };

  // Load preferences from storage
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_PREFERENCES" }, (response) => {
      if (response?.preferences) {
        setEnableQuotes(response.preferences.enableQuotes);
        setTheme(response.preferences.theme);
        setWidgetType(response?.preferences?.widgetType);
        setRefreshInterval(response.preferences.refreshInterval || 300);
      }
      if (response?.quoteKeys) {
        setMotivationQuoteTypes(response.quoteKeys);
      }
    });

    // Get saved state
    chrome.runtime.sendMessage({ type: "GET_SAVED" }, (response) => {
      setSaved(response?.saved || false);
    });
  }, []);

  // Apply theme dynamically
  useEffect(() => {
    if (theme === "auto") {
      document.body.classList.toggle(
        styles.dark,
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } else {
      document.body.classList.toggle(styles.dark, theme === "dark");
    }
  }, [theme]);

  return (
    <div className={styles.container}>
      <h1>AdFriend Settings</h1>

      {/* Widget Selection */}
      <div className={styles.section}>
        <h2>Choose Widget:</h2>
        {motivationQuoteTypes.length > 0 ? (
          motivationQuoteTypes.map((type) => (
            <label key={type} className={styles.radioLabel}>
              <input
                type="radio"
                name="widgetType"
                value={type}
                checked={widgetType?.toLocaleLowerCase() === type?.toLocaleLowerCase()}
                onChange={(e) => setWidgetType(e.target.value)}
              />
              {type.replace(/^\w/, (c) => c.toUpperCase())} {/* Capitalize */}
            </label>
          ))
        ) : (
          <p>No quotes available.</p>
        )}
      </div>

      {/* Refresh Interval */}
      <div className={styles.section}>
        <h2>Refresh Interval</h2>
        <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={900}>15 minutes</option>
          <option value={3600}>1 hour</option>
        </select>
      </div>

      {/* Theme Selection */}
      <div className={styles.section}>
        <h2>Theme</h2>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      {/* Show Quotes */}
      <label>
        <input
          type="checkbox"
          checked={enableQuotes}
          onChange={(e) => setEnableQuotes(e.target.checked)}
        />
        {enableQuotes ? `Disable AdFriend Extension`:`Enable AdFriend Extension`}
      </label>

      {/* Save Button */}
      <button
        // ref={saveButtonRef}
        className={styles.saveButton}
        onClick={handleSavePreference}
      >
        {saved ? "Saved!" : "Save"}
      </button>

    </div>
  );
};

export default Home;
