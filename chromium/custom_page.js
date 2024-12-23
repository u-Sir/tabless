const iframeContainer = document.getElementById("iframeContainer");
const addButton = document.getElementById("addButton");
const settingsButton = document.getElementById("settingsButton");
const editAllButton = document.getElementById("editAllButton");
const settingsContainer = document.getElementById("settingsContainer");
const iframeWidthInput = document.getElementById("iframeWidth");
const iframeHeightInput = document.getElementById("iframeHeight");
const saveSettingsButton = document.getElementById("saveSettingsButton");

let iframeWidth = 375; // Default width
let iframeHeight = 667; // Default height

// Load settings and URLs when the page opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["iframeUrls", "iframeSettings"], (data) => {
    const urls = data.iframeUrls || [];
    const settings = data.iframeSettings || { width: 375, height: 667 };

    iframeWidth = settings.width;
    iframeHeight = settings.height;
    iframeWidthInput.value = iframeWidth;
    iframeHeightInput.value = iframeHeight;

    urls.forEach((url) => createIframe(url));
  });
});

// Save URLs to storage
function saveUrls() {
  const urls = Array.from(iframeContainer.querySelectorAll(".iframe-wrapper iframe")).map(
    (iframe) => iframe.src
  );
  chrome.storage.local.set({ iframeUrls: urls });
}

