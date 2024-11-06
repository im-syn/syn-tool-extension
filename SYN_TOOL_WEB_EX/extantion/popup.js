document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(['SYN_Token'], function (result) {
        if (result.SYN_Token) {
            console.log("SYN_Token exists:", result.SYN_Token);
        } else {
            console.log("SYN_Token does not exist.");
        }
    });
// Slide index
    let slideIndex = 0;

    // Function to change slides
    function showSlides() {
        const slides = document.querySelectorAll('.announcement-image');
        
        // Hide all slides initially
        slides.forEach(slide => slide.style.transform = 'translateX(-100%)');
        
        // Show the current slide
        slides[slideIndex].style.transform = 'translateX(0)';

        // Update the index for the next slide, wrapping around
        slideIndex = (slideIndex + 1) % slides.length;
    }

    // Set interval to change slides every 3 seconds
    // setInterval(showSlides, 3000);
    // Check for the SYN_Token in storage
    chrome.storage.local.get(["SYN_Token"], function (result) {
        if (result.SYN_Token) {
            console.log("Logged in with SYN_Token:", result.SYN_Token);
            // Proceed with the normal popup functionality
            // You can initialize your main features here
            // Define global variables to store profile data
            let profileId, profileName, profileService;

            const tabButtons = document.querySelectorAll(".tab-button");
            const tabs = document.querySelectorAll(".tab");
            const serverStatus = document.getElementById("serverStatus");
            const websiteStatus = document.getElementById("websiteStatus");
            const profileSection = document.querySelector(".profile-section");
            const leakNowButton = document.getElementById("leakNowBtn"); // New button for Leak Now
            let currentTabUrl = null;

            // Tab switching
            tabButtons.forEach(button => {
                button.addEventListener("click", () => {
                    document.querySelector(".tab-button.active").classList.remove("active");
                    button.classList.add("active");
                    document.querySelector(".tab.active").classList.remove("active");
                    document.querySelector(`.${button.dataset.tab}`).classList.add("active");
                });
            });



            // Function to fetch profile data
            function fetchProfileData(platform, username) {
                if (platform == "onlyfans") {
                    const apiUrl = `https://synleaks.freewebhostmost.com/v2/rebuildApi.php?endpoint=https://coomer.su/api/v1/${platform}/user/${username}/profile`;
                    console.log(`Fetching profile data from: ${apiUrl}`);

                    fetch(apiUrl)
                        .then(response => response.json().then(data => {
                            console.log("API Response:", data); // Log the entire response here
                            return { response, data }; // Return both response and data for further processing
                        }))
                        .then(({ response, data }) => {
                            if (data.error) {
                                console.log("Profile not found");
                                displayProfileNotFound();
                                return;
                            }

                            // Check for leaks based on the presence of a specific field or condition
                            if (data.indexed && data.updated) {
                                console.log("Profile found with leaks data.");
                                // Assign the retrieved data to global variables
                                profileId = data.id;
                                profileName = data.name;
                                profileService = data.service;

                                displayProfileData(data);
                            } else {
                                console.log("No leaks found for this profile.");
                                displayProfileNotFound();
                            }
                        })
                        .catch(error => {
                            console.error("API request failed:", error);
                            displayProfileNotFound();
                        });
                }
                else if (platform == "fansly") {
                    const apiUrl = `https://synv2.freewebhostmost.com/rebuildApi_search.php?username=${username}`;
                    console.log(`Fetching profile data from: ${apiUrl}`);

                    fetch(apiUrl)
                        .then(response => response.json().then(data => {
                            console.log("API Response:", data); // Log the entire response here
                            return { response, data }; // Return both response and data for further processing
                        }))
                        .then(({ response, data }) => {
                            if (data.error) {
                                console.log("Profile not found");
                                displayProfileNotFound(false);
                                return;
                            }

                            // Check for leaks based on the presence of a specific field or condition
                            if (data.indexed && data.updated) {
                                console.log("Profile found with leaks data.");
                                // Assign the retrieved data to global variables
                                profileId = data.id;
                                profileName = data.name;
                                profileService = data.service;
                                displayProfileData(data);
                            } else {
                                console.log("No leaks found for this profile.");
                                displayProfileNotFound(false);
                            }
                        })
                        .catch(error => {
                            console.error("API request failed:", error);
                            displayProfileNotFound(true);
                        });
                }
                else if (platform == "patreon") {
                    const apiUrl = `https://synv2.freewebhostmost.com/rebuildApi_search.php?username=${username}&host=kemono&platform=patreon`;
                    console.log(`Fetching profile data from: ${apiUrl}`);

                    fetch(apiUrl)
                        .then(response => response.json().then(data => {
                            console.log("API Response:", data); // Log the entire response here
                            return { response, data }; // Return both response and data for further processing
                        }))
                        .then(({ response, data }) => {
                            if (data.error) {
                                console.log("Profile not found");
                                displayProfileNotFound(false);
                                return;
                            }

                            // Check for leaks based on the presence of a specific field or condition
                            if (data.indexed && data.updated) {
                                console.log("Profile found with leaks data.");
                                // Assign the retrieved data to global variables
                                profileId = data.id;
                                profileName = data.name;
                                profileService = data.service;
                                displayProfileData(data, "kemono");
                            } else {
                                console.log("No leaks found for this profile.");
                                displayProfileNotFound(false);
                            }
                        })
                        .catch(error => {
                            console.error("API request failed:", error);
                            displayProfileNotFound(true);
                        });
                }

            }
            function StorageManager(task, key, value) {
                return new Promise((resolve, reject) => {
                    switch (task) {
                        case 'add':
                            chrome.storage.local.set({ [key]: value }, () => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(`Added: ${key} = ${value}`);
                                }
                            });
                            break;

                        case 'update':
                            exists(key)
                                .then((exists) => {
                                    if (exists) {
                                        chrome.storage.local.set({ [key]: value }, () => {
                                            if (chrome.runtime.lastError) {
                                                reject(chrome.runtime.lastError);
                                            } else {
                                                resolve(`Updated: ${key} = ${value}`);
                                            }
                                        });
                                    } else {
                                        reject(`Key "${key}" does not exist.`);
                                    }
                                })
                                .catch(reject);
                            break;

                        case 'delete':
                            chrome.storage.local.remove(key, () => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(`Deleted: ${key}`);
                                }
                            });
                            break;

                        case 'exists':
                            exists(key)
                                .then((exists) => resolve(`Exists: ${exists}`))
                                .catch(reject);
                            break;

                        case 'get':
                            chrome.storage.local.get(key, (result) => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(result[key] !== undefined ? result[key] : null);
                                }
                            });
                            break;

                        default:
                            reject(`Invalid task: ${task}`);
                    }
                });
            }

            // Helper function to check if an item exists
            function exists(key) {
                return new Promise((resolve) => {
                    chrome.storage.local.get(key, (result) => {
                        resolve(result[key] !== undefined);
                    });
                });
            }


            // Function to get the current tab's HTML and trigger download
            function saveCurrentTabHtml() {


                // Query for the active tab in the current window
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tab = tabs[0];

                    // Execute script to get HTML content
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => document.documentElement.outerHTML,
                    }, (results) => {
                        if (results && results[0] && results[0].result) {
                            const htmlContent = results[0].result;

                            // Create a blob with HTML content
                            const blob = new Blob([htmlContent], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);

                            // Create download link
                            const downloadLink = document.createElement('a');
                            downloadLink.href = url;
                            downloadLink.download = `${tab.title || 'page'}.html`;

                            // Append link to DOM, click to trigger download, then remove it
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);

                            // Revoke object URL to free up memory
                            URL.revokeObjectURL(url);
                        } else {
                            console.error('No HTML content was returned from the tab.');
                        }
                    });
                });
            }

            // Assuming your Logout button has the ID "Logout"
            document.getElementById('Logout').addEventListener('click', function () {
                // Remove SYN_Token from Chrome's local storage
                chrome.storage.local.remove('SYN_Token', function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing SYN_Token:', chrome.runtime.lastError);
                    } else {
                        console.log('SYN_Token has been removed successfully.');
                        // Reload the extension
                        chrome.runtime.reload();
                    }
                });
            });


            // StorageManager('add', 'helloMessage', 'Hello, world!')
            //     .then(console.log)
            //     .catch(console.error);

            // // Update the item
            // StorageManager('update', 'helloMessage', 'Hello, updated world!')
            //     .then(console.log)
            //     .catch(console.error);

            // // Check if the item exists
            // StorageManager('exists', 'helloMessage')
            //     .then(console.log)
            //     .catch(console.error);

            // // Get the value of the item
            // StorageManager('get', 'helloMessage')
            //     .then(console.log)
            //     .catch(console.error);

            // // Delete the item
            // StorageManager('delete', 'helloMessage')
            //     .then(console.log)
            //     .catch(console.error);

            document.getElementById('save-html').addEventListener('click', saveCurrentTabHtml);

            // Function to display profile data
            function displayProfileData(data, host = "coomer") {
                // Update profile section with data
                document.querySelector(".profile-username").textContent = data.name;
                document.querySelector(".profile-banner-img").src = `https://img.${host}.su/banners/${data.service}/${data.id}`;
                document.querySelector(".profile-img").src = `https://img.${host}.su/icons/${data.service}/${data.id}`;

                // Format dates for kemono host
                let indexedDate = data.indexed;
                let updatedDate = data.updated;

                if (host === "kemono") {
                    indexedDate = formatDate(data.indexed);
                    updatedDate = formatDate(data.updated);
                }

                document.querySelector(".profile-dates").innerHTML =
                    `<span>Added Leaks: ${indexedDate}</span> || <span>Updated Leaks: ${updatedDate}</span>`;

                websiteStatus.textContent = "Supported";
                websiteStatus.style.color = "#0f0"; // Green
                profileSection.style.display = "block"; // Show profile section
            }

            // Helper function to convert timestamp to {year}-{month}-{day} format
            function formatDate(timestamp) {
                const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // Function to handle profile not found
            function displayProfileNotFound(isError = false) {
                if (isError) {
                    websiteStatus.textContent = "Server Error";
                    websiteStatus.style.color = "#E5C07B"; // Orange
                    profileSection.style.display = "none"; // Hide profile section

                    // Mock server status as "Online"
                    serverStatus.textContent = "Restricted";
                    serverStatus.style.color = "#E5C07B";
                }
                else {
                    websiteStatus.textContent = "No leaks found";
                    websiteStatus.style.color = "#ffa500"; // Orange
                    profileSection.style.display = "none"; // Hide profile section
                }

            }

            // function fetchPatreonProfileData(platform , username) {

            //     // Extract the username by removing the base URL and any query parameters
            //     const urlParts = platform ?? url.split("https://www.patreon.com/")[1].split("?");
            //     const username = username ?? urlParts[0];
            //     const platform = "patreon";
            //     const apiUrl = `https://synleaks.freewebhostmost.com/v2/rebuildApi.php?endpoint=https://kemono.su/api/v1/${platform}/user/${username}/profile`;

            //     console.log(`Fetching profile data from: ${apiUrl}`);

            //     // Fetch the profile data
            //     fetch(apiUrl)
            //         .then(response => response.json().then(data => {
            //             console.log("API Response:", data); // Log the entire response here
            //             return { response, data }; // Return both response and data for further processing
            //         }))
            //         .then(({ response, data }) => {
            //             if (data.error) {
            //                 console.log("Profile not found");
            //                 displayProfileNotFound();
            //                 return;
            //             }

            //             // Check for leaks based on the presence of a specific field or condition
            //             if (data.indexed && data.updated) {
            //                 console.log("Profile found with leaks data.");
            //                 // Assign the retrieved data to global variables
            //                 profileId = data.id;
            //                 profileName = data.name;
            //                 profileService = data.service;

            //                 displayProfileData(data);
            //             } else {
            //                 console.log("No leaks found for this profile.");
            //                 displayProfileNotFound();
            //             }
            //         })
            //         .catch(error => {
            //             console.error("API request failed:", error);
            //             displayProfileNotFound(true);
            //         });
            // }

            // Function to check current tab and extract platform and username
            function checkSupportedWebsite(tabUrl) {
                const url = new URL(tabUrl);
                const hostname = url.hostname;
                let platform = "";
                let username = "";

                // Check for supported platforms
                if (hostname.includes("onlyfans.com")) {
                    platform = "onlyfans";
                    username = url.pathname.split("/")[1];
                } else if (hostname.includes("fansly.com")) {
                    platform = "fansly";
                    username = url.pathname.split("/")[1];
                }
                else if (hostname.includes("patreon.com")) {
                    platform = "patreon";
                    username = url.pathname.split("/")[1];
                }

                if (platform && username) {
                    console.log(`Supported website detected: ${platform}, Username: ${username}`);
                    if (platform == "onlyfans" || platform == "fansly") {
                        fetchProfileData(platform, username);

                    }
                    else if (platform == "patreon") {
                        fetchProfileData(platform, username);
                    }

                } else {
                    console.log("Unsupported website");
                    if (platform == "onlyfans" || platform == "fansly") {
                        websiteStatus.textContent = "Supported - Not Profile";
                        websiteStatus.style.color = "#E5C07B"; // Red
                        profileSection.style.display = "none"; // Hide profile section
                    } else {
                        websiteStatus.textContent = "Not Supported";
                        websiteStatus.style.color = "#f00"; // Red
                        profileSection.style.display = "none"; // Hide profile section
                    }
                }
            }

            // Initialize the extension status once
            function initializeExtension() {

                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    if (!tabs || !tabs[0]) {
                        console.error("No active tab found");
                        return;
                    }
                    const tabUrl = tabs[0].url;
                    console.log("Current tab URL:", tabUrl);

                    // Check if the tab URL has changed
                    if (tabUrl !== currentTabUrl) {
                        currentTabUrl = tabUrl; // Cache the tab URL
                        checkSupportedWebsite(tabUrl);
                    }
                });

                // Mock server status as "Online"
                serverStatus.textContent = "Online";
                serverStatus.style.color = "#0f0"; // Green
            }

            const howToUseButton = document.getElementById("howToUse");
            if (howToUseButton) {
                howToUseButton.addEventListener("click", () => {
                    alert("How to use guide will be injected here.");
                });
            }

            const rateButton = document.getElementById("rate-btn");
            if (rateButton) {
                rateButton.addEventListener("click", () => {
                    window.open("https://example.com/rate-syn", "_blank");
                });
            }

            async function manipulateFanslyPageContent(profileService, profileId, profileName) {
                // Check if profileService and profileId are provided
                if (!profileService || !profileId) {
                    console.warn("Missing profileService or profileId.");
                    return;
                }

                // Locate the <div> with class "tab-content"
                const tabContentDiv = document.querySelector('div.tab-content');

                if (tabContentDiv) {
                    console.log("Found <div> with class 'tab-content'.");

                    // Locate the <app-profile-timeline-route> within tab-content
                    const profileTimeline = tabContentDiv.querySelector('app-profile-timeline-route');

                    if (profileTimeline) {
                        console.log("Found <app-profile-timeline-route> inside 'tab-content'.");

                        // Remove all child elements within <app-profile-timeline-route>
                        while (profileTimeline.firstChild) {
                            profileTimeline.removeChild(profileTimeline.firstChild);
                        }

                        // Inject <h2>SYN LEAKED</h2> into tabContentDiv only once
                        const header = document.createElement("h2");
                        header.textContent = "SYN LEAKED";
                        tabContentDiv.appendChild(header);

                        // Create and append the "Waiting..." paragraph
                        const waitingMessage = document.createElement("p");
                        waitingMessage.textContent = "Waiting...";
                        tabContentDiv.appendChild(waitingMessage);

                        // Define the API URL using the provided profileService and profileId
                        const apiUrl = `https://synleaks.freewebhostmost.com/v2/rebuildApi.php?endpoint=https://coomer.su/api/v1/${profileService}/user/${profileId}`;
                        // console.log("API URL:", apiUrl);

                        // Initialize arrays to store post IDs and attachment paths
                        const postIds = [];
                        const attachmentPaths = [];

                        try {
                            // Send a request to the API endpoint and get the response
                            const response = await fetch(apiUrl);

                            if (!response.ok) {
                                throw new Error(`Network response was not ok: ${response.statusText}`);
                            }

                            const data = await response.json();
                            console.log("API Response:", data);

                            // Store the entire JSON response as a string
                            const jsonResponseString = JSON.stringify(data);

                            if (Array.isArray(data) && data.length > 0) {
                                let postHtml = ''; // Initialize an empty string for post HTML

                                // Loop through each object in the response
                                data.forEach((post) => {
                                    // Store post ID
                                    postIds.push(post.id);

                                    // Determine post type
                                    let postType = 'text'; // Default to text
                                    let attachmentsHtml = '';

                                    if (post.attachments && post.attachments.length > 0) {
                                        post.attachments.forEach((attachment) => {
                                            if (attachment.path) {
                                                // Store attachment path
                                                attachmentPaths.push(attachment.path);

                                                // Check the file extension
                                                const extension = attachment.path.split('.').pop().toLowerCase();
                                                if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                                                    postType = 'image';
                                                    attachmentsHtml += `<app-post-attachment _ngcontent-ng-c494418858="" class="feed-item-preview-media" _nghost-ng-c1935894613="">
    <app-account-media _ngcontent-ng-c1935894613="" _nghost-ng-c1604423040="">
        <!---->
        <div _ngcontent-ng-c1604423040="">
            <!---->
            <app-media _ngcontent-ng-c1604423040="" class="image" _nghost-ng-c932160810="">
                <!----><!----><!---->
                <div _ngcontent-ng-c932160810="">
                    <!----><!---->
                    <img _ngcontent-ng-c932160810="" 
                         src="https://coomer.su/data${attachment.path}" 
                         style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                    <!----><!----><!----><!----><!---->
                </div>
                <!----><!----><!----><!----><!----><!----><!---->
            </app-media>
            <!----><!----><!----><!----><!----><!----><!----><!----><!---->
        </div>
        <!----><!----><!----><!----><!----><!----><!---->
    </app-account-media>
    <!----><!----><!----><!---->
</app-post-attachment>`;
                                                } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
                                                    postType = 'video';
                                                    attachmentsHtml += `<app-post-attachment _ngcontent-ng-c494418858="" class="feed-item-preview-media" _nghost-ng-c1935894613="">
    <app-account-media _ngcontent-ng-c1935894613="" _nghost-ng-c1604423040="">
        <!---->
        <div _ngcontent-ng-c1604423040="">
            <!---->
            <app-media _ngcontent-ng-c1604423040="" class="image" _nghost-ng-c932160810="">
                <!----><!----><!---->
                <div _ngcontent-ng-c932160810="">
                    <!----><!---->
                    <video _ngcontent-ng-c932160810="" height="100%" width="100%" src="https://coomer.su/data${attachment.path}" controls style="max-width: 100%; height: auto;"></video>
                    <!----><!----><!----><!----><!---->
                </div>
                <!----><!----><!----><!----><!----><!----><!---->
            </app-media>
            <!----><!----><!----><!----><!----><!----><!----><!----><!---->
        </div>
        <!----><!----><!----><!----><!----><!----><!---->
    </app-account-media>
    <!----><!----><!----><!---->
</app-post-attachment>
`;
                                                }
                                            }
                                        });
                                    }

                                    // Calculate time ago
                                    const dateStr = post.added;
                                    const now = new Date();
                                    const date = new Date(dateStr);
                                    const secondsAgo = Math.floor((now - date) / 1000);
                                    let timeAgoString = "";

                                    const intervals = [
                                        { label: "year", seconds: 31536000 },
                                        { label: "month", seconds: 2592000 },
                                        { label: "week", seconds: 604800 },
                                        { label: "day", seconds: 86400 },
                                        { label: "hour", seconds: 3600 },
                                        { label: "minute", seconds: 60 },
                                        { label: "second", seconds: 1 }
                                    ];

                                    for (const interval of intervals) {
                                        const count = Math.floor(secondsAgo / interval.seconds);
                                        if (count >= 1) {
                                            timeAgoString = count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
                                            break;
                                        }
                                    }
                                    if (!timeAgoString) {
                                        timeAgoString = "just now";
                                    }


                                    if (postType == "image") {

                                    }
                                    else if (postType == "video") {

                                    }
                                    else if (postType == "text") {

                                    }
                                    else {

                                    }
                                    //     // Create the HTML for the post
                                    //     postHtml += `
                                    //     <div style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;">
                                    //         <p><strong>Content:</strong> ${post.content ? post.content : "(No content)"}</p>
                                    //         <p><strong>Post Type:</strong> ${postType}</p>
                                    //         <p><strong>Added:</strong> ${timeAgoString}</p>
                                    //         <ul>
                                    //             ${attachmentsHtml || '<li>(No attachments)</li>'}
                                    //         </ul>
                                    //     </div>
                                    // `;

                                    postHtml += `
<app-post _ngcontent-ng-c562628905="" xdrenderinfo="" class="feed-item" _nghost-ng-c494418858=""><!---->

<div _ngcontent-ng-c494418858="" class="feed-item-content border-color" tabindex="0">
    <!---->
    <div _ngcontent-ng-c494418858="" class="feed-item-meta-wrapper">
        <div _ngcontent-ng-c494418858="" class="flex-row">
            <div _ngcontent-ng-c494418858="" class="feed-item-avatar">
                <app-account-avatar _ngcontent-ng-c494418858="" appaccountcard="" class="avatar"
                    _nghost-ng-c2027909987="">
                    <!---->
                    <a _ngcontent-ng-c2027909987="" href="/${profileName}" class="status-mode-1 offline live-mode-1">
                        <app-media _ngcontent-ng-c2027909987="" originid="account-avatar" class="avatar"
                            _nghost-ng-c932160810="">
                            <!----><!----><!---->
                            <div _ngcontent-ng-c932160810="" class="image-placeholder-wrapper cover">
                                <!----><!----><img _ngcontent-ng-c932160810="" class="image cover"
                                    src="https://img.coomer.su/icons/${profileService}/${profileId}"><!---->
                                <div _ngcontent-ng-c932160810="" class="image-overlay"></div>
                                <!----><!----><!----><!---->
                            </div>
                            <!----><!----><!----><!----><!----><!----><!---->
                        </app-media>
                        <!---->
                    </a>
                    <!----><!----><!----><!----><!---->
                </app-account-avatar>
            </div>
            <div _ngcontent-ng-c494418858="" class="feed-item-meta">
                <div _ngcontent-ng-c494418858="" class="feed-item-title">
                    <div _ngcontent-ng-c494418858="" class="feed-item-name">
                        <app-account-username _ngcontent-ng-c494418858="" maxlength="18"
                            class="user-name sm-mobile-hidden" _nghost-ng-c3190086805="">
                            <a _ngcontent-ng-c3190086805="" class="username-wrapper col-name" href="/${profileName}">
                                <div _ngcontent-ng-c3190086805="" class="icon-wrapper flex-row flex-align-center">
                                    <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                        class="display-name">${profileName}</span><!----><!----><!----><!---->
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <span _ngcontent-ng-c3190086805="" class="user-icon"
                                            style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                    </div>
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <!---->
                                    </div>
                                    <!----><!----><!---->
                                </div>
                                <span _ngcontent-ng-c3190086805="" class="user-name">
                                    @${profileName}
                                    <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                        class="transparent-dropdown display-inline">
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="dropdown-list">
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add to
                                                List </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                <xd-localization-string _ngcontent-ng-c3190086805=""
                                                    _nghost-ng-c2905135316="">
                                                    Block user <!----><!---->
                                                </xd-localization-string>
                                            </div>
                                            <!----><!---->
                                        </div>
                                    </div>
                                </span>
                                <!----><!----><!----><!----><!---->
                            </a>
                            <!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                        </app-account-username>
                        <app-account-username _ngcontent-ng-c494418858="" maxlength="14"
                            class="user-name sm-mobile-visible xs-mobile-hidden" _nghost-ng-c3190086805="">
                            <a _ngcontent-ng-c3190086805="" class="username-wrapper col-name" href="/${profileName}">
                                <div _ngcontent-ng-c3190086805="" class="icon-wrapper flex-row flex-align-center">
                                    <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                        class="display-name">${profileName}</span><!----><!----><!----><!---->
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <span _ngcontent-ng-c3190086805="" class="user-icon"
                                            style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                    </div>
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <!---->
                                    </div>
                                    <!----><!----><!---->
                                </div>
                                <span _ngcontent-ng-c3190086805="" class="user-name">
                                    @${profileName}
                                    <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                        class="transparent-dropdown display-inline">
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="dropdown-list">
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add to
                                                List </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                <xd-localization-string _ngcontent-ng-c3190086805=""
                                                    _nghost-ng-c2905135316="">
                                                    Block user <!----><!---->
                                                </xd-localization-string>
                                            </div>
                                            <!----><!---->
                                        </div>
                                    </div>
                                </span>
                                <!----><!----><!----><!----><!---->
                            </a>
                            <!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                        </app-account-username>
                        <app-account-username _ngcontent-ng-c494418858="" maxlength="12"
                            class="user-name xs-mobile-visible" _nghost-ng-c3190086805="">
                            <a _ngcontent-ng-c3190086805="" class="username-wrapper col-name" href="/${profileName}">
                                <div _ngcontent-ng-c3190086805="" class="icon-wrapper flex-row flex-align-center">
                                    <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                        class="display-name">${profileName}</span><!----><!----><!----><!---->
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <span _ngcontent-ng-c3190086805="" class="user-icon"
                                            style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                    </div>
                                    <div _ngcontent-ng-c3190086805="" class="tooltip">
                                        <!---->
                                    </div>
                                    <!----><!----><!---->
                                </div>
                                <span _ngcontent-ng-c3190086805="" class="user-name">
                                    @${profileName}
                                    <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                        class="transparent-dropdown display-inline">
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="dropdown-list">
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805=""
                                                    class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                    _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add to
                                                List </div>
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                <xd-localization-string _ngcontent-ng-c3190086805=""
                                                    _nghost-ng-c2905135316="">
                                                    Block user <!----><!---->
                                                </xd-localization-string>
                                            </div>
                                            <!----><!---->
                                        </div>
                                    </div>
                                </span>
                                <!----><!----><!----><!----><!---->
                            </a>
                            <!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                        </app-account-username>
                    </div>
                    <div _ngcontent-ng-c494418858="" class="feed-item-timestamp">${timeAgoString}</div>
                    <!---->
                    <div _ngcontent-ng-c494418858="" appxddropdown=""
                        class="feed-item-actions dropdown-trigger more-dropdown">
                        <div _ngcontent-ng-c494418858="" class="navigation-icon custom-hover-effect"><i
                                _ngcontent-ng-c494418858="" class="fa-fw fas fa-circle"></i><i
                                _ngcontent-ng-c494418858="" class="fa-fw fas fa-circle"></i><i
                                _ngcontent-ng-c494418858="" class="fa-fw fas fa-circle"></i></div>
                        <div _ngcontent-ng-c494418858="" class="dropdown-list">
                            <div _ngcontent-ng-c494418858="" data-dropdown-value="xDD" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-list"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Add To List <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!---->
                            <div _ngcontent-ng-c494418858="" data-dropdown-value="xDD" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-xmark-octagon"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Unfollow <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!----><!----><!---->
                            <div _ngcontent-ng-c494418858="" class="dropdown-item" tabindex="0">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-user-tag"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Subscribe to <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!---->
                            <div _ngcontent-ng-c494418858="" class="dropdown-item">
                                <i _ngcontent-ng-c494418858=""
                                    class="fa-fw fal fa-arrow-right-from-bracket fa-rotate-270"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Copy Post Link <!----><!---->
                                </xd-localization-string>
                            </div>
                            <div _ngcontent-ng-c494418858="" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-flag"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Report Post <!----><!---->
                                </xd-localization-string>
                            </div>
                            <!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                            <div _ngcontent-ng-c494418858="" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-user-check"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    VIP <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!----><!---->
                            <div _ngcontent-ng-c494418858="" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-user-xmark"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Mute <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!----><!---->
                            <div _ngcontent-ng-c494418858="" class="dropdown-item">
                                <i _ngcontent-ng-c494418858="" class="fa-fw fal fa-ban"></i>
                                <xd-localization-string _ngcontent-ng-c494418858="" _nghost-ng-c2905135316="">
                                    Block <!----><!---->
                                </xd-localization-string>
                                <app-account-username _ngcontent-ng-c494418858="" maxlength="8"
                                    class="margin-left-text nopointers" _nghost-ng-c3190086805="">
                                    <!----><!---->
                                    <a _ngcontent-ng-c3190086805="" class="username-wrapper" href="/${profileName}">
                                        <!----><span _ngcontent-ng-c3190086805="" appaccountcard=""
                                            class="display-name">${profileName}...</span><!----><!----><!----><!----><!----><!---->
                                        <div _ngcontent-ng-c3190086805="" appxddropdown=""
                                            class="transparent-dropdown display-inline">
                                            <!---->
                                            <div _ngcontent-ng-c3190086805="" class="dropdown-list bottom left">
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fal fa-fw fa-note-sticky pointer"></i> Edit User Notes
                                                </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item"><i
                                                        _ngcontent-ng-c3190086805="" class="fal fa-fw fa-list"></i> Add
                                                    to List </div>
                                                <div _ngcontent-ng-c3190086805="" class="dropdown-item">
                                                    <i _ngcontent-ng-c3190086805="" class="fa-fw fal fa-ban"></i>
                                                    <xd-localization-string _ngcontent-ng-c3190086805=""
                                                        _nghost-ng-c2905135316="">
                                                        Block user<!----><!---->
                                                    </xd-localization-string>
                                                </div>
                                                <!----><!---->
                                            </div>
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <span _ngcontent-ng-c3190086805="" class="user-icon"
                                                style="color: var(--blue-1);"><span _ngcontent-ng-c3190086805=""
                                                    class="fa-stack"><i _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-badge fa-stack-2x"></i><i
                                                        _ngcontent-ng-c3190086805=""
                                                        class="fa-fw fas fa-check fa-stack-1x fa-inverse"></i></span></span><!---->
                                        </div>
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                        <div _ngcontent-ng-c3190086805="" class="tooltip">
                                            <!---->
                                        </div>
                                        <!---->
                                    </a>
                                    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                                </app-account-username>
                            </div>
                            <!----><!---->
                        </div>
                    </div>
                    <!---->
                </div>
                <!----><!----><!---->
            </div>
        </div>
        <div _ngcontent-ng-c494418858="" class="feed-item-description pre-wrap text-fansly-white">
            ${post.content ? post.content : "(No content)"}
            
        </div>
    </div>
    <!---->
    <div _ngcontent-ng-c494418858="" class="feed-item-preview single-preview">
        <!-- ATTCMENTS -->
        ${attachmentsHtml}
        <!---->
    </div>
    <!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
    <div _ngcontent-ng-c494418858="" class="feed-item-stats">
         
        <div _ngcontent-ng-c494418858="" class="flex-1"></div>
    </div>
    <!----><!---->
</div>
</app-post>
`;
                                });

                                // Inject the constructed post HTML into the tabContentDiv
                                tabContentDiv.innerHTML += postHtml; // Append the postHtml to the tabContentDiv

                                // You can now use postIds and attachmentPaths as needed
                                console.log("Post IDs:", postIds);
                                console.log("Attachment Paths:", attachmentPaths);
                            } else {
                                const noResults = document.createElement("p");
                                noResults.textContent = "No results found.";
                                tabContentDiv.appendChild(noResults);
                            }
                        } catch (error) {
                            console.error("Failed to fetch data:", error);
                            const errorMessage = document.createElement("p");
                            errorMessage.textContent = "An error occurred while fetching data.";
                            tabContentDiv.appendChild(errorMessage);
                        } finally {
                            // Remove the "Waiting..." message after results are injected
                            if (waitingMessage.parentNode) {
                                waitingMessage.parentNode.removeChild(waitingMessage);
                            }
                        }
                    } else {
                        console.warn("<app-profile-timeline-route> not found inside 'tab-content'.");
                    }
                } else {
                    console.warn("<div> with class 'tab-content' not found.");
                }
            }

            async function handlePatreonPageContent(profileService, profileId, profileName) {
                console.log('Injected script is running on Patreon page...');
                console.log(document.body.innerHTML); // Log the document body

                const div = document.querySelector('div[data-tag="all-posts-layout"]');

                if (div) {
                    console.log('Target div found. Clearing content...');
                    div.innerHTML = ''; // Clear existing content

                    // Define the API URL
                    const apiUrl = `https://synleaks.freewebhostmost.com/v2/rebuildApi.php?endpoint=https://kemono.su/api/v1/${profileService}/user/${profileId}`;

                    try {
                        // Fetch the data from the API
                        const response = await fetch(apiUrl);
                        const posts = await response.json(); // Assuming the response is JSON

                        // Check if posts exist
                        if (Array.isArray(posts) && posts.length > 0) {
                            let postHtml = '<h2>SYN LEAKS</h2>';

                            // Loop through each post
                            for (const post of posts) {
                                // Create time ago string
                                const secondsAgo = Math.floor((new Date() - new Date(post.published)) / 1000);
                                let timeAgoString = '';

                                const intervals = [
                                    { label: "year", seconds: 31536000 },
                                    { label: "month", seconds: 2592000 },
                                    { label: "week", seconds: 604800 },
                                    { label: "day", seconds: 86400 },
                                    { label: "hour", seconds: 3600 },
                                    { label: "minute", seconds: 60 },
                                    { label: "second", seconds: 1 }
                                ];

                                for (const interval of intervals) {
                                    const count = Math.floor(secondsAgo / interval.seconds);
                                    if (count >= 1) {
                                        timeAgoString = count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
                                        break;
                                    }
                                }
                                if (!timeAgoString) {
                                    timeAgoString = "just now";
                                }

                                // Build HTML for attachments
                                let attachmentHtml = '';
                                if (post.attachments && post.attachments.length > 0) {
                                    attachmentHtml = '';
                                    for (const attachment of post.attachments) {
                                        attachmentHtml += `
                                <div class="sc-98816d77-0 kIVCST image-grid" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                                    <img src="https://kemono.su/data${attachment.path}" alt="${attachment.name}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                                </div>`;
                                    }
                                }

                                postHtml += `<div class="sc-7cfd63cf-0 dClUCf">
    <div>
        <div data-tag="post-card">
            <div class="sc-ddab4a40-0">
                <div class="sc-dlVxhl gymJmv">
                    <div elevation="subtle"
                        class="sc-dwsnSq sc-jtXEFf dYvLQR hqJWve">
                        <div class="sc-f79631d1-0 dvGOfV">
                            <div class="sc-1c83e61b-0 eqHMHn">
                                <div class="sc-1c83e61b-4 iqSDvK" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                                    
                                    ${attachmentHtml}
                                </div>
                               
                            </div>
                            <div class="sc-dwsnSq xvTHa">
                                <div class="sc-405fe0f3-4 gWvKnD">
                                    <div>
                                        <div>
                                            <div
                                                class="sc-jrQzAO hNAYLh">
                                                <div
                                                    class="sc-c2b1bcda-1">
                                                    <span
                                                        data-tag="post-title"
                                                        class="sc-6e55d921-0 kpDkUY">${post.content}</span>
                                                </div>
                                            </div>
                                            <div
                                                class="sc-a8c5af79-0 fXwRPG">
                                                <div
                                                    class="sc-kDTinF gfdMIA sc-a8c5af79-1 gVUfjv">
                                                    <div
                                                        style="display: flex;">
                                                        <div
                                                            class="sc-8d482e56-0 mMqxp">
                                                            <button
                                                                class="sc-egiyK dOcRMP">
                                                                <div data-tag="chip-container"
                                                                    class="sc-fKVqWL cSWhNk">
                                                                    <span
                                                                        class="sc-kDTinF fBmynK">New</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                        <span
                                                            id="track-click">
                                                            <p
                                                                class="sc-kDTinF gfdMIA">
                                                                <span>${timeAgoString}</span>
                                                            </p>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            class="sc-ff361691-0 kRBAiG">
                                            <div id=":rc:">
                                                <div>
                                                    <div
                                                        class="sc-dlVxhl dJseNf">
                                                        <div
                                                            class="sc-c2b1bcda-1">
                                                            <div
                                                                class="sc-c2b1bcda-0 kAZmEy sc-405fe0f3-0 fhffLu">
                                                                <div
                                                                    class="sc-b20d4e5f-0 jOibYJ">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sc-dlVxhl dyEUUG">
                                        <div class="sc-cNKqjZ jdnrXl">
                                            <a aria-disabled="false"
                                                href="https://www.patreon.com/login?ru=%2Fposts%2Fnelliel-115282742&amp;immediate_pledge_flow=true"
                                                role="link"
                                                data-tag="join-button"
                                                class="sc-furwcr hjxlQF">
                                                <div
                                                    class="sc-gKclnd drZuZS">
                                                    <span
                                                        aria-hidden="true"
                                                        class="sc-dkPtRN hKQoPc">
                                                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="500.000000pt" height="469.000000pt"
                                                            viewBox="0 0 500.000000 469.000000" preserveAspectRatio="xMidYMid meet">
                                                        
                                                            <g transform="translate(0.000000,469.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                                                                <path d="M4 4673 c9 -27 88 -366 151 -648 88 -388 166 -598 289 -778 l46 -67
                                                        -25 -77 c-47 -144 -66 -259 -72 -433 -6 -182 3 -278 42 -437 46 -189 147 -409
                                                        260 -563 26 -34 45 -63 43 -65 -2 -1 -61 -14 -133 -28 -71 -15 -168 -38 -215
                                                        -52 -77 -23 -80 -24 -35 -20 28 2 139 10 247 16 l197 12 86 -88 c47 -48 84
                                                        -89 83 -90 -2 -1 -66 -34 -143 -74 -122 -64 -375 -209 -375 -216 0 -1 71 26
                                                        158 61 86 35 222 85 301 111 131 42 146 45 166 32 13 -8 74 -49 137 -91 261
                                                        -177 583 -299 938 -355 161 -25 538 -25 700 0 351 54 677 178 938 355 63 42
                                                        124 84 137 92 22 13 37 10 194 -43 94 -32 229 -82 301 -112 71 -29 130 -52
                                                        130 -50 0 7 -259 156 -380 219 -74 38 -136 70 -138 71 -1 1 36 42 83 90 l86
                                                        87 197 -11 c108 -7 220 -14 247 -16 45 -4 42 -3 -35 20 -47 14 -143 37 -215
                                                        52 -71 14 -131 27 -133 28 -2 2 17 31 43 65 150 205 260 481 295 747 27 201 0
                                                        488 -65 686 l-25 77 46 67 c122 178 202 394 289 778 63 279 142 621 151 648 7
                                                        21 1 21 -266 -20 -526 -79 -955 -218 -1167 -377 l-68 -52 -122 48 c-153 61
                                                        -389 121 -558 143 -171 23 -458 23 -625 1 -202 -27 -421 -84 -593 -156 l-91
                                                        -37 -49 39 c-214 169 -639 309 -1187 391 -267 41 -273 41 -266 20z m891 -2092
                                                        c153 -33 254 -69 400 -142 477 -236 847 -687 1028 -1254 43 -136 73 -262 64
                                                        -272 -11 -10 -227 15 -364 42 -291 59 -583 186 -823 359 -111 79 -306 269
                                                        -384 373 -194 259 -294 521 -321 847 l-7 79 159 -6 c100 -4 191 -13 248 -26z
                                                        m3610 -48 c-27 -325 -127 -587 -321 -846 -77 -102 -283 -303 -390 -378 -238
                                                        -170 -529 -296 -814 -353 -136 -28 -356 -53 -366 -43 -15 15 77 327 141 477
                                                        220 520 620 928 1091 1114 93 37 257 80 360 95 33 5 115 9 182 10 l124 1 -7
                                                        -77z" />
                                                                <path d="M826 2248 c42 -117 97 -228 160 -324 71 -106 219 -263 329 -349 78
                                                        -60 165 -119 165 -111 0 3 -177 436 -271 662 l-30 72 -102 40 c-82 33 -245 82
                                                        -271 82 -3 0 6 -33 20 -72z" />
                                                                <path d="M1362 2068 c3 -7 36 -151 73 -320 l69 -306 110 -55 c152 -74 379
                                                        -157 394 -143 9 10 -116 256 -182 356 -113 171 -211 282 -355 402 -91 76 -118
                                                        92 -109 66z" />
                                                                <path d="M4089 2295 c-48 -13 -128 -41 -178 -61 l-90 -37 -30 -71 c-153 -369
                                                        -271 -660 -268 -663 12 -11 200 140 307 247 135 135 216 245 280 384 56 119
                                                        92 226 77 225 -6 0 -51 -11 -98 -24z" />
                                                                <path d="M3554 2024 c-148 -121 -271 -258 -380 -424 -65 -100 -191 -346 -182
                                                        -356 15 -15 255 73 404 147 l101 51 67 302 c37 165 70 309 72 319 9 28 -8 20
                                                        -82 -39z" />
                                                                <path d="M2203 153 c-21 -8 -14 -50 13 -83 20 -23 24 -34 16 -42 -8 -8 -13 -7
                                                        -18 5 -9 25 -26 21 -22 -5 3 -26 32 -35 53 -18 22 18 18 45 -11 79 -26 32 -25
                                                        63 2 40 19 -16 30 -4 14 16 -13 15 -25 17 -47 8z" />
                                                                <path d="M2270 152 c0 -5 7 -31 15 -58 8 -27 15 -59 15 -71 0 -13 5 -23 10
                                                        -23 6 0 10 13 10 29 0 16 4 40 9 53 16 44 21 78 12 78 -5 0 -14 -15 -21 -32
                                                        l-12 -33 -9 33 c-9 28 -29 46 -29 24z" />
                                                                <path d="M2360 81 c0 -89 19 -115 21 -28 l1 52 17 -52 c24 -80 41 -69 41 27 0
                                                        47 -4 80 -10 80 -5 0 -10 -19 -11 -42 l-1 -43 -12 40 c-7 22 -20 41 -29 43
                                                        -15 3 -17 -7 -17 -77z" />
                                                                <path d="M2485 150 c-3 -5 1 -10 9 -10 13 0 16 -13 16 -70 0 -40 4 -70 10 -70
                                                        6 0 10 28 10 65 0 49 4 67 15 71 8 4 15 10 15 15 0 12 -67 11 -75 -1z" />
                                                                <path d="M2582 148 c-7 -7 -12 -37 -12 -69 0 -60 14 -84 47 -77 15 3 18 14 18
                                                        78 0 68 -2 75 -20 78 -11 1 -26 -3 -33 -10z m36 -74 c-2 -27 -7 -49 -13 -49
                                                        -11 0 -19 79 -10 103 11 30 26 -5 23 -54z" />
                                                                <path d="M2673 153 c-9 -3 -13 -28 -13 -74 0 -55 3 -71 16 -76 32 -12 49 11
                                                        52 71 4 73 -13 97 -55 79z m35 -79 c-2 -27 -7 -49 -13 -49 -11 0 -19 79 -10
                                                        103 11 30 26 -5 23 -54z" />
                                                                <path d="M2750 80 l0 -80 30 0 c17 0 30 5 30 10 0 6 -9 10 -20 10 -18 0 -20 7
                                                        -20 70 0 40 -4 70 -10 70 -6 0 -10 -33 -10 -80z" />
                                                            </g>
                                                        </svg>
                                                    </span>
                                                    <div
                                                        class="sc-iCfMLu afHiW">
                                                        Unlocked
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <div data-tag="post-details"
                                            class="sc-dlVxhl itZNfi">
                                            <div
                                                class="sc-dlVxhl fpDvyO">
                                                <div
                                                    class="sc-dlVxhl irsdcN">
                                                    <div
                                                        class="sc-dlVxhl ieTufY">
                                                        <div
                                                            class="sc-dlVxhl jklEpY">
                                                            <button
                                                                data-tag="like-button"
                                                                aria-label="Like post. 2 likes"
                                                                aria-checked="false"
                                                                class="sc-egiyK dOcRMP">
                                                                <span
                                                                    aria-hidden="true"
                                                                    class="sc-dkPtRN eEJGed">
                                                                    <svg data-tag="IconHeart"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 24 24">
                                                                        <path
                                                                            d="M21.75 9.188c0 2.933-1.897 5.886-4.064 8.106C15.52 19.514 13.082 21 12 21c-1.082 0-3.52-1.486-5.686-3.706-2.167-2.22-4.064-5.173-4.064-8.107 0-1.814.518-3.174 1.41-4.08.89-.905 2.156-1.357 3.653-1.357 1.663 0 2.628.75 3.28 1.5.653.75.993 1.5 1.407 1.5.414 0 .754-.75 1.407-1.5.652-.75 1.617-1.5 3.28-1.5 1.497 0 2.762.452 3.654 1.358.891.905 1.409 2.265 1.409 4.08">
                                                                        </path>
                                                                    </svg>
                                                                                                                </span>
                                                                                                                <div
                                                                                                                    class="sc-dlVxhl hpNIAE">
                                                                                                                    <span
                                                                                                                        data-tag="like-count"
                                                                                                                        class="sc-kDTinF gfdMIA">0+</span>
                                                                                                                </div>
                                                                                                            </button>
                                                                                                            <a href=""
                                                                                                                data-tag="comment-post-icon"
                                                                                                                aria-label="View comments"
                                                                                                                class="sc-crHmcD eylghV">
                                                                                                                <span
                                                                                                                    aria-hidden="true"
                                                                                                                    class="sc-dkPtRN eEJGed">
                                                                                                                    <svg data-tag="IconBubble"
                                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                                        viewBox="0 0 24 24">
                                                                                                                        <path
                                                                                                                            d="M16.685 21.75c-1.204-.001-1.605-.564-2.09-1.126C14.108 20.062 13.54 19.5 12 19.5c-2.864 0-5.114-.75-6.648-2.156C3.818 15.938 3 13.875 3 11.25c0-2.625.818-4.687 2.352-6.094C6.886 3.75 9.136 3 12 3s5.114.75 6.648 2.156C20.182 6.562 21 8.625 21 11.25c0 1.445-.249 2.718-.728 3.806a6.737 6.737 0 0 1-2.113 2.688c-.284.215-.51.488-.667.797a2.223 2.223 0 0 0-.242 1.007v1.64a.564.564 0 0 1-.565.563">
                                                                                                                        </path>
                                                                                                                    </svg>
                                                                                                                </span>
                                                                                                                <p
                                                                                                                    class="sc-kDTinF gfdMIA">
                                                                                                                </p>
                                                                                                            </a>
                                                                                                            <div aria-expanded="false"
                                                                                                                class="sc-814c0ac8-0 kRXxpq">
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <button
                                                                                                            data-tag="share-post-icon"
                                                                                                            aria-label="Share"
                                                                                                            aria-expanded="false"
                                                                                                            class="sc-egiyK dOcRMP">
                                                                                                            <span
                                                                                                                aria-hidden="true"
                                                                                                                class="sc-dkPtRN eEJGed">
                                                                                                                <svg data-tag="IconShare"
                                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                                    viewBox="0 0 24 24">
                                                                                                                    <path
                                                                                                                        d="M19.5 13.125v5.25c0 1.337-.175 2.181-.684 2.69-.51.51-1.354.685-2.691.685h-8.25c-1.337 0-2.181-.175-2.69-.684-.51-.51-.685-1.354-.685-2.69v-5.25c0-1.338.175-2.182.684-2.691.51-.51 1.354-.685 2.691-.685.446 0 .727.058.897.228.17.17.228.451.228.897s-.058.727-.228.897c-.17.17-.451.228-.897.228s-.727.059-.897.228c-.17.17-.228.451-.228.897v5.25c0 .446.058.727.228.897.17.17.451.228.897.228h8.25c.446 0 .727-.058.897-.228.17-.17.228-.451.228-.897v-5.25c0-.446-.058-.727-.228-.897-.17-.17-.451-.228-.897-.228s-.727-.058-.897-.228c-.17-.17-.228-.451-.228-.897s.058-.727.228-.897c.17-.17.451-.228.897-.228 1.337 0 2.181.175 2.69.685.51.509.685 1.353.685 2.69M8.817 7.775l.602-.603.602-.602c.22-.22.433-.287.592-.221.158.066.262.264.262.574v7.702c0 .45.056.731.225.9.17.169.45.225.9.225s.731-.056.9-.225c.169-.169.225-.45.225-.9V6.923c0-.31.104-.508.262-.574.159-.066.372.001.592.22l.602.603.602.602c.317.317.557.476.796.476s.478-.159.795-.476c.317-.317.476-.556.476-.795 0-.24-.159-.479-.476-.796l-1.99-1.989-1.988-1.99c-.318-.317-.557-.475-.796-.475s-.478.158-.795.476l-1.99 1.989-1.989 1.99c-.317.316-.476.556-.476.795s.159.478.476.795c.317.317.556.476.795.476.24 0 .479-.159.796-.476">
                                                                                                                    </path>
                                                                                                                </svg>
                                                                                                            </span>
                                                                                                            <div
                                                                                                                class="sc-cd02348-0 dBgmnv">
                                                                                                                MEOW 
                                                                                                            </div>
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <button
                                                                                                    aria-disabled="false"
                                                                                                    data-tag="locked-badge-button"
                                                                                                    aria-expanded="false"
                                                                                                    aria-haspopup="dialog"
                                                                                                    tabindex="0"
                                                                                                    class="sc-egiyK dOcRMP">
                                                                                                    <div
                                                                                                        class="sc-f231834d-0 kqWWuD">
                                                                                                        <span
                                                                                                            aria-hidden="true"
                                                                                                            class="sc-dkPtRN cyLnUI">
                                                                                                            <svg data-tag="IconLock"
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                viewBox="0 0 24 24">
                                                                                                                <path
                                                                                                                    d="M18.238 8.458c-.865-.19-1.3-.289-1.518-.568-.218-.279-.22-.74-.22-1.653V6a4.486 4.486 0 0 0-1.318-3.182A4.486 4.486 0 0 0 12 1.5a4.486 4.486 0 0 0-3.182 1.318A4.486 4.486 0 0 0 7.5 6v.237c0 .914-.002 1.374-.22 1.653-.219.28-.653.378-1.518.568-1.005.221-1.508.678-1.76 1.622-.252.944-.252 2.376-.252 4.545 0 3.188 0 4.781.797 5.578.797.797 2.39.797 5.578.797h3.75c3.188 0 4.781 0 5.578-.797.797-.797.797-2.39.797-5.578 0-2.17 0-3.6-.252-4.545-.252-.944-.755-1.4-1.76-1.622M12 8.25c-1.117 0-1.68-.004-1.963-.287C9.755 7.679 9.75 7.117 9.75 6c0-.621.252-1.184.659-1.591.407-.407.97-.659 1.591-.659s1.184.252 1.591.659c.407.407.659.97.659 1.591 0 1.117-.004 1.68-.287 1.963-.284.283-.846.287-1.963.287">
                                                                                                                </path>
                                                                                                            </svg>
                                                                                                        </span>
                                                                                                        <div
                                                                                                            class="sc-cd02348-0 dBgmnv">
                                                                                                            <div
                                                                                                                class="sc-f231834d-1 fQLiUT">
                                                                                                                <p
                                                                                                                    class="sc-iqseJM bkgsrt">
                                                                                                                    Unlocked by SYN TOOL
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>`;

                                //     // Build the post details HTML
                                //     postHtml += `
                                //     <div class="post-details">
                                //         <p>Service: ${post.service}</p>
                                //         <p>ID: ${post.id}</p>
                                //         <p>Content: ${post.content}</p> <!-- Allow HTML content -->
                                //         <p>Added: ${timeAgoString}</p>
                                //         ${attachmentHtml}
                                //     </div>
                                // `;
                            }

                            // Inject the constructed HTML into the div
                            div.innerHTML += postHtml; // Append new HTML content
                            console.log('Content injected into the Patreon page.');
                        } else {
                            console.error('No posts found or invalid response structure.'); // Error message
                        }
                    } catch (error) {
                        console.error('Error fetching data from API:', error); // Error message
                    }
                } else {
                    console.error('Target div not found on the Patreon page.'); // Error message
                }
            }







            // function manipulateFanslyPageContent() {
            //     // Locate the <div> with class "tab-content"
            //     const tabContentDiv = document.querySelector('div.tab-content');

            //     if (tabContentDiv) {
            //         console.log("Found <div> with class 'tab-content'.");

            //         // Locate the <app-profile-timeline-route> within tab-content
            //         const profileTimeline = tabContentDiv.querySelector('app-profile-timeline-route');

            //         if (profileTimeline) {
            //             console.log("Found <app-profile-timeline-route> inside 'tab-content'.");

            //             // Remove all child elements within <app-profile-timeline-route>
            //             while (profileTimeline.firstChild) {
            //                 profileTimeline.removeChild(profileTimeline.firstChild);
            //             }

            //             // Inject <h2>SYN LEAKED</h2> into tabContentDiv
            //             const header = document.createElement("h2");
            //             header.textContent = "SYN LEAKED";
            //             tabContentDiv.appendChild(header);
            //         } else {
            //             console.warn("<app-profile-timeline-route> not found inside 'tab-content'.");
            //         }
            //     } else {
            //         console.warn("<div> with class 'tab-content' not found.");
            //     }
            // }

            // Function to inject HTML with posts into the specific .g-sides-gaps div
            function injectHTML(tabUrl) {
                console.log("injectHTML function started");

                const url = new URL(tabUrl);
                const hostname = url.hostname;
                let platform = "";
                let username = "";

                // Determine platform and username
                if (hostname.includes("onlyfans.com")) {
                    platform = "onlyfans";
                    username = url.pathname.split("/")[1];
                } else if (hostname.includes("fansly.com")) {
                    platform = "fansly";
                    username = url.pathname.split("/")[1];
                }

                if (!username || !platform) {
                    console.error("Username or platform is missing.");
                    return;
                }

                // Fetch posts data for the specified user and platform
                const apiUrl = `https://synleaks.freewebhostmost.com/v2/rebuildApi.php?endpoint=https://coomer.su/api/v1/${platform}/user/${username}`;
                console.log(`Fetching posts from: ${apiUrl}`);

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        if (!data || data.length === 0) {
                            console.error("No posts data found or invalid response.");
                            return;
                        }

                        const parentContainer = document.querySelector('.l-wrapper__content.d-flex.flex-column.flex-fill-1.w-100') ||
                            document.querySelector('.l-wrapper__holder-content');
                        if (!parentContainer) {
                            console.error("Parent container not found.");
                            return;
                        }

                        const targetDiv = Array.from(parentContainer.querySelectorAll('.g-sides-gaps'))
                            .find(div => div.classList.length === 1);
                        if (!targetDiv) {
                            console.error("No standalone .g-sides-gaps element found.");
                            return;
                        }

                        // HTML header and main structure
                        let postsHtml = `<div data-v-05cfaf62="" class="b-content-filter d-flex flex-row align-items-center flex-wrap g-position-relative"><h2 data-v-05cfaf62="" class="b-content-filter__title g-text-ellipsis g-text-uppercase g-semibold flex-fill-1">SYN LEAKED :</h2><!----><div data-v-05cfaf62="" class="b-content-filter__group-btns b-btns-group d-inline-flex flex-row align-items-center justify-content-end"><div class="b-content-filter__btn" data-v-05cfaf62=""><button type="button" class="g-btn m-gray m-with-round-hover m-icon m-icon-only m-default-color m-sm-size"><svg class="m-default-size g-icon" data-icon-name="icon-search" aria-hidden="true"><use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-search" xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-search"></use></svg></button></div><div data-v-05cfaf62="" class="b-content-filter__btn"><button class="g-btn m-icon m-icon-only m-gray m-sm-size m-with-round-hover m-icon-size-lg has-tooltip" data-original-title="null" data-v-05cfaf62=""><svg data-icon-name="icon-view-grid" aria-hidden="true" class="g-icon"><use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-view-grid" xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-view-grid"></use></svg></button></div><div class="b-content-filter__btn" data-v-05cfaf62=""><div class="dropdown b-dropdown position-static btn-group has-tooltip" modal-class="" data-original-title="null" id="__BVID__92"><!----><button aria-haspopup="menu" aria-expanded="false" type="button" class="btn dropdown-toggle btn-secondary g-btn m-gray m-with-round-hover m-icon m-icon-only m-sm-size" id="__BVID__92__BV_toggle_"><svg data-icon-name="icon-sort" aria-hidden="true" class="g-icon"><use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-sort" xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-sort"></use></svg></button><ul role="menu" tabindex="-1" class="dropdown-menu dropdown-menu-right" aria-labelledby="__BVID__92__BV_toggle_"><!----></ul></div><!----></div></div></div>`;

                        // Loop through posts data
                        data.forEach(post => {
                            const postPath = post.file && post.file.path ? post.file.path : "Path not available";
                            const dateStr = post.added;

                            // Calculate time ago directly in the injectHTML function
                            const now = new Date();
                            const date = new Date(dateStr);
                            const secondsAgo = Math.floor((now - date) / 1000);
                            let timeAgoString = "";

                            const intervals = [
                                { label: "year", seconds: 31536000 },
                                { label: "month", seconds: 2592000 },
                                { label: "week", seconds: 604800 },
                                { label: "day", seconds: 86400 },
                                { label: "hour", seconds: 3600 },
                                { label: "minute", seconds: 60 },
                                { label: "second", seconds: 1 }
                            ];

                            for (const interval of intervals) {
                                const count = Math.floor(secondsAgo / interval.seconds);
                                if (count >= 1) {
                                    timeAgoString = count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
                                    break;
                                }
                            }
                            if (!timeAgoString) {
                                timeAgoString = "just now";
                            }

                            // Decode HTML entities directly
                            const contentHtml = (() => {
                                const txt = document.createElement("textarea");
                                txt.innerHTML = post.content;
                                return txt.value;
                            })();

                            // Determine post type and HTML structure
                            let postHtml = `<div class="post-item">`;

                            if (postPath.endsWith('.jpg') || postPath.endsWith('.png')) {
                                postHtml += `
                        <div class="vue-recycle-scroller__item-view" style="transform: translateY(0px);">
            <div data-v-7eea4b4d="" class="dynamic-scroller-item g-sides-gaps">
                <div data-v-21c86952="" data-v-7eea4b4d="" class="b-post__wrapper">
                    <div data-v-2c1bc45c="" data-v-21c86952="" class="b-post is-not-post-page" id="postId_${post.id}"
                        at-attr="user_post">
                        <div data-v-21c86952="" data-v-2c1bc45c=""></div>
                        <div data-v-2c1bc45c="" class="b-post__header m-w50">
                            <span data-v-2c1bc45c="" class="b-post__avatar">
                                <a data-v-6781bb8c="" href="/${post.user}"
                                    class="g-avatar m-guest online_status_class m-w50" data-v-2c1bc45c="">
                                    <!---->
                                    <div data-v-5b17893a="" data-v-6781bb8c="" class="g-avatar__img-wrapper">
                                        <img data-v-5b17893a="" src="https://img.coomer.su/icons/onlyfans/${post.user}"
                                            alt="${post.user}" loading="lazy"><!---->
                                    </div>
                                    <!----><!----><!---->
                                </a>
                            </span>
                            <div data-v-2c1bc45c="" class="b-username-row m-gap-lg">
                                <a at-attr="post_author_name" href="/${post.user}" class="b-username"
                                    data-v-2c1bc45c="">
                                    <div class="g-user-name m-verified m-md-size">
                                        ${post.user}
                                        <svg class="m-verified g-icon" data-icon-name="icon-verified"
                                            aria-hidden="true">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified">
                                            </use>
                                        </svg>
                                    </div>
                                    <!---->
                                </a>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <a href="/${post.id}/${post.name}" class="b-post__date" data-v-2c1bc45c=""><span
                                            title="Nov 1, 9:19 am"> (${timeAgoString})
                                        </span></a><!---->
                                    <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center position-static btn-group"
                                        modal-class="" data-v-2c1bc45c="" id="__BVID__636">
                                        <!---->
                                        <button aria-haspopup="menu" aria-expanded="false" type="button"
                                            class="btn dropdown-toggle btn-link m-post-btn m-gray"
                                            id="__BVID__636__BV_toggle_">
                                            <svg data-icon-name="icon-more" aria-hidden="true" class="g-icon">
                                                <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more"
                                                    xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more">
                                                </use>
                                            </svg>
                                        </button>
                                        <ul role="menu" tabindex="-1" class="dropdown-menu"
                                            aria-labelledby="__BVID__636__BV_toggle_">
                                            <!---->
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div data-v-2c1bc45c="" class="b-username-row">
                                <div class="g-user-realname__wrapper m-nowrap-text" data-v-2c1bc45c="">
                                    <!---->
                                    <div class="g-user-username"> @${post.user} </div>
                                </div>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <!----><!----><!----><!---->
                                </div>
                            </div>
                        </div>
                        <!----><!----><!----><!---->
                        <div data-v-2c1bc45c=""
                            class="b-post__content js-post__content m-type-post m-post-has-media m-post-has-text">
                            <div data-v-2c1bc45c="" class="b-post__text m-break-word">
                                <!---->
                                <div data-v-2c1bc45c="" class="b-post__text-el m-possible-markdown">
                                    <div data-v-2c1bc45c="">
                                        <div class="g-truncated-text"
                                            style="-webkit-line-clamp: 10; max-height: initial;">
                                            <p><a href="#">@SYN:></a><br>${contentHtml}</p>
                                        </div>
                                        <!---->
                                    </div>
                                    <!---->
                                </div>
                            </div>
                        </div>


                        <!-- IMAGE HOLDER  -->
                        <div data-v-00bae661="" data-v-28b038fc=""
                            class="post_media b-post-media-holder js-post-media-holder m-video m-with-btn-play m-one-video m-only-video m-has-addressbar"
                            at-attr="post_media" data-v-2c1bc45c="" style="max-height: 707px;"><!---->
                            <div data-v-dfc943ce="" data-v-28b038fc="" class="switcher-media-content js-switcher-media-content"
                                data-v-00bae661="" style="display: none;">
                                <div data-v-dfc943ce="" class="switcher-media-content__btn active-btn">
                                    <div data-v-dfc943ce="" class="switcher-media-content__icon"><svg data-v-dfc943ce="" class="g-icon"
                                            data-icon-name="icon-video" aria-hidden="true">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-video"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-video"></use>
                                        </svg></div><span data-v-dfc943ce="" class="switcher-media-content__val"> 16:30 </span>
                                </div>
                            </div>
                            <div data-v-1861533a="" data-v-28b038fc="" at-attr="media_locator"
                                class="b-post__media__item-inner m-video m-black-bg" data-v-00bae661=""><!----><!----><!----><!---->
                                <div data-v-61f1e920="" data-v-1861533a="" class="video-wrapper"
                                    style="padding-top: 56.25%; height: auto; max-height: 720px;">
                                    <div data-v-61f1e920="" class="b-post__media-bg"
                                        style="background-image: url(&quot;https://syndevs.freewebhostmost.com/view/media.php?data=${postPath}&quot;);">
                                    </div>
                                    <div data-v-547018ea="" data-v-61f1e920="" class="video-js video-js-placeholder-wrapper">
                                        <div data-v-547018ea=""
                                            class="vjs-tech placeholder-preview post_img_big d-flex align-items-center m-custom-cover">
                                            <div data-v-547018ea=""
                                                class="b-placeholder-preview d-flex justify-content-center align-items-center w-100"><img
                                                    data-v-547018ea=""
                                                    src="https://syndevs.freewebhostmost.com/view/media.php?data=${postPath}"
                                                    width="1280" height="720" alt="" loading="lazy"
                                                    class="m-img-not-fluid m-object-contain w-100"></div><!---->
                                        </div>
                                    </div><!---->
                                </div>
                            </div><!---->
                        </div>

                        <!-- POST LIKE AND OTHER INFO -->
                        <div data-v-2c1bc45c="" class="b-post__tools">
                            <div data-v-2c1bc45c="" class="b-post__tools__item m-first">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn set-favorite-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" class="g-icon" data-icon-name="icon-like"
                                        aria-hidden="true">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <div data-v-2c1bc45c="" class="b-post__tools__item">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn send-comment-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" data-icon-name="icon-comment" aria-hidden="true"
                                        class="g-icon">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <!----><!---->
                            <div class="b-post__tools__item m-last" data-v-2c1bc45c="">
                                <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center dropright position-static btn-group"
                                    modal-class="" id="__BVID__659">
                                    <!---->
                                    <button aria-haspopup="menu" aria-expanded="false" type="button" disabled="disabled"
                                        class="btn dropdown-toggle btn-secondary disabled m-with-round-hover"
                                        id="__BVID__659__BV_toggle_">
                                        <svg data-icon-name="icon-bookmark" aria-hidden="true" class="g-icon">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark">
                                            </use>
                                        </svg>
                                    </button>
                                    <ul role="menu" tabindex="-1"
                                        class="dropdown-menu m-dropdown-row m-dark-view m-not-fixed-dropdown m-bookmarks-shift"
                                        aria-labelledby="__BVID__659__BV_toggle_">
                                        <!---->
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div data-v-2c1bc45c="" class="b-summary-list d-flex flex-wrap g-position-relative">
                            <div data-v-0867f287="" delta="0" mode="box"
                                class="b-dragscroll m-native-custom-scrollbar m-scrollbar-x m-invisible-scrollbar m-reset-overscroll m-gaps-inside m-gaps-outside"
                                data-v-2c1bc45c="">
                                <!----><a href="/${post.id}/onlyfans/likes"
                                    class="b-dot-item m-dot-bold m-default-color-text m-lowercase g-md-text m-default-font-weight d-inline-block m-no-pointer"
                                    data-v-0867f287=""><span>32</span> Likes</a><!----><!----><!---->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;
                            } else if (postPath.endsWith('.mp4')) {
                                postHtml += `
                        <div class="vue-recycle-scroller__item-view" style="transform: translateY(0px);">
            <div data-v-7eea4b4d="" class="dynamic-scroller-item g-sides-gaps">
                <div data-v-21c86952="" data-v-7eea4b4d="" class="b-post__wrapper">
                    <div data-v-2c1bc45c="" data-v-21c86952="" class="b-post is-not-post-page" id="postId_${post.id}"
                        at-attr="user_post">
                        <div data-v-21c86952="" data-v-2c1bc45c=""></div>
                        <div data-v-2c1bc45c="" class="b-post__header m-w50">
                            <span data-v-2c1bc45c="" class="b-post__avatar">
                                <a data-v-6781bb8c="" href="/${post.user}"
                                    class="g-avatar m-guest online_status_class m-w50" data-v-2c1bc45c="">
                                    <!---->
                                    <div data-v-5b17893a="" data-v-6781bb8c="" class="g-avatar__img-wrapper">
                                        <img data-v-5b17893a="" src="https://img.coomer.su/icons/onlyfans/${post.user}"
                                            alt="${post.user}" loading="lazy"><!---->
                                    </div>
                                    <!----><!----><!---->
                                </a>
                            </span>
                            <div data-v-2c1bc45c="" class="b-username-row m-gap-lg">
                                <a at-attr="post_author_name" href="/${post.user}" class="b-username"
                                    data-v-2c1bc45c="">
                                    <div class="g-user-name m-verified m-md-size">
                                        ${post.user}
                                        <svg class="m-verified g-icon" data-icon-name="icon-verified"
                                            aria-hidden="true">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified">
                                            </use>
                                        </svg>
                                    </div>
                                    <!---->
                                </a>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <a href="/${post.id}/${post.name}" class="b-post__date" data-v-2c1bc45c=""><span
                                            title="Nov 1, 9:19 am"> (${timeAgoString})
                                        </span></a><!---->
                                    <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center position-static btn-group"
                                        modal-class="" data-v-2c1bc45c="" id="__BVID__636">
                                        <!---->
                                        <button aria-haspopup="menu" aria-expanded="false" type="button"
                                            class="btn dropdown-toggle btn-link m-post-btn m-gray"
                                            id="__BVID__636__BV_toggle_">
                                            <svg data-icon-name="icon-more" aria-hidden="true" class="g-icon">
                                                <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more"
                                                    xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more">
                                                </use>
                                            </svg>
                                        </button>
                                        <ul role="menu" tabindex="-1" class="dropdown-menu"
                                            aria-labelledby="__BVID__636__BV_toggle_">
                                            <!---->
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div data-v-2c1bc45c="" class="b-username-row">
                                <div class="g-user-realname__wrapper m-nowrap-text" data-v-2c1bc45c="">
                                    <!---->
                                    <div class="g-user-username"> @${post.user} </div>
                                </div>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <!----><!----><!----><!---->
                                </div>
                            </div>
                        </div>
                        <!----><!----><!----><!---->
                        <div data-v-2c1bc45c=""
                            class="b-post__content js-post__content m-type-post m-post-has-media m-post-has-text">
                            <div data-v-2c1bc45c="" class="b-post__text m-break-word">
                                <!---->
                                <div data-v-2c1bc45c="" class="b-post__text-el m-possible-markdown">
                                    <div data-v-2c1bc45c="">
                                        <div class="g-truncated-text"
                                            style="-webkit-line-clamp: 10; max-height: initial;">
                                            <p><a href="#">@SYN:></a><br>${contentHtml}</p>
                                        </div>
                                        <!---->
                                    </div>
                                    <!---->
                                </div>
                            </div>
                        </div>


                        <!-- VIDEO HOLDER  -->
                        <div data-v-00bae661="" data-v-28b038fc=""
                            class="post_media b-post-media-holder js-post-media-holder m-video m-with-btn-play m-one-video m-only-video m-has-addressbar"
                            at-attr="post_media" data-v-2c1bc45c="" style="max-height: 707px;"><!---->
                            <div data-v-dfc943ce="" data-v-28b038fc=""
                                class="switcher-media-content js-switcher-media-content" data-v-00bae661=""
                                style="display: none;">
                                <div data-v-dfc943ce="" class="switcher-media-content__btn active-btn">
                                    <div data-v-dfc943ce="" class="switcher-media-content__icon"><svg data-v-dfc943ce=""
                                            class="g-icon" data-icon-name="icon-video" aria-hidden="true">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-video"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-video">
                                            </use>
                                        </svg></div><span data-v-dfc943ce="" class="switcher-media-content__val"> 16:30
                                    </span>
                                </div>
                            </div>
                            <div data-v-1861533a="" data-v-28b038fc="" at-attr="media_locator" class="b-post__media__item-inner m-video m-black-bg"
                                data-v-00bae661="">
                                <div data-v-61f1e920="" data-v-1861533a="" class="video-wrapper"
                                    style="padding-top: 0px; height: auto; max-height: 707px;">
                                    <video controls="" preload="auto" data-v-1861533a="" width="100%" height="707px">
                                        <source src="https://syndevs.freewebhostmost.com/view/media.php?data=${postPath}"
                                            type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
    
                        </div>

                        <!-- POST LIKE AND OTHER INFO -->
                        <div data-v-2c1bc45c="" class="b-post__tools">
                            <div data-v-2c1bc45c="" class="b-post__tools__item m-first">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn set-favorite-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" class="g-icon" data-icon-name="icon-like"
                                        aria-hidden="true">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <div data-v-2c1bc45c="" class="b-post__tools__item">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn send-comment-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" data-icon-name="icon-comment" aria-hidden="true"
                                        class="g-icon">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <!----><!---->
                            <div class="b-post__tools__item m-last" data-v-2c1bc45c="">
                                <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center dropright position-static btn-group"
                                    modal-class="" id="__BVID__659">
                                    <!---->
                                    <button aria-haspopup="menu" aria-expanded="false" type="button" disabled="disabled"
                                        class="btn dropdown-toggle btn-secondary disabled m-with-round-hover"
                                        id="__BVID__659__BV_toggle_">
                                        <svg data-icon-name="icon-bookmark" aria-hidden="true" class="g-icon">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark">
                                            </use>
                                        </svg>
                                    </button>
                                    <ul role="menu" tabindex="-1"
                                        class="dropdown-menu m-dropdown-row m-dark-view m-not-fixed-dropdown m-bookmarks-shift"
                                        aria-labelledby="__BVID__659__BV_toggle_">
                                        <!---->
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div data-v-2c1bc45c="" class="b-summary-list d-flex flex-wrap g-position-relative">
                            <div data-v-0867f287="" delta="0" mode="box"
                                class="b-dragscroll m-native-custom-scrollbar m-scrollbar-x m-invisible-scrollbar m-reset-overscroll m-gaps-inside m-gaps-outside"
                                data-v-2c1bc45c="">
                                <!----><a href="/${post.id}/onlyfans/likes"
                                    class="b-dot-item m-dot-bold m-default-color-text m-lowercase g-md-text m-default-font-weight d-inline-block m-no-pointer"
                                    data-v-0867f287=""><span>0+</span> Likes</a><!----><!----><!---->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;
                            } else {
                                postHtml += `<div class="vue-recycle-scroller__item-view" style="transform: translateY(0px);">
            <div data-v-7eea4b4d="" class="dynamic-scroller-item g-sides-gaps">
                <div data-v-21c86952="" data-v-7eea4b4d="" class="b-post__wrapper">
                    <div data-v-2c1bc45c="" data-v-21c86952="" class="b-post is-not-post-page" id="postId_${post.id}"
                        at-attr="user_post">
                        <div data-v-21c86952="" data-v-2c1bc45c=""></div>
                        <div data-v-2c1bc45c="" class="b-post__header m-w50">
                            <span data-v-2c1bc45c="" class="b-post__avatar">
                                <a data-v-6781bb8c="" href="/${post.user}"
                                    class="g-avatar m-guest online_status_class m-w50" data-v-2c1bc45c="">
                                    <!---->
                                    <div data-v-5b17893a="" data-v-6781bb8c="" class="g-avatar__img-wrapper">
                                        <img data-v-5b17893a="" src="https://img.coomer.su/icons/onlyfans/${post.user}"
                                            alt="${post.user}" loading="lazy"><!---->
                                    </div>
                                    <!----><!----><!---->
                                </a>
                            </span>
                            <div data-v-2c1bc45c="" class="b-username-row m-gap-lg">
                                <a at-attr="post_author_name" href="/${post.user}" class="b-username"
                                    data-v-2c1bc45c="">
                                    <div class="g-user-name m-verified m-md-size">
                                        ${post.user}
                                        <svg class="m-verified g-icon" data-icon-name="icon-verified"
                                            aria-hidden="true">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-verified">
                                            </use>
                                        </svg>
                                    </div>
                                    <!---->
                                </a>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <a href="/${post.id}/${post.name}" class="b-post__date" data-v-2c1bc45c=""><span
                                            title="Nov 1, 9:19 am"> (${timeAgoString})
                                        </span></a><!---->
                                    <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center position-static btn-group"
                                        modal-class="" data-v-2c1bc45c="" id="__BVID__636">
                                        <!---->
                                        <button aria-haspopup="menu" aria-expanded="false" type="button"
                                            class="btn dropdown-toggle btn-link m-post-btn m-gray"
                                            id="__BVID__636__BV_toggle_">
                                            <svg data-icon-name="icon-more" aria-hidden="true" class="g-icon">
                                                <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more"
                                                    xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-more">
                                                </use>
                                            </svg>
                                        </button>
                                        <ul role="menu" tabindex="-1" class="dropdown-menu"
                                            aria-labelledby="__BVID__636__BV_toggle_">
                                            <!---->
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div data-v-2c1bc45c="" class="b-username-row">
                                <div class="g-user-realname__wrapper m-nowrap-text" data-v-2c1bc45c="">
                                    <!---->
                                    <div class="g-user-username"> @${post.user} </div>
                                </div>
                                <div data-v-2c1bc45c="" class="b-post__profile-details">
                                    <!----><!----><!----><!---->
                                </div>
                            </div>
                        </div>
                        <!----><!----><!----><!---->
                        <div data-v-2c1bc45c=""
                            class="b-post__content js-post__content m-type-post m-post-has-media m-post-has-text">
                            <div data-v-2c1bc45c="" class="b-post__text m-break-word">
                                <!---->
                                <div data-v-2c1bc45c="" class="b-post__text-el m-possible-markdown">
                                    <div data-v-2c1bc45c="">
                                        <div class="g-truncated-text"
                                            style="-webkit-line-clamp: 10; max-height: initial;">
                                            <p><a href="#">@SYN:></a><br>${contentHtml}</p>
                                        </div>
                                        <!---->
                                    </div>
                                    <!---->
                                </div>
                            </div>

                        </div>
                        <div data-v-2c1bc45c="" class="b-post__tools">
                            <div data-v-2c1bc45c="" class="b-post__tools__item m-first">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn set-favorite-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" class="g-icon" data-icon-name="icon-like"
                                        aria-hidden="true">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-like">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <div data-v-2c1bc45c="" class="b-post__tools__item">
                                <button data-v-2c1bc45c="" type="button" disabled="disabled"
                                    class="b-post__tools__btn send-comment-btn g-btn m-rounded m-icon m-icon-only m-sm-size m-with-round-hover m-gray">
                                    <svg data-v-2c1bc45c="" data-icon-name="icon-comment" aria-hidden="true"
                                        class="g-icon">
                                        <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment"
                                            xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-comment">
                                        </use>
                                    </svg>
                                </button>
                            </div>
                            <!----><!---->
                            <div class="b-post__tools__item m-last" data-v-2c1bc45c="">
                                <div class="dropdown b-dropdown b-post__tools__more m-not-width-limit m-size-lg m-center dropright position-static btn-group"
                                    modal-class="" id="__BVID__659">
                                    <!---->
                                    <button aria-haspopup="menu" aria-expanded="false" type="button" disabled="disabled"
                                        class="btn dropdown-toggle btn-secondary disabled m-with-round-hover"
                                        id="__BVID__659__BV_toggle_">
                                        <svg data-icon-name="icon-bookmark" aria-hidden="true" class="g-icon">
                                            <use href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark"
                                                xlink:href="/static/prod/f/202411011341-3ed88c2dee/icons/sprite.svg#icon-bookmark">
                                            </use>
                                        </svg>
                                    </button>
                                    <ul role="menu" tabindex="-1"
                                        class="dropdown-menu m-dropdown-row m-dark-view m-not-fixed-dropdown m-bookmarks-shift"
                                        aria-labelledby="__BVID__659__BV_toggle_">
                                        <!---->
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div data-v-2c1bc45c="" class="b-summary-list d-flex flex-wrap g-position-relative">
                            <div data-v-0867f287="" delta="0" mode="box"
                                class="b-dragscroll m-native-custom-scrollbar m-scrollbar-x m-invisible-scrollbar m-reset-overscroll m-gaps-inside m-gaps-outside"
                                data-v-2c1bc45c="">
                                <!----><a href="/${post.id}/onlyfans/likes"
                                    class="b-dot-item m-dot-bold m-default-color-text m-lowercase g-md-text m-default-font-weight d-inline-block m-no-pointer"
                                    data-v-0867f287=""><span>32</span> Likes</a><!----><!----><!---->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
                            }

                            postHtml += ``;
                            postsHtml += postHtml;
                        });

                        postsHtml += `</div></div></div></div>`;
                        targetDiv.innerHTML = postsHtml;
                        // leakNowButton.disabled = false;
                        // leakNowButton.style.backgroundColor = "#03DAC6"; // Darker shade of #03DAC6
                        // leakNowButton.textContent = "Re-Leak"; // Change button text
                    })
                    .catch(error => {
                        console.error("Error fetching posts data:", error);
                        // leakNowButton.disabled = false;
                        // leakNowButton.style.backgroundColor = "#03DAC6"; // Darker shade of #03DAC6
                        // leakNowButton.textContent = "Leak now"; // Change button text
                    });


            }


            // Handle "Leak Now" button click to inject HTML with posts
            leakNowButton.addEventListener("click", () => {
                if (profileService == "onlyfans") {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        if (tabs[0]) {
                            const tabUrl = tabs[0].url; // Get the current tab's URL
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: injectHTML,
                                args: [tabUrl] // Pass tabUrl as an argument
                            }, (injectionResults) => {
                                if (chrome.runtime.lastError) {
                                    console.error(chrome.runtime.lastError);
                                } else {
                                    console.log("HTML injection complete:", injectionResults);
                                }
                            });
                        }
                    });
                } else if (profileService == "fansly") {
                    console.log("Fansly target");
                    // Get the current active tab
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        const tabUrl = tabs[0].url;

                        // Check if the current URL matches Fansly profile format
                        const fanslyProfileRegex = /^https:\/\/fansly\.com\/[^\/]+\/posts$/;

                        if (fanslyProfileRegex.test(tabUrl)) {
                            console.log("Fansly profile page detected.");

                            // Execute script on the current tab to manipulate DOM
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: manipulateFanslyPageContent, // Function to inject
                                args: [profileService, profileId, profileName]  // Pass parameters as arguments
                            }, (injectionResults) => {
                                if (chrome.runtime.lastError) {
                                    console.error("Injection failed:", chrome.runtime.lastError);
                                } else {
                                    console.log("Injection successful:", injectionResults);
                                }
                            });
                        } else {
                            console.log("Not a valid Fansly profile page. Ignoring.");
                        }
                    });
                } else if (profileService == "patreon") {
                    console.log("Patreon target");
                    // Query for the active tab in the current window
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        const tabUrl = tabs[0].url;

                        // Check if the current URL matches the Patreon profile format
                        const patreonProfileRegex = /^https:\/\/www\.patreon\.com\/[^\/?]+(\/posts)?(\?.*)?$/;

                        if (patreonProfileRegex.test(tabUrl)) {
                            console.log("Patreon profile page detected.");

                            // Execute script on the current tab to manipulate DOM
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: handlePatreonPageContent, // Function to inject
                                args: [profileService, profileId, profileName]
                            }, (injectionResults) => {
                                if (chrome.runtime.lastError) {
                                    console.error("Injection failed:", chrome.runtime.lastError);
                                } else {
                                    console.log("Injection successful:", injectionResults);
                                }
                            });
                        } else {
                            console.log("Not a valid Patreon profile page. Ignoring.");
                        }
                    });
                }

            });

            // Initialize extension on load
            initializeExtension();

            // Monitor tab changes to reinitialize if necessary
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                if (tab.active && changeInfo.url) {
                    console.log("Tab URL changed:", changeInfo.url);
                    initializeExtension();
                }
            });
        } else {
            console.log("Not logged in, redirecting to login.html");
            // Redirect to login.html
            window.location.href = chrome.runtime.getURL("login.html");
        }
    });
    
});
