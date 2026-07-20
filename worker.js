chrome.tabs.onUpdated.addListener( (_, _, tab) => {
	console.log("Hello!!!")
	if (checkYTHomePage(tab)) {
		const vids = scrapeHistory()
		replaceHomePage(vids)
	}
})
