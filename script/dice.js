on("chat:message", function(msg) {
    if (msg.type == "api") {
        log(msg.content);
        if(msg.content.indexOf("!tDice") !== -1) {
            let dice = rollTorgDice().toString();
            let res = {
                title:'Jet de dès',
                infoList:[["resultat",dice]]
            }
            sendResultToChat(msg.who, res);
        }
        if(msg.content.indexOf("!tScore") !== -1) {
            let dice = rollTorgDice();
            let score = diceToScore(dice).toString();
            let res = {
                title:'Jet de Score',
                infoList:[["resultat",score]]
            }
            sendResultToChat(msg.who, res);
        }
        if (msg.content.indexOf("!tAttackNPC") !== -1) {
            let paramList = msg.content.split(',');
            paramList.shift();
            let res = attackNPC(...paramList);
            sendResultToChat(msg.who, res);
        }
        if (msg.content.indexOf("!tAttackPlayer") !== -1) {
            let paramList = msg.content.split(',');
            paramList.shift();
            let res = attackPlayer(...paramList);
            sendResultToChat(msg.who, res);
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

function attackNPC(attackerSkill, difficulty, tokenId, weaponModifier, weaponMax, tokenToughness) {
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
        result.infoList = [["Score obtenu",score]];
        result.infoList.push(...computeDamagePossibilite(weaponModifier, weaponMax, score, playerToughness));
    } else {
        log('failed attack');
        result.title = `${playerName} a esquivé l'attaque`;
        result.infoList = [["Score obtenu",score]];
    }
    return result;
}

function isSuccess(score, skill, difficulty) {
    return ((score + skill) >= difficulty);
}

function computeDamagePossibilite(weaponModifier, weaponMax, score, playerToughness) {
    let marge = Math.min(weaponModifier + score , weaponMax) - playerToughness;
    return margeToDamageForCharacterWithPossibility(marge);
}

function margeToDamageForCharacterWithPossibility(marge) {
    if (marge < 0) {
        return [["!","Aucun dommage"]];
    }
    if (marge <= 1) {
        return [["Dommage","1"]];
    }
    if (marge <= 2) {
        return [["Dommage","O 1"]];
    }
    if (marge <= 3) {
        return [["Dommage","K 1"]];
    }
    if (marge <= 4) {
        return [["Dommage","2"]];
    }
    if (marge <= 5) {
        return [["Dommage","O 2"]];
    }
    if (marge <= 6) {
        return [["Dommage","Chute O 2"]];
    }
    if (marge <= 8) {
        return [["Dommage","Chute K 2"]];
    }
    if (marge <= 9) {
        return [["Dommage","Bls : K 3"]];
    }
    if (marge <= 10) {
        return [["Dommage","Bls : K 4"]];
    }
    if (marge <= 11) {
        return [["Dommage","Bls O 4"]];
    }
    if (marge <= 12) {
        return [["Dommage","Bls K 5"]];
    }
    if (marge <= 13) {
        return [["Dommage","2 Bls O 4"]];
    }
    if (marge <= 14) {
        return [["Dommage","2 Bls KO 5"]];
    }
    if (marge <= 15) {
        return [["Dommage","3 Bls KO 5"]];
    }
    let nbBls = 3 + Math.floor(((marge - 16)/2));
    return[["Dommage",nbBls+" Bls KO 5"]];
}

function margeToDamageForNormCharacter(marge) {
    if (marge <= 0) {
        return [["!","Aucun dommage"]];
    }
    if (marge <= 1) {
        return [["Dommage","1"]];
    }
    if (marge <= 2) {
        return [["Dommage","O 1"]];
    }
    if (marge <= 3) {
        return [["Dommage","K 1"]];
    }
    if (marge <= 3) {
        return ["Dommage : O 2"];
    }
    if (marge <= 4) {
        return [["Dommage","2"]];
    }
    if (marge <= 5) {
        return [["Dommage","O 2"]];
    }
    if (marge <= 6) {
        return [["Dommage","Chute O 2"]];
    }
    if (marge <= 8) {
        return [["Dommage","Chute K 2"]];
    }
    if (marge <= 9) {
        return [["Dommage","Bls : K 3"]];
    }
    if (marge <= 10) {
        return [["Dommage","Bls : K 4"]];
    }
    if (marge <= 11) {
        return [["Dommage","Bls O 4"]];
    }
    if (marge <= 12) {
        return [["Dommage","Bls K 5"]];
    }
    if (marge <= 13) {
        return [["Dommage","2 Bls O 4"]];
    }
    if (marge <= 14) {
        return [["Dommage","2 Bls KO 5"]];
    }
    if (marge <= 15) {
        return [["Dommage","3 Bls KO 5"]];
    }
    let nbBls = 3 + Math.floor(((marge - 16)/2));
    return[["Dommage",nbBls+" Bls KO 5"]];
}

function sendResultToChat(who, result) {

    const torgColor="#e7f106";
    
    const colorLine1="#b6ab91";
    const colorLine2="#cec7b6";
    
    const divHeaderStyle = "<div style='font-family: Impact; font-size: 1.2em; line-height: 1.2em; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 2px; text-align: center; vertical-align: middle; margin: 0px; padding: 2px 0px 0px 0px; border: 1px solid #000000; border-radius: 5px 5px 0px 0px; color: #000000; text-shadow: -1px -1px 0 #ffffff , 1px -1px 0 #ffffff , -1px 1px 0 #ffffff , 1px 1px 0 #ffffff; background-color: "+ torgColor +"; background-image: linear-gradient( rgba( 255 , 255 , 255 , .3 ) , rgba( 255 , 255 , 255 , 0 ) )';>";
    const spanSubTitleStyle = "<span style='font-family: tahoma; font-size: 13px; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 1px';>";
    const divLineStyle = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000;'>";
    const divLastLineStyle = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-radius: 0px 0px 5px 5px;'>";
    let Content = divHeaderStyle + result.title + "<br/>";
    
    if (result.subtitle !== undefined) {
        Content += spanSubTitleStyle + result.subtitle + "</span>";
    }
        
    Content += "</div>";
    
    for  (var i = 0; i < result.infoList.length; i++) { 
        let lineStyle;
    
        if (i==result.infoList.length-1) {
            lineStyle = (i % 2 ==1 || result.infoList.length==1 ) ? divLastLineStyle.replace("|color|",colorLine1) : divLineStyle.replace("|color|",colorLine2);
        } else {
            lineStyle = (i % 2 ==1) ? divLineStyle.replace("|color|",colorLine1) : divLineStyle.replace("|color|",colorLine2);
        }
        if (result.infoList[i][0].startsWith("!")) {
            Content += lineStyle + result.infoList[i][1] + "</div>"
        } else {
            Content += lineStyle + "<strong>" + result.infoList[i][0] + "</strong> " + result.infoList[i][1] +  "</div>"
        }
    }

    sendChat(who,Content); 
}