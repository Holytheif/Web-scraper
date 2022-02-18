const https = require("https");
const fs = require("fs");
const path = require("path");

const downloader = async (url, filepath, filename) => {

	https.get(url, (res) => {
		const filestream = fs.createWriteStream(path.resolve(filepath, filename));
		res.pipe(filestream);
	});

}

module.exports = downloader;