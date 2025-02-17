import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./content.module.css";
import { state } from "./store/state";
import { capitalizeFirstLetters, isElementInViewport, isElementNearViewport } from "./utils";
import { 
  FaHeart, 
  FaStar, 
  FaTrophy, 
  FaExclamationCircle, 
  FaSync 
} from 'react-icons/fa';

// import styles from './AdWidget.module.css';
// import { Quote, QuoteType } from './types';


// Ad-related CSS selectors
const AD_SELECTORS = [
  '[class*="ad-"]',
  '[class*="ads-"]',
  '[id*="google_ads"]',
  '[id*="banner"]',
  "ins.adsbygoogle",
  "[data-ad]",
  '[id*="ad-"]',
  '[class*="sponsored"]',
  '[class*="promoted"]',
  '[id*="adbox"]',
  '[class*="adunit"]',
  '[id*="ad-container"]',
];

let observer: MutationObserver;
const nodesBeingProcessed = new Set<HTMLElement>();

const pauseObserver = () => {
  if (observer) {
    observer.disconnect();
  }
};

const resumeObserver = () => {
  if (observer) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
};

const isAdElement = (element: HTMLElement): boolean => {
  return AD_SELECTORS.some((selector) => element.matches(selector));
};

const replaceAdWithWidget = (ad: HTMLElement) => {
  if (nodesBeingProcessed.has(ad)) return; // Avoid re-processing

  nodesBeingProcessed.add(ad);

  requestIdleCallback(() => {
    new Promise<void>((resolve) => {
      // Create the widget
      const widget = document.createElement("div");
      
      // Replace the ad with the widget
      ad.replaceWith(widget);

      // Simulate some async work or loading of data
      const root = createRoot(widget);
      root.render(<App />);
      resolve(); // Resolve the promise once everything is set up
    })
    .then(() => {
      nodesBeingProcessed.delete(ad); // Remove from set once processed
    })
    .catch((error) => {
      nodesBeingProcessed.delete(ad); // Also remove if there was an error
      console.error("Failed to replace ad with widget:", error);
    });
  });
};

const observeAds = () => {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        if (isAdElement(node)) {
          if (isElementInViewport(node) || isElementNearViewport(node)) {
            // If the element is in or near the viewport, replace it immediately
            replaceAdWithWidget(node);
          } else {
            // For elements not in view, set up an IntersectionObserver
            const intersectionObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  replaceAdWithWidget(entry.target as HTMLElement);
                  intersectionObserver.unobserve(entry.target); // Stop observing once it's visible
                }
              });
            }, {
              rootMargin: '200px' // Load elements 200px before they become visible
            });
            
            intersectionObserver.observe(node);
          }
        }
      });
    });
  });

  // Initially, start observing when the script loads
  resumeObserver();
};

