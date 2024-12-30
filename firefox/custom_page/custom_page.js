const iframeContainer = document.getElementById("iframeContainer");
const addButton = document.getElementById("addButton");
const settingsButton = document.getElementById("settingsButton");
const editAllButton = document.getElementById("editAllButton");
const deleteAllButton = document.getElementById("deleteAllButton");
const pcUAButton = document.getElementById("pcUAButton");
const modeButton = document.getElementById("modeButton");
const rotateButton = document.getElementById("rotateButton");
const settingsContainer = document.getElementById("settingsContainer");
const editContainer = document.getElementById("editContainer");
const iframeWidthInput = document.getElementById("iframeWidth");
const iframeHeightInput = document.getElementById("iframeHeight");
const oneUrlsInput = document.getElementById("oneUrls");
const twoUrlsInput = document.getElementById("twoUrls");
const threeUrlsInput = document.getElementById("threeUrls");
const fourUrlsInput = document.getElementById("fourUrls");
const iframeGapInput = document.getElementById("iframeGap");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const saveEditButton = document.getElementById("saveEditButton");

let iframeWidth = 375; // Default width
let iframeHeight = 667; // Default height
let iframeGap = 20; // Default gap

// Load settings and URLs when the page opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["iframeUrls", "iframeSettings", "group", "lastUrls", "mode"], (data) => {
    const mode = data.mode || 'dark';
    setMode(mode);

    const urls = data.lastUrls || [];
    const group = data.group || { Star: '', Sailing: '', Flower: '', Coffee: '' };
    const settings = data.iframeSettings || { width: 375, height: 667, gap: 20 };

    iframeWidth = settings.width;
    iframeHeight = settings.height;
    iframeGap = settings.gap;

    iframeWidthInput.value = iframeWidth;
    iframeHeightInput.value = iframeHeight;
    iframeGapInput.value = iframeGap;

    oneUrlsInput.value = group.Star;
    twoUrlsInput.value = group.Sailing;
    threeUrlsInput.value = group.Flower;
    fourUrlsInput.value = group.Coffee;

    const iframeContainer = document.querySelector('#iframeContainer');
    iframeContainer.style.gap = `${iframeGap}px`; // Set the new gap

    // Explicit mapping of button IDs to group keys
    const buttonToGroupMap = {
      oneButton: 'Star',
      twoButton: 'Sailing',
      threeButton: 'Flower',
      fourButton: 'Coffee',
    };

    // Iterate through buttonToGroupMap
    Object.entries(buttonToGroupMap).forEach(([buttonID, groupKey]) => {
      const button = document.getElementById(buttonID); // Get button by ID
      const urls = group[groupKey]; // Get URLs for the group key

      const split = document.getElementById('split-end'); // Get button by ID
      if (urls && urls.length > 0) {
        split.style.display = '';
        // Bind click event if group has URLs
        function open() {

          const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
          iframeWrappers.forEach(wrapper => {
            wrapper.remove();
          });
          addIframe(urls);
          // Add your specific click event logic here
          document.title = buttonToGroupMap[buttonID];
        }
        button.removeEventListener('click', open);
        button.addEventListener('click', open);

      } else {
        // Hide button if no URLs in the group
        button.style.display = 'none';
      }
    });

    if (urls.length > 0) {
      urls.forEach((url) => createIframe(url));
      chrome.storage.local.set({ lastUrls: [] });
    }


  });
});

// Save URLs to storage
function saveUrls() {
  const urls = Array.from(iframeContainer.querySelectorAll(".iframe-wrapper iframe")).map(
    (iframe) => iframe.getAttribute("src")
  );
  chrome.storage.local.set({ iframeUrls: urls });
}

