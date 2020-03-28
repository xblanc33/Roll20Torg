const fs = require('fs');
const { createCanvas } = require('canvas')

const HEADLESS = false;

function readCardDescription() {
    let cardDescRawData = fs.readFileSync('./cardDesc.json');
    return JSON.parse(cardDescRawData);
}



async function main() {
    try {
        const cardList = readCardDescription();
        let cardNumber = 1;
        for (let cardIndex = 0; cardIndex < cardList.length; cardIndex++) {
            const cardDesc = cardList[cardIndex];
            const canvas = drawCard(cardDesc);
            const pngData = canvas.toBuffer();
            const nb = cardDesc.nombre;
            for (let nbIndex = 0; nbIndex < nb; nbIndex++) {
                let fileName = './cards/card'+cardNumber+'.png';
                if (cardNumber < 10) {
                    fileName = './cards/card0'+cardNumber+'.png';
                }
                fs.writeFileSync(fileName, pngData);
                cardNumber++;
            } 
        } 
    } catch(e) {
        console.log("error:",e);
    }
}



function drawCard(card) {
    let canvas = new createCanvas(191, 306, "png");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(2, 2, canvas.width-2, canvas.height-2);
    ctx.fillStyle = "black";
    ctx.font = "25px Comic Sans MS";
    ctx.textAlign = "center";

    let y = 40;

    for (let titreIndex = 0; titreIndex < card.titre.length; titreIndex++) {
        const titreSection = card.titre[titreIndex];
        ctx.fillText(titreSection, canvas.width/2, y);
        y += 35;
    }
    
    ctx.font = "15px Comic Sans MS";
    for (let descIndex = 0; descIndex < card.desc.length; descIndex++) {
        const descSection = card.desc[descIndex];
        ctx.fillText(descSection, canvas.width/2, y);
        y += 20;
    }

    ctx.fillStyle = "red";
    if (card.mj) {
        ctx.fillText("MJ", canvas.width/2, canvas.height-20);
    } else {
        ctx.fillText("Joueur", canvas.width/2, canvas.height-20);
    }
    return canvas;
}

(async () => {
    await main();
})();