function createIframe(url) {
  chrome.storage.local.get('iframeSettings', (data) => {
    const iframeWrapper = document.createElement("div");
    iframeWrapper.className = "iframe-wrapper";

    // Title Bar
    const titleBar = document.createElement("div");
    titleBar.className = "iframe-title-bar";

    const title = document.createElement("span"); // Create the title element
    title.style.paddingLeft = "0.5em"; // Add some left margin for spacing


    iframeWrapper.style.width = `${(data.iframeSettings && data.iframeSettings.width) || 375}px`;
    iframeWrapper.style.height = `${(data.iframeSettings && data.iframeSettings.height) || 667}px`;
    title.style.maxWidth = `${(data.iframeSettings && data.iframeSettings.width) || 375}px`;
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";
    title.style.whiteSpace = "nowrap";



    // Function to fetch the title from the URL using .then()
    const getTitleFromUrl = (url) => {
      return fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
        },
      })
        .then((response) => response.text()) // Parse the response as text
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          // Try to find the title in the <title> tag
          const pageTitle = doc.querySelector("title")?.textContent;

          if (pageTitle) {
            title.textContent = pageTitle; // Use full title if it’s within 10 characters
          } else {
            title.textContent = url; // Fallback to URL if no title found
          }
        })
        .catch((error) => {
          // If an error occurs (e.g., CORS issues, network failure), fallback to URL
          title.textContent = url;
        });
    };

    // Fetch and set the title using .then() instead of async/await
    getTitleFromUrl(url);

    title.addEventListener("click", () => {
      // Get iframeUrls from chrome.storage.local
      chrome.storage.local.get('iframeUrls', (data) => {
        const urls = data.iframeUrls || [];
        const index = urls.indexOf(url);  // Find the current URL's index

        if (index === -1) {
          return; // URL not found in storage, exit early
        }

        console.log("URL found at index:", index);

        // Create the index selector dropdown
        const selector = document.createElement("select");
        selector.style.position = 'absolute';  // Position it dynamically on the page
        selector.style.zIndex = '1000';       // Ensure it's on top of other elements

        // Add options to the dropdown for each URL in iframeUrls
        urls.forEach((url, idx) => {
          const option = document.createElement("option");
          option.value = idx;
          option.textContent = `${idx + 1}. ${url}`;
          selector.appendChild(option);
        });

        // Set the current URL as the selected option
        selector.value = index;

        // Get the bounding rect of the title element
        const titleRect = title.getBoundingClientRect();

        // Set the dropdown position to appear next to the title (adjust these values if necessary)
        selector.style.top = `${titleRect.top + window.scrollY}px`; // 5px offset from the bottom of title
        selector.style.left = `${titleRect.left + window.scrollX}px`; // Align with left of title

        // Append the selector to the body (or any specific container)
        document.body.appendChild(selector);

        // Add event listener to remove the selector when clicking outside or on a different element
        const removeSelector = () => {
          document.body.removeChild(selector);
        };

        // Remove the selector when clicking outside the selector or the iframe container
        document.addEventListener('click', (event) => {
          if (!selector.contains(event.target) && !titleBar.contains(event.target)) {
            removeSelector();
          }
        }, { once: true });

        // Add an event listener for when the user selects an index
        selector.addEventListener("change", () => {
          const selectedIndex = parseInt(selector.value);  // Get selected index
          console.log("Selected index:", selectedIndex);

          // Swap the URL at the current index with the selected index
          const temp = urls[index];
          urls[index] = urls[selectedIndex];
          urls[selectedIndex] = temp;

          // Save the updated iframeUrls to chrome.storage.local
          chrome.storage.local.set({ iframeUrls: urls }, () => {
            // Optionally, update the title or any other UI elements here
            title.textContent = urls[selectedIndex];  // Update the title to the selected URL
            document.body.removeChild(selector);  // Remove the selector from the DOM after selection
            window.location.reload();  // Reload the page to reflect the changes
          });
        });
      });
    });

    const removeButton = document.createElement("button");
    removeButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <title>close [#1511]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-419.000000, -240.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <polygon id="close-[#1511]" points="375.0183 90 384 98.554 382.48065 100 373.5 91.446 364.5183 100 363 98.554 371.98065 90 363 81.446 364.5183 80 373.5 88.554 382.48065 80 384 81.446"> </polygon> </g> </g> </g> </g>

</svg>
`;

    removeButton.addEventListener("click", () => {
      iframeWrapper.remove();
      saveUrls();
    });

    const refreshButton = document.createElement("button");
    refreshButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <title>arrow_repeat [#236]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-302.000000, -7080.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M260,6930 C260,6933 257.308,6936 254,6936 C250.692,6936 248,6933.308 248,6930 C248,6926.692 250.692,6924 254,6924 L254,6926 L259,6923 L254,6920 L254,6922 C249.582,6922 246,6925.582 246,6930 C246,6934.418 249.582,6938 254,6938 C258.418,6938 262,6935 262,6930 L260,6930 Z" id="arrow_repeat-[#236]"> </path> </g> </g> </g> </g>

</svg>
`;
    refreshButton.addEventListener("click", () => {
      iframe.src = iframe.src; // Reload iframe
      getTitleFromUrl(iframe.src);  // Fetch title again after refresh
    });

    const editButton = document.createElement("button");
    editButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <title>pen [#1319]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-180.000000, -2319.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M138.229706,2163.463 L139.648153,2161.977 L141.070621,2163.466 L139.651169,2164.952 L138.229706,2163.463 Z M127.920583,2177.236 L126.498115,2175.747 L136.808243,2164.952 L138.229706,2166.44 L127.920583,2177.236 Z M139.821061,2159 L124,2175.747 L124,2179 L127.920583,2179 L144,2162.859 L139.821061,2159 Z" id="pen-[#1319]"> </path> </g> </g> </g> </g>

</svg>
`;
    editButton.addEventListener("click", () => {
      const newUrl = prompt("URL:", url);
      if (newUrl) {
        iframe.src = newUrl;
        getTitleFromUrl(newUrl);  // Fetch the new title when the URL is edited
        title.textContent = newUrl; // Directly update the title
        saveUrls();
      }
    });

    // Check if URL contains 'douyin' and set min-width accordingly
    if (url.includes('douyin')) {
      iframeWrapper.style.minWidth = '628px';
    }

    titleBar.appendChild(title);
    titleBar.appendChild(editButton);
    titleBar.appendChild(refreshButton);
    titleBar.appendChild(removeButton);

    // Iframe
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-presentation allow-pointer-lock allow-storage-access-by-user-activation allow-orientation-lock"
    iframe.style.width = `${iframeWidth}px`;
    iframe.style.height = `${iframeHeight}px`;

    // Check if URL contains 'douyin' and set min-width accordingly
    if (url.includes('douyin')) {
      iframe.style.minWidth = '628px';
    }
    iframeWrapper.appendChild(titleBar);
    iframeWrapper.appendChild(iframe);
    iframeContainer.appendChild(iframeWrapper);

    saveUrls(); // Save the updated list of URLs

  });
}




// Add new iframe URLs (supporting multiple URLs separated by semicolons)
addButton.addEventListener("click", () => {
  let urls = prompt("URLs: example.com;https://www.example2.com");

  if (urls) {
    // Trim leading and trailing semicolons and whitespace
    urls = urls.trim().replace(/^;|;$/g, ''); // Remove semicolons at the start and end

    const urlArray = urls.split(";").map(url => url.trim()); // Split by semicolon and trim each URL

    urlArray.forEach(url => {
      // Check if the URL already has http:// or https://
      if (!/^https?:\/\//i.test(url)) {
        // If not, prepend https://
        url = "https://" + url;
      }

      createIframe(url); // Create iframe for each valid URL
    });
  }
});

// Show settings input boxes
settingsButton.addEventListener("click", () => {
  settingsContainer.style.display =
    settingsContainer.style.display === "none" ? "block" : "none";
});

// Save iframe size settings
saveSettingsButton.addEventListener("click", () => {
  const newWidth = parseInt(iframeWidthInput.value, 10);
  const newHeight = parseInt(iframeHeightInput.value, 10);

  if (newWidth > 0 && newHeight > 0) {
    iframeWidth = newWidth;
    iframeHeight = newHeight;

    chrome.storage.local.set({
      iframeSettings: {
        width: iframeWidth,
        height: iframeHeight,
      },
    }, () => {
      window.location.reload();
    });

  } else {
    alert("×");
  }
});

// Edit all URLs settings
editAllButton.addEventListener("click", async () => {
  // Retrieve the current list of URLs from chrome.storage.local
  chrome.storage.local.get('iframeUrls', (data) => {
    // If URLs exist, format them as a semicolon-separated list
    const currentUrls = data.iframeUrls || [];
    const formattedUrls = currentUrls.join(";");  // Join URLs with semicolon and space

    // Create a prompt to allow the user to edit the URLs, and show current URLs as a default value
    const newUrls = prompt("URLs: example.com;https://www.example2.com", formattedUrls);

    // If the user entered some new URLs, process them
    if (newUrls !== null) {
      // Split by semicolon and remove any leading/trailing spaces from each URL
      const updatedUrls = newUrls.split(";").map(url => url.trim());

      // Save the updated URLs back to chrome.storage.local
      chrome.storage.local.set({ 'iframeUrls': updatedUrls }, () => {
        // alert("URLs updated successfully!");
        // Reload the page to apply the changes immediately
        window.location.reload();
      });
    }
  });
});