function createIframe(url) {
  chrome.storage.local.get(['iframeSettings', 'size', "vertical"], (data) => {

    const vertical = data.vertical ?? true;
    const iframeWrapper = document.createElement("div");
    iframeWrapper.className = "iframe-wrapper";

    // Title Bar
    const titleBar = document.createElement("div");
    titleBar.className = "iframe-title-bar";

    const title = document.createElement("span"); // Create the title element
    title.style.paddingLeft = "0.5em"; // Add some left margin for spacing

    iframeWrapper.style.width = `${(data.size && data.size[url] && data.size[url].width) || (data.iframeSettings && data.iframeSettings.width) || 375}px`;
    iframeWrapper.style.height = `${(data.size && data.size[url] && data.size[url].height) || (data.iframeSettings && data.iframeSettings.height) || 667}px`;
    title.style.maxWidth = `${(data.size && data.size[url] && data.size[url].width) || (data.iframeSettings && data.iframeSettings.width) || 375}px`;
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
      // Get iframeUrls and group from chrome.storage.local
      chrome.storage.local.get(['iframeUrls', 'group'], (data) => {
        const iframeUrls = data.iframeUrls || [];
        const group = data.group || {};

        const currentTitle = document.title;  // Get the current title and remove leading/trailing spaces

        // Check if the current title exists in the group object
        if (group[currentTitle]) {

          // The title exists in the group, so we will update the group
          const urls = group[currentTitle].split(";");  // Assume URLs are stored as a semicolon-separated string

          const index = urls.indexOf(url) !== -1 ? urls.indexOf(url) : urls.indexOf(url.replace(/^https?:\/\//, ''));  // Find the current URL's index

          if (index === -1) {
            return; // URL not found in the group, exit early
          }

          // Create the index selector dropdown
          const selector = document.createElement("select");
          selector.style.position = 'absolute';  // Position it dynamically on the page
          selector.style.zIndex = '1000';       // Ensure it's on top of other elements

          // Add options to the dropdown for each URL in the group
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

          // Set the dropdown position to appear next to the title
          selector.style.top = `${titleRect.top + window.scrollY + titleRect.height + 5}px`; // Position below the title
          selector.style.left = `${titleRect.left + window.scrollX}px`; // Align with left of title

          // Append the selector to the body
          document.body.appendChild(selector);

          // Add event listener to remove the selector when clicking outside
          const removeSelector = () => {
            document.body.removeChild(selector);
          };

          // Remove the selector when clicking outside or on a different element
          document.addEventListener('click', (event) => {
            if (!selector.contains(event.target) && !title.contains(event.target)) {
              removeSelector();
            }
          }, { once: true });

          // Add an event listener for when the user selects an index
          selector.addEventListener("change", () => {
            const selectedIndex = parseInt(selector.value);  // Get selected index

            // Swap the URL at the current index with the selected index
            const temp = urls[index];
            urls[index] = urls[selectedIndex];
            urls[selectedIndex] = temp;

            // Update the group object in chrome.storage.local
            group[currentTitle] = urls.join(";");  // Store URLs as a semicolon-separated string

            chrome.storage.local.set({ group: group }, () => {
              // Optionally, update the title or any other UI elements
              title.textContent = urls[selectedIndex];  // Update the title to the selected URL
              document.body.removeChild(selector);  // Remove the selector from the DOM
              const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
              iframeWrappers.forEach(wrapper => {
                wrapper.remove();
              });
              addIframe(urls.join(";"));
            });
          });
        } else {

          // Current title is not in the group, proceed with iframeUrls logic
          const index = iframeUrls.indexOf(url);  // Find the current URL's index in iframeUrls

          if (index === -1) {
            return; // URL not found in iframeUrls, exit early
          }

          // Create the index selector dropdown
          const selector = document.createElement("select");
          selector.style.position = 'absolute';  // Position it dynamically on the page
          selector.style.zIndex = '1000';       // Ensure it's on top of other elements

          // Add options to the dropdown for each URL in iframeUrls
          iframeUrls.forEach((url, idx) => {
            const option = document.createElement("option");
            option.value = idx;
            option.textContent = `${idx + 1}. ${url}`;
            selector.appendChild(option);
          });

          // Set the current URL as the selected option
          selector.value = index;

          // Get the bounding rect of the title element
          const titleRect = title.getBoundingClientRect();

          // Set the dropdown position to appear next to the title
          selector.style.top = `${titleRect.top + window.scrollY + titleRect.height + 5}px`; // Position below the title
          selector.style.left = `${titleRect.left + window.scrollX}px`; // Align with left of title

          // Append the selector to the body
          document.body.appendChild(selector);

          // Add event listener to remove the selector when clicking outside
          const removeSelector = () => {
            document.body.removeChild(selector);
          };

          // Remove the selector when clicking outside or on a different element
          document.addEventListener('click', (event) => {
            if (!selector.contains(event.target) && !title.contains(event.target)) {
              removeSelector();
            }
          }, { once: true });

          // Add an event listener for when the user selects an index
          selector.addEventListener("change", () => {
            const selectedIndex = parseInt(selector.value);  // Get selected index

            // Swap the URL at the current index with the selected index
            const temp = iframeUrls[index];
            iframeUrls[index] = iframeUrls[selectedIndex];
            iframeUrls[selectedIndex] = temp;

            // Save the updated iframeUrls to chrome.storage.local
            chrome.storage.local.set({ iframeUrls: iframeUrls }, () => {
              // Optionally, update the title or any other UI elements
              title.textContent = iframeUrls[selectedIndex];  // Update the title to the selected URL
              document.body.removeChild(selector);  // Remove the selector from the DOM
              const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
              iframeWrappers.forEach(wrapper => {
                wrapper.remove();
              });
              addIframe(iframeUrls.join(";"));
            });
          });
        }
      });
    });


    const removeButton = document.createElement("button");
    removeButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-419.000000, -240.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <polygon id="close-[#1511]" points="375.0183 90 384 98.554 382.48065 100 373.5 91.446 364.5183 100 363 98.554 371.98065 90 363 81.446 364.5183 80 373.5 88.554 382.48065 80 384 81.446"> </polygon> </g> </g> </g> </g>

</svg>
`;

    removeButton.addEventListener("click", () => {
      if (data.size && data.size[url]) {
        delete data.size[url]; // Remove the size settings for the current URL
      }
      iframeWrapper.remove();
      const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
      if (iframeWrappers.length === 0) {
        document.title = '';
      }
    });

    const refreshButton = document.createElement("button");
    refreshButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="-1 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-302.000000, -7080.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M260,6930 C260,6933 257.308,6936 254,6936 C250.692,6936 248,6933.308 248,6930 C248,6926.692 250.692,6924 254,6924 L254,6926 L259,6923 L254,6920 L254,6922 C249.582,6922 246,6925.582 246,6930 C246,6934.418 249.582,6938 254,6938 C258.418,6938 262,6935 262,6930 L260,6930 Z" id="arrow_repeat-[#236]"> </path> </g> </g> </g> </g>

</svg>
`;
    refreshButton.addEventListener("click", () => {
      iframe.src = iframe.getAttribute("src"); // Reload iframe
      getTitleFromUrl(iframe.getAttribute("src"));  // Fetch title again after refresh
    });

    const editButton = document.createElement("button");
    editButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-180.000000, -2319.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M138.229706,2163.463 L139.648153,2161.977 L141.070621,2163.466 L139.651169,2164.952 L138.229706,2163.463 Z M127.920583,2177.236 L126.498115,2175.747 L136.808243,2164.952 L138.229706,2166.44 L127.920583,2177.236 Z M139.821061,2159 L124,2175.747 L124,2179 L127.920583,2179 L144,2162.859 L139.821061,2159 Z" id="pen-[#1319]"> </path> </g> </g> </g> </g>

</svg>
`;

    editButton.addEventListener("click", () => {
      const currentUrl = iframe.getAttribute('src'); // Get the current URL of the iframe
      let newUrl = prompt("URL:", currentUrl); // Prompt for the new URL

      if (newUrl) {
        // Check if the URL starts with http:// or https://, and prepend https:// if missing
        if (!/^https?:\/\//i.test(newUrl)) {
          newUrl = `https://${newUrl}`;
        }

        // Check if the URL is different from the current one
        if (newUrl !== currentUrl) {
          iframe.src = newUrl; // Update the iframe's src
          getTitleFromUrl(newUrl); // Fetch and update the new title (assuming this updates the title properly)
          title.textContent = newUrl; // Update the displayed title text
        }
      }
    });


    const resizeButton = document.createElement("button");
    resizeButton.innerHTML = `
    <svg width="14px" height="14px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4359.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M210.428608,4212.57139 C210.823577,4212.96636 210.823577,4213.60579 210.428608,4213.99975 C210.033638,4214.39472 209.394212,4214.39472 209.000253,4213.99975 C208.605283,4213.60579 208.605283,4212.96636 209.000253,4212.57139 C209.394212,4212.17642 210.033638,4212.17642 210.428608,4212.57139 L210.428608,4212.57139 Z M219.713925,4206.14278 L218.28557,4204.71443 L216.857215,4206.14278 L218.28557,4207.57114 L216.857215,4208.99949 L215.42886,4207.57114 L214.000505,4208.99949 L215.42886,4210.42886 L214.000505,4211.85722 L212.57114,4210.42886 L211.142785,4211.85722 L212.57114,4213.28557 L209.71443,4216.14329 L206.85671,4213.28557 L218.28557,4201.85671 L221.14329,4204.71443 L219.713925,4206.14278 Z M222.571645,4203.28608 L219.713925,4200.42835 L218.28557,4199 L216.857215,4200.42835 L205.428355,4211.85722 L204,4213.28557 L205.428355,4214.71392 L208.286075,4217.57165 L209.71443,4219 L211.142785,4217.57165 L214.000505,4214.71392 L215.42886,4213.28557 L216.857215,4211.85722 L218.28557,4210.42886 L219.713925,4208.99949 L221.14329,4207.57114 L222.571645,4206.14278 L224,4204.71443 L222.571645,4203.28608 Z" id="ruler#4-[#865]"> </path> </g> </g> </g> </g></svg>
`;

    resizeButton.addEventListener("click", () => {
      // Show prompt with default size in "width:height" format
      const currentWidth = iframeWrapper.style.width.replace("px", "") || iframeWrapper.offsetWidth;
      const currentHeight = iframeWrapper.style.height.replace("px", "") || iframeWrapper.offsetHeight;
      const newSize = prompt("↔x↕", `${currentWidth}x${currentHeight}`);

      if (newSize) {
        const [width, height] = newSize.split("x").map(value => parseInt(value.trim(), 10)); // Split and parse

        if (!isNaN(width) && !isNaN(height)) { // Validate the parsed values
          // Update the iframeWrapper's size directly
          iframeWrapper.style.width = `${width}px`;
          iframeWrapper.style.height = `${height}px`;
          iframe.style.width = `${width}px`;
          iframe.style.height = `${height}px`;

          // Save the new size in the local storage
          data.size = data.size || {};
          data.size[url] = { width, height }; // Update the iframeSettings.url directly

          chrome.storage.local.set({ size: data.size });
        } else {
          alert("Invalid input. Please enter the size in the format 'widthxheight' (e.g., '600x800').");
        }
      }
    });


    const signInButton = document.createElement("button");
    signInButton.innerHTML = `
<svg width="14px" height="14px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>profile [#1335]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-420.000000, -2159.000000)" fill="#cecece"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M374,2009 C371.794,2009 370,2007.206 370,2005 C370,2002.794 371.794,2001 374,2001 C376.206,2001 378,2002.794 378,2005 C378,2007.206 376.206,2009 374,2009 M377.758,2009.673 C379.124,2008.574 380,2006.89 380,2005 C380,2001.686 377.314,1999 374,1999 C370.686,1999 368,2001.686 368,2005 C368,2006.89 368.876,2008.574 370.242,2009.673 C366.583,2011.048 364,2014.445 364,2019 L366,2019 C366,2014 369.589,2011 374,2011 C378.411,2011 382,2014 382,2019 L384,2019 C384,2014.445 381.417,2011.048 377.758,2009.673" id="profile-[#1335]"> </path> </g> </g> </g> </g></svg>`;

    signInButton.addEventListener("click", () => {
      window.open(url, "_blank"); // Opens the URL in a new tab
    });



    // Check if URL contains 'douyin' and set min-width accordingly
    if (url.includes('douyin')) {
      iframeWrapper.style.minWidth = '628px';
    }

    titleBar.appendChild(title);
    titleBar.appendChild(resizeButton);
    titleBar.appendChild(editButton);
    titleBar.appendChild(signInButton);
    titleBar.appendChild(refreshButton);
    titleBar.appendChild(removeButton);

    // Iframe
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-presentation allow-pointer-lock allow-storage-access-by-user-activation allow-orientation-lock"
    iframe.style.width = `${(data.size && data.size[url] && data.size[url].width) || iframeWidth}px`;
    iframe.style.height = `${(data.size && data.size[url] && data.size[url].height) || iframeHeight}px`;


    // Check if URL contains 'douyin' and set min-width accordingly
    if (url.includes('douyin')) {
      iframe.style.minWidth = '628px';
    }
    iframeWrapper.appendChild(titleBar);
    iframeWrapper.appendChild(iframe);
    iframeContainer.appendChild(iframeWrapper);

    if (!vertical) {
      setHorizonStyle();
    }
    saveUrls(); // Save the updated list of URLs

  });
}




