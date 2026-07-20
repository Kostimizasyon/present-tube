chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received:", message)

  if (message.type === 'REPLACE_HOMEPAGE') {
    replaceHomePage(message.vids)
  }
})

// delete the youtube homepage, replace with our own
function replaceHomePage(vids) {

	console.log("Replacehomepage")
	
	const homePage = document.querySelector("#primary")
	// ths likeyl wont work too well need to find a way to rpelace the div with it instead of jsut removing

	const newVids = convertToHTML(vids)

	homePage.replaceChildren(...newVids)	// spread cuz replaceChildren like spreading
}

function convertToHTML(vids) {
	const result = []

	if (vids.length === 0) {
		const vidElement = document.createElement('div')
		vidElement.className = 'warning-container'
		vidElement.innerHTML = `
			<span class="warning">
				You dont got any youtube vids on your history, this extension
				works off of history
			</span>
		`
		result.push(vidElement)
		return result
	}

	vids.forEach((vid) => {
		const vidElement = document.createElement('div')
		vidElement.className = 'vid-card'
		vidElement.innerHTML = `
			<a href="${vid.url}" class="vid-link">
				<div class="thumbnail-container">
					<div class="vid-thumbnail" style="background-image: url('${vid.thumbnail}')"></div>
					<span class="vid-duration">${vid.videoLength}</span>
				</div>
				<div class="vid-info">
					<div class="channel-icon"></div>
					<div class="vid-text">
						<span class="vid-title">${vid.title}</span>
						<span class="channel-name">${vid.channelName}</span>
					</div>
				</div>
			</a>
		`
		result.push(vidElement)
	})

	return result
}

