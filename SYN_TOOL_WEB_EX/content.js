// content.js

// Function to send the token to the background script
function sendTokenToExtension() {
    const token = localStorage.getItem('SYN_Token');

    if (token) {
        chrome.runtime.sendMessage({ action: 'sendToken', token: token }, function (response) {
            console.log("Response from background script:", response);
        });
    } else {
        console.log("No token found in localStorage.");
    }
}

// Call the function when the document is ready
document.addEventListener('DOMContentLoaded', sendTokenToExtension);
