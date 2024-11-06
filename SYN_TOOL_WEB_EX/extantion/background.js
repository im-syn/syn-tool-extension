

// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Initialize the extension status
    initializeExtension();
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'sendToken' && request.token) {
        // Store the token in Chrome storage
        chrome.storage.local.set({ SYN_Token: request.token }, function () {
            console.log('SYN Token updated in extension storage:', request.token);
            sendResponse({ status: 'success' }); // Respond back to the content script
        });
        return true; // Indicates you wish to send a response asynchronously
    }
});

// Function to extract the token from the specified URL
function extractToken() {
    // Check if the current tab's URL matches the specified pattern
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const urlPattern = /https:\/\/synleaks\.freewebhostmost\.com\/v2\/api\/oauth\/discord\/callback\.php\?.*/;

        if (urlPattern.test(currentTab.url)) {
            // Execute a script in the context of the active tab
            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: () => {
                    const tokenElement = document.querySelector('token#login');
                    return tokenElement ? tokenElement.textContent : null; // Return the token value or null
                }
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('Error executing script:', chrome.runtime.lastError);
                } else if (results && results[0] && results[0].result) {
                    const tokenValue = results[0].result;
                    if (tokenValue) {
                        // Store or update the token in Chrome storage
                        chrome.storage.local.set({ SYN_Token: tokenValue }, function () {
                            console.log('SYN Token updated in extension storage:', tokenValue);
                            // Call function to check for the token immediately after setting it
                            checkToken();
                        });
                    } else {
                        console.error('Token element not found in the HTML content.');
                    }
                }
            });
        }
    });
}

// Function to check for SYN_Token in Chrome storage
function checkToken() {
    chrome.storage.local.get(["SYN_Token"], function (result) {
        console.log("Checking for SYN_Token in storage...");
        if (result.SYN_Token) {
            console.log("SYN_Token exists:", result.SYN_Token);
            // Set popup to popup.html
            chrome.action.setPopup({ popup: "popup.html" });
        } else {
            console.log("SYN_Token does not exist, showing login.html");
            // Set popup to login.html
            chrome.action.setPopup({ popup: "login.html" });
        }
    });
}

// Initialize the extension status
function initializeExtension() {
    // First, check for the SYN_Token in Chrome storage
    checkToken(); // You might call this first to set the popup appropriately
    // Then extract the token
    extractToken();
}