// Add new iframe URLs (supporting multiple URLs separated by semicolons)
addButton.addEventListener("click", () => {

  const settingsContainer = document.getElementById("settingsContainer");
  settingsContainer.style.display = "none";
  const editContainer = document.getElementById("editContainer");
  editContainer.style.display = "none";
  let urls = prompt("URLs: example.com;https://www.example2.com");
  addIframe(urls);
});

function addIframe(urls) {

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
}

// Show settings input boxes
settingsButton.addEventListener("click", () => {

  const editContainer = document.getElementById("editContainer");
  editContainer.style.display = "none";

  chrome.storage.local.get("iframeSettings", (data) => {
    const settings = data.iframeSettings || { width: 375, height: 667, gap: 20 };

    iframeWidth = settings.width;
    iframeHeight = settings.height;
    iframeGap = settings.gap;

    iframeWidthInput.value = iframeWidth;
    iframeHeightInput.value = iframeHeight;
    iframeGapInput.value = iframeGap;

    settingsContainer.style.display =
      settingsContainer.style.display === "none" ? "block" : "none";
  })
});

// Save iframe size settings
saveSettingsButton.addEventListener("click", () => {
  const newWidth = parseInt(iframeWidthInput.value, 10);
  const newHeight = parseInt(iframeHeightInput.value, 10);
  const newGap = parseInt(iframeGapInput.value, 10);

  // Validate inputs
  if (newWidth > 0 && newHeight > 0 && newGap > 0) {
    // Check if values have changed
    const hasWidthChanged = newWidth !== iframeWidth;
    const hasHeightChanged = newHeight !== iframeHeight;
    const hasGapChanged = newGap !== iframeGap;

    if (hasWidthChanged || hasHeightChanged || hasGapChanged) {
      // Update iframe settings
      iframeWidth = newWidth;
      iframeHeight = newHeight;
      iframeGap = newGap;

      // Save new settings to local storage
      chrome.storage.local.set({
        iframeSettings: {
          width: iframeWidth,
          height: iframeHeight,
          gap: iframeGap,
        },
      }, () => {
        if (hasGapChanged) {

          const iframeContainer = document.getElementById('iframeContainer');
          iframeContainer.style.gap = `${iframeGap}px`; // Set the new gap
        }
        // Fetch stored iframe-specific sizes
        chrome.storage.local.get(["size"], (data) => {
          const sizeData = data.size || {};

          // Fetch all iframe wrappers
          const iframeWrappers = document.querySelectorAll(".iframe-wrapper");

          iframeWrappers.forEach(wrapper => {
            const iframe = wrapper.querySelector("iframe");

            if (iframe) {
              const iframeUrl = iframe.getAttribute("src");

              // Check if this iframe URL has specific sizes saved
              const iframeSize = sizeData[iframeUrl];

              if (!iframeSize || !iframeSize.width || !iframeSize.height) {
                // Update iframe and wrapper size if no specific size is saved
                wrapper.style.width = `${iframeWidth}px`;
                wrapper.style.height = `${iframeHeight}px`;
                iframe.style.width = `${iframeWidth}px`;
                iframe.style.height = `${iframeHeight}px`;
              }
            }
          });
        });
      });
    }
    // Hide settings container
    settingsContainer.style.display = "none";
  } else {
    // Invalid inputs
    alert("×");
  }
});


