// delete the youtube homepage, replace with our own
function replaceHomePage(vids) {
	const homePage = document.querySelector()
	// ths likeyl wont work too well need to find a way to rpelace the div with it instead of jsut removing
	const children = homePage.querySelectorAll("*")
	
	const newVids = convertToHTML(vids)

	homePage.replaceChildren(children, ...newVids)	// spread cuz replaceChildren like spreading
}

function convertToHTML(vids) {

	const result = {}

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

	result.append(vidElement)

	})

}
