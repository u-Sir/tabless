chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
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
                    urlFilter: "*://*/*",
                    resourceTypes: ["sub_frame"]
                }
            },
            {
                id: 2,
                priority: 1,
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
                    urlFilter: "*://*/*",
                    resourceTypes: ["sub_frame"]
                }
            }
        ],
        removeRuleIds: [1, 2]
    });
});
