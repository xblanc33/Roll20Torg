const cardList = [
    {
        "titre":["Adrénaline"],
        "desc":[
            "+ 3 au score de Dextérité,",
            "de Force, d’Endurance ou ",
            "d’une compétence apparentée."
        ],
        "nombre":16
    },
    {
        "titre":["Volonté"],
        "desc":[
            "+3 au score de Perception,",
            "de Raison ou d’une ",
            "compétence apparentée."
        ],
        "nombre":16
    }
]


function generateCard(index) {
    console.log("generateCard:"+index);
    let canvas = document.getElementById("card");
    let ctx = canvas.getContext("2d");
    ctx.font = "30px Comic Sans MS";
    ctx.textAlign = "center";

    let y = 40;

    let card = cardList[index];
    for (let titreIndex = 0; titreIndex < card.titre.length; titreIndex++) {
        const titreSection = card.titre[titreIndex];
        ctx.fillText(titreSection, canvas.width/2, y);
        y += 40;
    }
    
    ctx.font = "15px Comic Sans MS";
    for (let descIndex = 0; descIndex < card.desc.length; descIndex++) {
        const descSection = card.desc[descIndex];
        ctx.fillText(descSection, canvas.width/2, y);
        y += 20;
    }
}

window.onload = function() {
    console.log("onload");
    generateCard(1);
}
