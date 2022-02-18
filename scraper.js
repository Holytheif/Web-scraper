const puppeteer = require('puppeteer-extra');
const fs = require("fs");
const path = require("path");

const downloader = require("./downloader");
const namesOfCharacters = require('./names.json');

const url = `https://onepiece.fandom.com/wiki/`;
const filepath = path.resolve(__dirname, "images"); // !Create images folder before running script

(async () => {

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	page.setDefaultTimeout(1000000); // avoid timeout in slow loading pages
	let fetchedDesc = []
	try {
		for (let index = 0; index < namesOfCharacters.length; index++) {
			const resource = namesOfCharacters[index].replace(' ', '_');
			const link = url + resource;
			await page.goto(link);

			const [element] = await page.$x('//*[@id="mw-content-text"]/div/p[3]');
			const [element2] = await page.$x('//*[@id="mw-content-text"]/div/p[4]');
			const [element3] = await page.$x('//*[@id="mw-content-text"]/div/p[6]');

			let desc = '';
			let desc2 = '';
			let desc3 = '';
			if (element != undefined) {
				const data = await element.getProperty('textContent');
				desc = await data.jsonValue();
			}
			if (element2 != undefined) {
				const data2 = await element2.getProperty('textContent');
				desc2 = await data2.jsonValue();
			}
			if (element3 != undefined) {
				const data3 = await element3.getProperty('textContent');
				desc3 = await data3.jsonValue();
			}
			const imgURL = await page.evaluate(() => document.querySelector(".pi-image-thumbnail").src); //extracted URL of image

			downloader(imgURL, filepath, namesOfCharacters[index] + '.png')
			const completeDesc = JSON.stringify(desc) + JSON.stringify(desc2) + JSON.stringify(desc3);

			fetchedDesc.push(completeDesc);
		}
	}
	catch (error) {
		console.log(error);
	}
	finally {
		await browser.close();
	}
	const detailsOfCharacters = fetchedDesc.map((element) => {
		return element.replace(/(\[(\w)*( )?(\w)*\])|(\\n)|(\\t)|(")/g, ''); //erasing hyperlink/special character texts
	});

	const database = [];
	for (let index = 0; index < namesOfCharacters.length; index++) {
		const characterObject = {
			characterName: namesOfCharacters[index],
			characterDetails: detailsOfCharacters[index],
		}
		database.push(characterObject);
	}
	const outputJSON = JSON.stringify(database);
	fs.writeFile('./output.json', outputJSON, 'utf-8', (error) => {
	})
})();