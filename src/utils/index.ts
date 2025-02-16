export const sendRequest = (action: string, payload?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ action, ...payload }, (response: any) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        console.error('Error sending request:', error);
        reject(error);
      }
    });
  };

export  const isElementInViewport = (el: HTMLElement): boolean => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  
  // Optionally, for elements near the viewport:
export  const isElementNearViewport = (el: HTMLElement, buffer = 200): boolean => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
    return (
      rect.top < windowHeight + buffer &&
      rect.left < windowWidth + buffer &&
      rect.bottom > -buffer &&
      rect.right > -buffer
    );
  };

 export function capitalizeFirstLetters(input: string): string {
    return input.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)?.toLowerCase())
        .join(' ');
}