export const App = React.memo(() => {
  const [quote, setQuote] = useState("Loading...");
  const [quoteKey, setQuoteKey] = useState<string>(state.preferences.widgetType || "Personal Life");
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "GET_PREFERENCES" }, (response) => {
      if (response?.preferences?.widgetType) {
        setQuoteKey(response.preferences.widgetType);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (!quoteKey) return;
  //   chrome.runtime.sendMessage({ action: "GET_MOTIVATIONAL_QUOTES", quoteKey }, (response) => {
  //     if (response?.quote) {
  //       setQuote(response.quote);
  //       // setQuoteKey(respose.)
  //     } else {
  //       console.error(response?.error || "Failed to fetch quote.");
  //     }
  //   });
  // }, [state.preferences.widgetType]);

  useEffect(() => {
    if (!quoteKey) return;
    chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
      if (request.action === "WIDGET_TYPE_CHANGE") {
        setQuoteKey(request.widgetType);
        // setQuote(request.quote);

        // Optionally fetch a new quote here if you want immediate update
        if (request.widgetType !== quoteKey) {
          // fetchQuote();

        }
      }
    });
  
    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener((_request, _sender, _sendResponse) => {});
    };
  }, []);
  // Add this useEffect to watch for state changes from background script
  // useEffect(() => {
  //   if (!quoteKey) return;
  //   chrome.storage.onChanged.addListener((changes) => {
  //     if (changes.preferences?.newValue) {
  //       const newWidgetType = changes.preferences.newValue.widgetType;
  //       if (newWidgetType && newWidgetType !== quoteKey) {
  //         // setQuoteKey(newWidgetType);
  //       }
  //     }
  //   });

  //   return () => {
  //     chrome.storage.onChanged.removeListener((_changes) => {});
  //   };
  // }, [quoteKey]);

  // useEffect(() => {
  //   setQuoteKey(state.preferences.widgetType);
  // }, [state.preferences.widgetType])
  

  const fetchQuote = () => {
    chrome.runtime.sendMessage(
      { action: "GET_MOTIVATIONAL_QUOTES", quoteKey: quoteKey },
      (response: { quote?: string; error?: string }) => {
        if (response?.quote) {
          setQuote(response.quote);
        }
      }
    );
  };


  useEffect(() => {
   if (!quoteKey) return;
   fetchQuote();
  }, [quoteKey]);


  const refreshQuote = () => {
    setIsAnimating(true);
    fetchQuote();
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
      if (document.visibilityState === 'visible') {
        // Check for any ads that might have been added while tab was inactive
        document.querySelectorAll(AD_SELECTORS.join(',')).forEach(node => {
          if (node instanceof HTMLElement && !nodesBeingProcessed.has(node)) {
            if (isElementInViewport(node) || isElementNearViewport(node)) {
              replaceAdWithWidget(node);
            } else {
              // Optionally, set up IntersectionObserver again if not already set
            }
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isTabVisible) {
      observeAds(); // Start or resume observing when the tab is visible
    } else {
      pauseObserver(); // Pause when the tab is not visible
    }
  }, [isTabVisible]);

//   // const selectWidget = () => {
//   //   if (quoteKey === "Gratitude"){
//   //     return (
//   //       <div className={styles["blockquote-wrapper"]}>
//   //         <div className={styles["blockquote"]}>
//   //           <div className={styles["quote-box"]}>
//   //             <p id="quote-text">{quote}</p>
//   //             <h4 id="quote-author"></h4>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     );
//   //   } else if (quoteKey === "Personal Life"){
//   //     return (
//   //       <div className={styles["blockquote-wrapper"]}>
//   //         <div className={styles["blockquote"]}>
//   //           <div className={styles["quote-box"]}>
//   //             <p id="quote-text">{quote}</p>
//   //             <h4 id="quote-author"></h4>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     );
//   //   } else if (quoteKey === "Success"){
//   //     return (
//   //       <div className={styles["blockquote-wrapper"]}>
//   //         <div className={styles["blockquote"]}>
//   //           <div className={styles["quote-box"]}>
//   //             <p id="quote-text">{quote}</p>
//   //             <h4 id="quote-author"></h4>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     );
//   //   } else {
//   //     return (
//   //       <div className={styles["blockquote-wrapper"]}>
//   //         <div className={styles["blockquote"]}>
//   //           <div className={styles["quote-box"]}>
//   //             <p id="quote-text">{quote}</p>
//   //             <h4 id="quote-author"></h4>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     );
//   //   }
//   // };

//   return selectWidget();

  const getWidgetConfig = (type: string) => {
    const configs: any = {
      Gratitude: {
        Icon: FaHeart,
        title: "Gratitude",
        widgetClasses: `${styles.widget} ${styles.widgetGratitude}`,
        titleClass: styles.titleGratitude,
        quoteClass: styles.quoteGratitude,
        iconColor: "#f59e0b"
      },
      Success: {
        Icon: FaTrophy,
        title: "Success",
        widgetClasses: `${styles.widget} ${styles.widgetSuccess}`,
        titleClass: styles.titleSuccess,
        quoteClass: styles.quoteSuccess,
        iconColor: "#10b981"
      },
      "Personal Life": {
        Icon: FaStar,
        title: "Inspiration",
        widgetClasses: `${styles.widget} ${styles.widgetPersonal}`,
        titleClass: styles.titlePersonal,
        quoteClass: styles.quotePersonal,
        iconColor: "#3b82f6"
      },
      Default: {
        Icon: FaExclamationCircle,
        title: "Reminder",
        widgetClasses: `${styles.widget} ${styles.widgetDefault}`,
        titleClass: styles.titleDefault,
        quoteClass: styles.quoteDefault,
        iconColor: "#8b5cf6"
      }
    };
    const titleCase = capitalizeFirstLetters(type)
    return configs[titleCase] || configs.Default;
  };

  const config = getWidgetConfig(quoteKey);
  const { Icon, title, widgetClasses, titleClass, quoteClass, iconColor } = config;

  return (
    <div className={styles.container}>
      <div className={`${widgetClasses} ${isAnimating ? styles.animating : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <Icon size={20} color={iconColor} />
            <h3 className={`${styles.title} ${titleClass}`}>{title}</h3>
          </div>
          <button 
            onClick={refreshQuote}
            className={styles.refreshButton}
            title="Get new quote"
          >
            <FaSync 
              size={16}
              className={isAnimating ? styles.spinning : ''}
              color={iconColor}
            />
          </button>
        </div>
        <p className={`${styles.quote} ${quoteClass}`}>"{quote}"</p>
      </div>
    </div>
  );
});

// Start observing ads when the script runs
observeAds();