// Save iframe size settings
saveEditButton.addEventListener("click", () => {
  const newOneUrls = oneUrlsInput.value.trim();
  const newTwoUrls = twoUrlsInput.value.trim();
  const newThreeUrls = threeUrlsInput.value.trim();
  const newFourUrls = fourUrlsInput.value.trim();

  // Update URL variables
  oneUrls = newOneUrls;
  twoUrls = newTwoUrls;
  threeUrls = newThreeUrls;
  fourUrls = newFourUrls;

  // Save to local storage
  chrome.storage.local.set({
    group: {
      Star: oneUrls,
      Sailing: twoUrls,
      Flower: threeUrls,
      Coffee: fourUrls
    },
  }, () => {
    chrome.storage.local.get(["group"], (data) => {
      const group = data.group || { Star: '', Sailing: '', Flower: '', Coffee: '' };
      const buttonToGroupMap = {
        oneButton: 'Star',
        twoButton: 'Sailing',
        threeButton: 'Flower',
        fourButton: 'Coffee',
      };

      const split = document.getElementById('split-end');
      const editContainer = document.getElementById("editContainer");
      let hasUrls = false;

      // Iterate through buttonToGroupMap
      Object.entries(buttonToGroupMap).forEach(([buttonID, groupKey]) => {
        const button = document.getElementById(buttonID);
        const urls = group[groupKey];

        if (urls && urls.length > 0) {
          hasUrls = true;
          button.style.display = ''; // Show the button

          // Remove existing event listener if any
          button.replaceWith(button.cloneNode(true));
          const newButton = document.getElementById(buttonID);
          newButton.addEventListener("click", () => {
            const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
            iframeWrappers.forEach(wrapper => {
              wrapper.remove();
            });
            addIframe(urls); // Add iframe logic
            document.title = buttonToGroupMap[buttonID]; // Set the document title
          });
        } else {
          button.style.display = 'none'; // Hide the button if no URLs
        }
      });

      // Show/hide the split element based on the presence of URLs
      split.style.display = hasUrls ? '' : 'none';

      // Optionally hide the edit container (you can adjust this logic)
      editContainer.style.display = 'none';
    });
  });
});


