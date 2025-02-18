import { useState, useEffect } from "react";
import styles from "./Home.module.scss";
import { sendRequest } from "@/utils";
import ReminderManager, { Reminder } from "@/components/Home/ReminderForm/ReminderManager";

const Home = () => {
  const [widgetType, setWidgetType] = useState<string>("Personal Life");
  const [refreshInterval, setRefreshInterval] = useState<number>(300);
  const [theme, setTheme] = useState<string>("light");
  const [saved, setSaved] = useState<boolean>(false);
  const [enableQuotes, setEnableQuotes] = useState(true);
  const [widgetTypes, setWidgetTypeTypes] = useState<string[]>(["success"]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const handleSavePreference = () => {
    chrome.runtime.sendMessage(
      {
        action: "UPDATE_PREFERENCES",
        enableQuotes,
        theme,
        widgetType,
        refreshInterval,
        reminders, // Save all reminders
      },
      (response) => {
        if (response && response.success) {
          sendRequest("SAVE_PREFERENCES", { saved: true });
          setSaved(true);

          setTimeout(() => {
            sendRequest("SAVE_PREFERENCES", { saved: false });
            setSaved(false);
            window.close();
          }, 2000);
        }
      }
    );
  };

  const handleSave = ()=>{
    
  }

  const handleAddReminder = (_newReminder: Reminder) => {
    const updatedReminders = reminders.length > 0 ? [...reminders, _newReminder] : [_newReminder];
    // Optionally auto-save when a reminder is added
    // handleSave();

    chrome.runtime.sendMessage(
      {
        action: "UPDATE_PREFERENCES",
        enableQuotes,
        theme,
        widgetType,
        refreshInterval,
        reminders: updatedReminders, // Save all reminders
      },
      (response) => {
        if (response && response.success) {
          setReminders(updatedReminders);
        }
      })
  };

  const handleDeleteReminder = (reminderId: number) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
    setReminders(updatedReminders);
    // Optionally auto-save when a reminder is deleted
    setTimeout(() => {
      handleSave();

    }, 1000);
  };

  // Load preferences from storage
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_PREFERENCES" }, (response) => {
      if (response?.preferences) {
        setEnableQuotes(response.preferences.enableQuotes);
        setTheme(response.preferences.theme);
        setWidgetType(response?.preferences?.widgetType);
        setRefreshInterval(response.preferences.refreshInterval || 300);
        setReminders(response.preferences.reminders || []);
      }
      if (response?.quoteKeys) {
        const hasReminder = response.quoteKeys.includes("reminder");
        setWidgetTypeTypes(hasReminder?[...response.quoteKeys]:[...response.quoteKeys, "reminder"]);
      }
    });

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
        <div className={styles.widgetTypesContainer}>
        {widgetTypes.length > 0 ? (
          widgetTypes.map((type) => (
            <label key={type} className={styles.radioLabel}>
              <input
                type="radio"
                name="widgetType"
                value={type}
                checked={widgetType?.toLocaleLowerCase() === type?.toLocaleLowerCase()}
                onChange={(e) => setWidgetType(e.target.value)}
              />
              {type.replace(/^\w/, (c) => c.toUpperCase())}
            </label>
          ))
        ) : (
          <p>No quotes available.</p>
        )}

        </div>
      </div>

      {/* Show Reminder Manager when reminder type is selected */}
      {widgetType?.toLowerCase() === 'reminder' && (
        <ReminderManager
          reminders={reminders}
          onAddReminder={handleAddReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      )}

      

      {/* Rest of your component remains the same */}
      <div className={styles.section}>
        <h2>Refresh Interval</h2>
        <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
          <option value={900}>15 minutes</option>
          <option value={3600}>1 hour</option>
        </select>
      </div>

      <div className={styles.section}>
        <h2>Theme</h2>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      {/* <label>
        <input
          type="checkbox"
          checked={enableQuotes}
          onChange={(e) => setEnableQuotes(e.target.checked)}
        />
        {`Enable AdFriend Extension`}
      </label> */}

      <button
        className={styles.saveButton}
        onClick={handleSavePreference}
      >
        {saved ? "Saved!" : "Save"}
      </button>
    </div>
  );
};

export default Home;