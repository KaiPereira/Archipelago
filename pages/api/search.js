// pages/api/search.js

import axios from "axios"
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export default async function handler(req, res) {
    let { bird } = req.query;
    bird = bird.replaceAll("-", " ")
    console.log(bird)

    const url = `https://avibase.bsc-eoc.org/search.jsp?pg=search&isadv=yes&pgno=1&fam=&qstr=${bird}&qtype=2&qstr2=&qtype=2&qlang=&qyears=&qauthors=&qinclsp=0`;
    const response = await axios.get(url)

    const dom = new JSDOM(response.data);

    let firstResult = dom.window.document.getElementsByClassName("table-striped")
    firstResult = Array.from(firstResult)[0]
    firstResult = firstResult.querySelectorAll("tr")[1]
    firstResult = firstResult.querySelectorAll("td")
    firstResult = firstResult[2].querySelector("a").href
    const regex = /'(.*)'/;
    const match = firstResult.match(regex);
    const speciesId = match[1];

    const speciesUrl = `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=${speciesId}`
    const speciesData = await axios.get(speciesUrl)
    const speciesDom = new JSDOM(speciesData.data);

    let classification = speciesDom.window.document.getElementById("taxoninfo")
    const family = classification.querySelectorAll("a")[0].textContent
    const genus = classification.querySelectorAll("a")[1].textContent
    const scientific = classification.querySelector("i").textContent

    let card = speciesDom.window.document.getElementById("card-body")
    let description = card.querySelector("div")
    description = description.querySelector("p").textContent

    const range = speciesDom.window.document.getElementById("rng1").textContent

    const imagesUrl = `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=${speciesId}&sec=flickr`
    const imagesData = await axios.get(imagesUrl)
    const imagesDom = new JSDOM(imagesData.data);

    // get the first image element within the div
    const imageElements = imagesDom.window.document.querySelectorAll('.divflickr img');
    // get the src attribute of the image
    let imageUrls = [...imageElements].map((image) => {
        const imageUrl = image.getAttribute("src")

        if (imageUrl.includes("staticflickr.com")) {
            return imageUrl
        }
    })

    imageUrls = imageUrls.filter((element) => element !== undefined)

    const audioUrl = `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=${speciesId}&sec=audio`
    const audioData = await axios.get(audioUrl)
    const audioDom = new JSDOM(audioData.data);

    let audio = audioDom.window.document.getElementsByClassName("soundframe")[0]
    audio = audio.querySelector("iframe").getAttribute("src")
    const audioPageUrl = audio
    const audioPageData = await axios.get(audioPageUrl)
    const audioPageDom = new JSDOM(audioPageData.data);

    audio = audioPageDom.window.document.querySelector("audio").getAttribute("src")
    
    const inDepthInformation = `https://avibase.bsc-eoc.org/species.jsp?lang=EN&avibaseid=${speciesId}`

    const info = {
        family: family,
        genus: genus,
        scientific: scientific,
        description: description,
        range: range,
        images: imageUrls,
        audio: audio,
        inDepthInformation: inDepthInformation
    }

    console.log(audio)

    // send the data to the frontend
    res.status(200).json(info);
}