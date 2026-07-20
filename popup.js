// check whether the current page is the youtube homepage or not
function checkYTHomePage(tab) {

	if (tab && tab.url && tab.url == "https://www.youtube.com/") {
		return true
	}

	return false

}

function scrapeHistory() {

	chrome.history.search({
		text:"youtube.com/watch",
		maxResults: 50, // TODO: make user input maybe
		startTime: 0,
	}, (data) => {
			if (data.length === 0) 
				console.log("No YT history found.")
			else {
				const shuffled = [...data].sort( () => 0.5 - Math.random()) // shuffle our list
				const selected = shuffled.slice(0,10) // select 10 elements TODO: make this also input
				const result = scrapeRecommendedFromSelected(selected)
					return result
			}
		})
}

async function scrapeRecommendedFromSelected(selectedHistory) {

	const newWindow = chrome.windows.create({
		focused: false,
		incognito: true,
	})

	const windowId = newWindow.id

	const allResults = await Promise.all(
		selectedHistory.map(video => scrapeRecommendedFromLink(video.url, windowId))
	)

    	const finalRecommendations = allResults.flat().slice(0, 12); //TODO: also input

	return finalRecommendations
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
                await waitForSelector('yt-lockup-view-model');

                // 2. Select all recommendation instances
                const videoNodes = document.querySelectorAll('yt-lockup-view-model');
                const data = [];

                videoNodes.forEach((node) => {
                    // Title & URL
                    const titleEl = node.querySelector('.yt-lockup-metadata-view-model__title');
                    const title = titleEl?.innerText?.trim();
                    const url = node.querySelector('a.yt-lockup-view-model__content-image')?.href;

                    // Video Length (the timestamp badge on the thumbnail)
                    const videoLenght = node.querySelector('.yt-badge-shape__text')?.innerText || "0:00";

                    // Thumbnail
                    const thumbContainer = node.querySelector('.ytThumbnailViewModelImage');
                    const thumbImg = thumbContainer?.querySelector('img');
                    const thumbnail = thumbImg?.src || thumbImg?.getAttribute('src') || "";

                    // Channel Name (Found in the first metadata row)
                    const channelNameEl = node.querySelector('.yt-content-metadata-view-model__metadata-row');
                    const channelName = channelNameEl?.innerText?.trim() || "Unknown Channel";

                    // Channel Icon
                    const channelIcon = "";

                    if (title && url) {
                        data.push({ 
                            title, 
                            videoLenght, 
                            url, 
                            thumbnail, 
                            channelName, 
                            channelIcon 
                        });
                    }
                });
                return data;
            }
        });

        return results[0].result;
    } catch (err) {
        console.error("Scraper Error:", err);
        return [];
    }
}
