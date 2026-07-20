chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
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

	const result = new Array()

	if (vids.length === 0) {
		const vidElement = document.createElement('div')
		div.className = 'warning-container'
		vidElement.innerHTML = 
		`
		 <span class="warning">
			 You dont got any youtube vids on your history, this extension
			 works off of history
		</span>
		`
		result.push(vidElement)
		return result;
	}

	vids.forEach( (vid) => {
		const vidElement = document.createElement('div')
		vidElement.innerHTML = 
	`
			<a href="${vid.url}" id="vid-link">
				<div id="thumbnail-container">
					<div id="vid-thumbnail"></div>
					<span id="vid-duration">${vid.videoLength}</span>
				</div>
				<span id="vid-title">${vid.title}</span>
				<div id="channel-info">
					<div id="channel-icon"></div>
					<span id="channel-name">${vid.channelName}</span>
				</div>
			</a>
	`

	result.push(vidElement)

	})

	console.log(result)

	return result
	
}


