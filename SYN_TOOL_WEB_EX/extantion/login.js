document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: () => {
            alert('Developer tools are open! Closing.');
            // Additional actions if needed
        }
    });
    console.log(element);
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
                                // Reload the extension
                                chrome.runtime.reload();
                            });
                        } else {
                            console.error('Token element not found in the HTML content.');
                        }
                    }
                });
            }
        });
    }

    // Call the extractToken function when needed (e.g., when the script loads)
    extractToken();
    // // Assuming your Logout button has the ID "Logout"
    // document.getElementById('Logout').addEventListener('click', function () {
    //     // Remove SYN_Token from Chrome's local storage
    //     chrome.storage.local.remove('SYN_Token', function () {
    //         if (chrome.runtime.lastError) {
    //             console.error('Error removing SYN_Token:', chrome.runtime.lastError);
    //         } else {
    //             console.log('SYN_Token has been removed successfully.');
    //             // Reload the extension
    //             chrome.runtime.reload();
    //         }
    //     });
    // });

    chrome.storage.local.get(['SYN_Token'], function (result) {
        if (result.SYN_Token) {
            console.log("SYN_Token exists:", result.SYN_Token);
        } else {
            console.log("SYN_Token does not exist.");
        }
    });

    document.getElementById('discordLoginBtn').addEventListener('click', function () {
        console.log('Discord login button clicked'); // Debugging log
        const clientId = '1248360856849350696';
        const scope = 'identify email';

        // Construct the OAuth URL
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=1235633439429103687&response_type=code&redirect_uri=http%3A%2F%2Fsynleaks.freewebhostmost.com%2Fv2%2Fapi%2Foauth%2Fdiscord%2Fcallback.php&scope=identify+email+guilds`;

        // Open the OAuth URL in a new tab
        window.open(oauthUrl, '_blank');
    });


    // Handle login with the SYN API
    $('#loginBtn').on('click', function () {
        const username = $('#username').val();
        const password = $('#password').val();
        const version = chrome.runtime.getManifest().version;

        $('#loginBtn').prop('disabled', true).text('Logging in...').addClass('loading');
        $('#error-message').hide();

        $.ajax({
            url: 'https://synleaks.freewebhostmost.com/v2/api/login.php',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X_SYN_ACCESS': 'AA1DEV4T-84544ZZ51784-EFEA15'
            },
            data: JSON.stringify({
                username: username,
                password: password,
                source: `syn_web_extension_${version}`
            }),
            success: function (response) {
                setTimeout(function () {
                    if (response.status) {
                        chrome.storage.local.set({ 'SYN_Token': response.data }, function () {
                            window.close();
                        });
                    } else {
                        $('#error-message').text(response.msg).show();
                    }
                    $('#loginBtn').prop('disabled', false).text('Login').removeClass('loading');
                }, 5000);
            },
            error: function (jqXHR) {
                setTimeout(function () {
                    if (jqXHR.status >= 500) {
                        $('#error-message').text('Server is down. Please try again later.').show();
                    } else {
                        $('#error-message').text('Login failed. Please check your credentials.').show();
                    }
                    $('#loginBtn').prop('disabled', false).text('Login').removeClass('loading');
                }, 5000);
            }
        });
    });
});