// Edit all URLs settings
editAllButton.addEventListener("click", async () => {
  const settingsContainer = document.getElementById("settingsContainer");
  settingsContainer.style.display = "none";
  chrome.storage.local.get("group", (data) => {
    const group = data.group || { Star: '', Sailing: '', Flower: '', Coffee: '' };
    const placeholder = "example.com;https://www.example2.com";
    // Update inputs with values or placeholders
    oneUrlsInput.value = group.Star;
    oneUrlsInput.style.width = "500px";
    oneUrlsInput.placeholder = group.Star ? "" : placeholder;

    twoUrlsInput.value = group.Sailing;
    twoUrlsInput.style.width = "500px";
    twoUrlsInput.placeholder = group.Sailing ? "" : placeholder;

    threeUrlsInput.value = group.Flower;
    threeUrlsInput.style.width = "500px";
    threeUrlsInput.placeholder = group.Flower ? "" : placeholder;

    fourUrlsInput.value = group.Coffee;
    fourUrlsInput.style.width = "500px";
    fourUrlsInput.placeholder = group.Coffee ? "" : placeholder;

    // Toggle visibility of the edit container
    editContainer.style.display =
      editContainer.style.display === "none" ? "flex" : "none";
  });
});


deleteAllButton.addEventListener("click", async () => {
  document.title = "";
  const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
  iframeWrappers.forEach(wrapper => {
    wrapper.remove();
  });
});

