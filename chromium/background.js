chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            // Rule to modify headers (remove CSP, X-Frame-Options, and Cookies) for all domains
            {
                id: 1,
                priority: 1,
                action: {
                    type: "modifyHeaders",
                    responseHeaders: [
                        { header: "Content-Security-Policy", operation: "remove" },
                        { header: "X-Frame-Options", operation: "remove" },
                        { header: "Cookie", operation: "remove" }
                    ]
                },
                condition: {
                    urlFilter: "*://*/*",  // Applies to all URLs
                    resourceTypes: ["sub_frame"]
                }
            },
            // Rule to set the mobile User-Agent for all domains
            {
                id: 2,
                priority: 2,
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [
                        {
                            header: "User-Agent",
                            operation: "set",
                            value:
                                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
                        }
                    ]
                },
                condition: {
                    urlFilter: "*://*/*",  // Applies to all URLs
                    resourceTypes: ["sub_frame"]
                }
            },
            // Rule to set desktop User-Agent for xiaohongshu.com
            {
                id: 3,
                priority: 3,  // Lower priority than rule 2
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [
                        {
                            header: "User-Agent",
                            operation: "set",
                            value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
                        }
                    ]
                },
                condition: {
                    urlFilter: "https://www.xiaohongshu.com/*",  // Only applies to xiaohongshu.com domain
                    resourceTypes: ["sub_frame"]
                }
            }
        ],
        removeRuleIds: [1, 2, 3]  // Clean up previous rules if necessary
    });
});
