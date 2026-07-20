chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
	console.log("Hello!!!")
	if (checkYTHomePage(tab)) {
		const vids = scrapeHistory()
		replaceHomePage(vids)
	}
})