modeButton.addEventListener("click", async () => {
  chrome.storage.local.get('mode', (data) => {
    const mode = data.mode || 'dark';
    const updatedMode = mode === 'dark' ? 'light' : 'dark';

    chrome.storage.local.set({ 'mode': updatedMode }, () => {
      setMode(updatedMode);
    });
  });
});

function setMode(mode) {
  document.documentElement.setAttribute('data-theme', mode);

      // Toggle body class
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(`${mode}-mode`);

      // Update body background styles
      if (mode === 'light') {
        document.body.style.background = `
          radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,188,233,1) 100%)`;
        document.body.style.filter = `
          progid:DXImageTransform.Microsoft.gradient(startColorstr="#eeaeca",endColorstr="#94bce9",GradientType=1)`;
      } else {
        document.body.style.backgroundColor = 'rgb(28 28 30 / var(--un-bg-opacity))';
        document.body.style.backgroundImage = `
          radial-gradient(ellipse 80% 80% at 50% -30%, #f871714d, #fff0)`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.filter = ''; // Clear light mode filter
      }
}


pcUAButton.addEventListener("click", () => {
  const settingsContainer = document.getElementById("settingsContainer");
  settingsContainer.style.display = "none";
  const editContainer = document.getElementById("editContainer");
  editContainer.style.display = "none";
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const pcUAValue =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
    let maxRuleId = rules.length > 0 ? Math.max(...rules.map((rule) => rule.id)) : 0;

    // Filter existing rules that modify User-Agent to PC UA
    const uaRules = rules.filter((rule) =>
      rule.action?.requestHeaders?.some(
        (header) => header.header === "User-Agent" && header.value === pcUAValue
      )
    );

    // Extract existing URL filters
    const urlFilters = uaRules.map((rule) => rule.condition.urlFilter).join(";");

    // Show prompt with current URLs
    const input = prompt(
      "PC User-Agent URLs: \n*.example.com;https://www.example2.com/path/*",
      urlFilters || ""
    );

    if (input !== null) {
      const newUrls = input
        .split(";")
        .map((url) => url.trim())
        .filter(Boolean); // Remove empty or invalid entries

      const existingFilters = new Set(uaRules.map((rule) => rule.condition.urlFilter));

      // If the input hasn't changed, do nothing
      if (newUrls.length === existingFilters.size && newUrls.every(url => existingFilters.has(url))) {
        return; // No change, so do nothing
      }

      // Determine rules to add and remove
      const urlsToRemove = Array.from(existingFilters).filter((url) => !newUrls.includes(url));
      const urlsToAdd = newUrls.filter((url) => !existingFilters.has(url));

      const rulesToRemove = uaRules
        .filter((rule) => urlsToRemove.includes(rule.condition.urlFilter))
        .map((rule) => rule.id);

      const newRules = urlsToAdd.map((url) => ({
        id: ++maxRuleId,
        priority: 3,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "User-Agent",
              operation: "set",
              value: pcUAValue,
            },
          ],
        },
        condition: {
          urlFilter: url,
          resourceTypes: ["sub_frame"],
        },
      }));

      // Check if there are any iframes on the page before reload
      const iframes = Array.from(document.getElementsByTagName('iframe'));
      const iframeUrls = iframes.map((iframe) => iframe.getAttribute("src")).filter(Boolean); // Only get valid URLs

      // Save iframe URLs to chrome.storage.local if there are any
      if (iframeUrls.length > 0) {
        chrome.storage.local.set({ lastUrls: iframeUrls });
      }

      // Update dynamic rules and reload the page
      chrome.declarativeNetRequest.updateDynamicRules(
        {
          addRules: newRules,
          removeRuleIds: rulesToRemove,
        },
        () => {
          const iframeWrappers = document.querySelectorAll('.iframe-wrapper');
          iframeWrappers.forEach(wrapper => {
            // get the iframe URL under the current iframe-wrapper
            const src = wrapper.querySelector('iframe').getAttribute('src');
            // refresh the iframe
            wrapper.querySelector('iframe').src = src;
          });

        }
      );
    }
  });
});


