on("chat:message", function(msg) {
    if (msg.type == "api") {
        log(msg.content);
        if(msg.content.indexOf("!tDice") !== -1) {
            let dice = rollTorgDice().toString();
            let res = {
                title:'Jet de dès',
                infoList:['resultat: '+dice]
            }
            sendResultToChat(msg.who, res);
        }
        if(msg.content.indexOf("!tScore") !== -1) {
            let dice = rollTorgDice();
            let score = diceToScore(dice).toString();
            let res = {
                title:'Jet de Score',
                infoList:['resultat: '+score]
            }
            sendResultToChat(msg.who, res);
        }
        if (msg.content.indexOf("!tAttackNPC") !== -1) {
            let paramList = msg.content.split(',');
            paramList.shift();
            let res = attackNPC(...paramList);
        }
        if (msg.content.indexOf("!tAttackPlayer") !== -1) {
            let paramList = msg.content.split(',');
            paramList.shift();
            let res = attackPlayer(...paramList);
            sendResultToChat(msg.who, res)
        }
    }
});


function rollTorgDice() {
    const DICE = 20;
    let dice = Math.floor(Math.random() * Math.floor(DICE))+1;
    if (dice === 10 || dice === 20) {
        dice += rollTorgDice();
    }
    return dice;
}

function rollTorgScore() {
    let dice = rollTorgDice();
    return diceToScore(dice);
}

function diceToScore(dice) {
    if (dice <= 1) {
        return -12;
    }
    if (dice <= 2) {
        return -10;
    }
    if (dice <= 4) {
        return -8;
    }
    if (dice <= 6) {
        return -5;
    }
    if (dice <= 8) {
        return -2;
    }
    if (dice <= 10) {
        return -1;
    }
    if (dice <= 12) {
        return 0;
    }
    if (dice <= 14) {
        return 1;
    }
    if (dice <= 15) {
        return 2;
    }
    if (dice <= 16) {
        return 3;
    }
    if (dice <= 17) {
        return 4;
    }
    if (dice <= 18) {
        return 5;
    }
    if (dice <= 19) {
        return 6;
    }
    if (dice <= 20) {
        return 7;
    }
    if (dice <= 25) {
        return 8;
    }
    if (dice <= 30) {
        return 9;
    }
    if (dice <= 35) {
        return 10;
    }
    if (dice <= 40) {
        return 11;
    }
    if (dice <= 45) {
        return 12;
    }
    if (dice <= 50) {
        return 13;
    }
    if (dice <= 55) {
        return 14;
    }
    if (dice <= 60) {
        return 15;
    }
    return 16;
}

function attackNPC(attackerName, attackerSkill, difficulty, targetName, weaponModifier, weaponMax, targetToughness) {
    let result = {};
    let score = rollTorgScore();
    if (isSuccess(score, attackerSkill, difficulty)) {
        res.success = true;

    } else {
        result.success = false;
        
    }
    return result;
}

function attackPlayer(attackerSkill, difficulty, playerName, weaponModifier, weaponMax, playerToughness) {
    let result = {};
    attackerSkill = attackerSkill.split('+').reduce( (prev,cur) => prev+parseInt(cur),0);
    difficulty = parseInt(difficulty);
    weaponModifier = parseInt(weaponModifier);
    weaponMax = parseInt(weaponMax);
    playerToughness = parseInt(playerToughness);
    log(`attackPlayer(${attackerSkill}, ${difficulty}, ${playerName}, ${weaponModifier}, ${weaponMax}, ${playerToughness})`);
    let score = rollTorgScore();
    if (isSuccess(score, attackerSkill, difficulty)) {
        log('success attack');
        result.title = `${playerName} a été touché`;
        result.infoList = ["Scoce obtenu: "+score];
        result.infoList.push(...computeDommagePossibilite(weaponModifier, weaponMax, score, playerToughness));
    } else {
        log('failed attack');
        result.title = `${playerName} a esquivé l'attaque`;
        result.infoList = ["Scoce obtenu: "+score];
    }
    return result;
}

function isSuccess(score, skill, difficulty) {
    return ((score + skill) >= difficulty);
}

function computeDommagePossibilite(weaponModifier, weaponMax, score, playerToughness) {
    let marge = Math.max(weaponModifier + score , weaponMax) - playerToughness;
    return margeToDamageForCharacterWithPossibility(marge);
}

function margeToDamageForCharacterWithPossibility(marge) {
    if (marge <= 0) {
        return ["Aucun dommage"];
    }
    if (marge <= 1) {
        return ["Dommage : 1"];
    }
    if (marge <= 2) {
        return ["Dommage : O 1"];
    }
    if (marge <= 3) {
        return ["Dommage : K 1"];
    }
    if (marge <= 4) {
        return ["Dommage : 2"];
    }
    if (marge <= 5) {
        return ["Dommage : O 2"];
    }
    if (marge <= 6) {
        return ["Dommage : Chute O 2"];
    }
    if (marge <= 8) {
        return ["Dommage : Chute K 2"];
    }
    if (marge <= 9) {
        return ["Dommage : Bls : K 3"];
    }
    if (marge <= 10) {
        return ["Dommage : Bls : K 4"];
    }
    if (marge <= 11) {
        return ["Dommage : Bls O 4"];
    }
    if (marge <= 12) {
        return ["Dommage : Bls K 5"];
    }
    if (marge <= 13) {
        return ["Dommage : 2 Bls O 4"];
    }
    if (marge <= 14) {
        return ["Dommage : 2 Bls KO 5"];
    }
    if (marge <= 15) {
        return ["Dommage : 3 Bls KO 5"];
    }
    let nbBls = 3 + Math.floor(((marge - 16)/2));
    return["Dommage : "+nbBls+" Bls KO 5"];
}

function margeToDamageForNormCharacter(marge) {
    if (marge <= 0) {
        return ["Aucun dommage"];
    }
    if (marge <= 1) {
        return ["Dommage : 1"];
    }
    if (marge <= 2) {
        return ["Dommage : O 1"];
    }
    if (marge <= 3) {
        return ["Dommage : K 1"];
    }
    if (marge <= 4) {
        return ["Dommage : 2"];
    }
    if (marge <= 5) {
        return ["Dommage : O 2"];
    }
    if (marge <= 6) {
        return ["Dommage : Chute O 2"];
    }
    if (marge <= 8) {
        return ["Dommage : Chute K 2"];
    }
    if (marge <= 9) {
        return ["Dommage : Bls : K 3"];
    }
    if (marge <= 10) {
        return ["Dommage : Bls : K 4"];
    }
    if (marge <= 11) {
        return ["Dommage : Bls O 4"];
    }
    if (marge <= 12) {
        return ["Dommage : Bls K 5"];
    }
    if (marge <= 13) {
        return ["Dommage : 2 Bls O 4"];
    }
    if (marge <= 14) {
        return ["Dommage : 2 Bls KO 5"];
    }
    if (marge <= 15) {
        return ["Dommage : 3 Bls KO 5"];
    }
    let nbBls = 3 + Math.floor(((marge - 16)/2));
    return["Dommage : "+nbBls+" Bls KO 5"];
}

function sendResultToChat(who, result) {
    //TODO Fred
    sendChat(who, result.title);
    if (result.infoList != undefined) {
        result.infoList.forEach(info => sendChat(who, info));
    }
}