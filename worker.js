console.log("Worker running!!!")

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
    if (checkYTHomePage(tab, changeInfo)) {
        console.log("Found a homepage!")
        const vids = await scrapeHistory()
        chrome.tabs.sendMessage(tab.id, { type: 'REPLACE_HOMEPAGE', vids })
    }
})

// check whether the current page is the youtube homepage or not
function checkYTHomePage(tab, changeInfo) {

	if (tab && tab.url && tab.url == "https://www.youtube.com/" && changeInfo.status === "complete") {
		return true
	}

	return false
}

async function scrapeHistory() {
	const data = await chrome.history.search({
		text: "youtube.com/watch",
		maxResults: 50,
		startTime: 0,
	})

	if (data.length === 0) {
		console.log("No YT history found.")
		return []
	}

	const shuffled = [...data].sort(() => 0.5 - Math.random())
	const selected = shuffled.slice(0, 10)
	return await scrapeRecommendedFromSelected(selected)
}

async function scrapeRecommendedFromSelected(selectedHistory) {

	const newWindow = await chrome.windows.create({
		focused: false,
		// incognito: true,
	})

	const windowId = newWindow.id

	const allResults = await Promise.all(
		selectedHistory.map(video => scrapeRecommendedFromLink(video.url, windowId))
	)

    // chrome.windows.remove(windowId)

    return allResults.flat().slice(0, 12); //TODO: also input
}

async function scrapeRecommendedFromLink(link, windowId) {
	
	const tab = await chrome.tabs.create({ url: link, active: false, windowId: windowId })
	const tabId = tab.id

	// wait till all pages load
	await new Promise((resolve) => {
		const listener = (updatedTabId, info) => {
			if (updatedTabId === tabId && info.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(listener)
				resolve()
			}
		}
		chrome.tabs.onUpdated.addListener(listener)
	})

	await new Promise(resolve => setTimeout(resolve, 2000))

	const results = await scrapeReccommendedFromTab(tabId)

	return results
	
}

async function scrapeReccommendedFromTab(tabId) {
   try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: async () => {
                const waitForSelector = (selector, timeout = 5000) => {
                    return new Promise((resolve) => {
                        const start = Date.now();
                        const interval = setInterval(() => {
                            const el = document.querySelector(selector);
                            if (el || (Date.now() - start) > timeout) {
                                clearInterval(interval);
                                resolve(el);
                            }
                        }, 100);
                    });
                };

                // 1. Wait for the new lockup view model to render
                await waitForSelector('yt-lockup-view-model', 20000);

                // 2. Select all recommendation instances
                const videoNodes = document.querySelectorAll('yt-lockup-view-model');
                const data = [];

                videoNodes.forEach((node) => {
                    // Title & URL — title lives on the <a>, inside the metadata text container
                    const titleEl = node.querySelector('.ytLockupMetadataViewModelTitle');
                    const title = titleEl?.getAttribute('aria-label')?.trim() || titleEl?.innerText?.trim();
                    const url = titleEl?.href; // the <a> itself IS ytLockupMetadataViewModelTitle

                    // Video Length — not visible in this screenshot, need to expand the thumbnail <a> to confirm
                    const videoLength = node.querySelector('.yt-badge-shape__text')?.innerText || "0:00";

                    // Thumbnail — also need to expand the collapsed <a class="ytLockupViewModelContentImage">
                    const thumbImg = node.querySelector('.ytLockupViewModelContentImage img');
                    const thumbnail = thumbImg?.src || "";

                    // Channel — the Metadata div under TextContainer is collapsed in your screenshot (2nd metadata div)
                    const channelNameEl = node.querySelector('.ytLockupMetadataViewModelMetadata');
                    const channelName = channelNameEl?.innerText?.trim() || "Unknown Channel";

                    if (title && url) {
                        data.push({ title, videoLength, url, thumbnail, channelName, channelIcon: "" });
                    }
                });
                
                console.log("Data is:", data)
                
                return data;
            }
        });

        return results[0].result;
    } catch (err) {
        console.error("Scraper Error:", err);
        return [];
    }
}