rotateButton.addEventListener("click", async () => {
  // Retrieve the current list of URLs from chrome.storage.local
  chrome.storage.local.get('vertical', (data) => {
    // If URLs exist, format them as a semicolon-separated list
    const vertical = data.vertical ?? true;
    const updatedVertical = !vertical;
    // Save the updated URLs back to chrome.storage.local
    chrome.storage.local.set({ 'vertical': updatedVertical }, () => {
      if (!updatedVertical) {
        setHorizonStyle();
      } else {
        unsetHorizonStyle();
      }
    });

  });
});

function setHorizonStyle() {
  const iframeContainer = document.getElementById('iframeContainer');
  if (iframeContainer) {
    // Remove/disable flex wrap
    iframeContainer.style.flexWrap = 'nowrap';

    // Remove/disable justify content
    iframeContainer.style.justifyContent = 'space-between';

    // Add horizontal overflow
    iframeContainer.style.overflowX = 'auto';
  } else {
    console.error('Element with id "iframeContainer" not found.');
  }

  // Get all elements with the class 'iframe-wrapper'
  const iframeWrappers = document.querySelectorAll('.iframe-wrapper');

  // Iterate through each element and set the flex property
  iframeWrappers.forEach((wrapper) => {
    wrapper.style.flex = '0 0 auto';
  });

  const offsetTop = iframeContainer.getBoundingClientRect().top;
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - offsetTop - 40;
  iframeContainer.style.height = `${availableHeight}px`;
}

function unsetHorizonStyle() {
  const iframeContainer = document.getElementById('iframeContainer');
  if (iframeContainer) {
    // Remove/disable flex wrap
    iframeContainer.style.flexWrap = 'wrap';

    // Remove/disable justify content
    iframeContainer.style.justifyContent = 'space-around';

    // Add horizontal overflow
    iframeContainer.style.overflowX = '';
  } else {
    console.error('Element with id "iframeContainer" not found.');
  }

  // Get all elements with the class 'iframe-wrapper'
  const iframeWrappers = document.querySelectorAll('.iframe-wrapper');

  // Iterate through each element and set the flex property
  iframeWrappers.forEach((wrapper) => {
    wrapper.style.flex = '';
  });
  iframeContainer.style.height = ``;

}
