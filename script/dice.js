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
            log(msg.content);
            let parameters = getParameters(msg.content);
            if (parameters.sound) {
                log('sound:'+parameters.sound);
                playSoundFX(parameters.sound);
            }
            let res = attackNPC(parameters);
            sendResultToChat(msg.who, res);
        }
        if (msg.content.indexOf("!tAttackPlayer") !== -1) {
            let parameters = getParameters(msg.content);
            if (parameters.sound) {
                log('sound:'+parameters.sound);
                playSoundFX(parameters.sound);
            }
            let res = attackPlayer(parameters);
            sendResultToChat(msg.who, res);
        }
    }
});

function getParameters(content) {
    let parameterSet = {}
    let contentList = content.split('--');
    contentList.shift();//remove script name
    contentList.forEach(contentElement => {
        let subContentList = contentElement.split(' ');
        let parameterName = subContentList.shift().trim();
        contentElement = subContentList.join(' ');
        let numberValue = parseInt(contentElement);
        if (isNaN(numberValue)) {
            if (contentElement.indexOf('+') !== -1) {
                numberValue = contentElement.split('+').reduce( (prev, cur) => prev + parseInt(cur), 0);
                if (isNaN(numberValue)) {
                    parameterSet[parameterName] = contentElement.trim();
                } else {
                    parameterSet[parameterName] = numberValue;
                }

            } else {
                parameterSet[parameterName] = contentElement.trim();
            }
        } else {
            parameterSet[parameterName] = numberValue;
        }
    })
    return parameterSet;
}


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

function attackNPC(parameters) {
    let result = {};
    let attackerSkill = parameters.skill;
    let difficulty = parameters.diff;
    let weaponBase = parameters.weaponBase;
    let weaponMax = parameters.weaponMax;
    let tokenToughness = parameters.targetTOU;
    let tokenId = parameters.targetToken;

    log(`attackNPC(${attackerSkill}, ${difficulty}, ${weaponBase}, ${weaponMax}, ${tokenToughness}, ${tokenId})`);

    //log(tokenId);
    let npcToken = getObj("graphic",tokenId);
    let npcId = npcToken.get("represents");
    let targetHasPossibility = parseInt(getAttrByName(npcId, "Possib")) > 0;
    let npcName = getAttrByName(npcId,"Name");

    let dice = rollTorgDice();
    result.infoList = [["Dès obtenu", dice]];
    let score = diceToScore(dice);
    if (isSuccess(score, attackerSkill, difficulty)) {
        result.title = `${npcName} a été touché`;
        result.infoList.push(["Score obtenu",score]);
        let damage;
        if (targetHasPossibility) {
            damage = computeDamagePossibilite(weaponBase, weaponMax, score, tokenToughness);
        } else {
            damage = computeDamageNorm(weaponBase, weaponMax, score, tokenToughness);
        }
        applyDamageToToken(damage, tokenId);
        result.infoList.push(damageToInfoList(damage));
    } else {
        result.title = `${npcName} a esquivé l'attaque`;
        result.infoList.push(["Score obtenu",score]);
    }
    return result;
}

function attackPlayer(parameters) {
    let result = {};
    let attackerSkill = parameters.skill;
    let difficulty = parameters.diff;
    let weaponBase = parameters.weaponBase;
    let weaponMax = parameters.weaponMax;
    let playerToughness = parameters.playerTOU;
    log(`attackPlayer(${attackerSkill}, ${difficulty}, ${playerName}, ${weaponBase}, ${weaponMax}, ${playerToughness})`);
    let dice = rollTorgDice();
    result.infoList = [["Dès obtenu", dice]];
    let score = diceToScore(dice);
    if (isSuccess(score, attackerSkill, difficulty)) {
        result.title = `${playerName} a été touché`;
        result.infoList.push(["Score obtenu",score]);
        let damage = computeDamagePossibilite(weaponBase, weaponMax, score, playerToughness);
        log(JSON.stringify(damage));
        result.infoList.push(damageToInfoList(damage));
    } else {
        result.title = `${playerName} a esquivé l'attaque`;
        result.infoList.push(["Score obtenu",score]);
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

function computeDamageNorm(weaponModifier, weaponMax, score, playerToughness) {
    let marge = Math.min(weaponModifier + score , weaponMax) - playerToughness;
    return margeToDamageForNormCharacter(marge);
}

function margeToDamageForCharacterWithPossibility(marge) {
    let damage = {
        K: false,
        O:false,
        bls:0,
        choc:0,
        chute:false
    }
    if (marge == 1) {
        damage.choc = 1;
    }
    if (marge == 2) {
        damage.choc = 1;
        damage.O = true;
    }
    if (marge == 3) {
        damage.choc = 1;
        damage.K = true;
    }
    if (marge == 4) {
        damage.choc = 2;
    }
    if (marge == 5) {
        damage.choc = 2;
        damage.O = true;
    }
    if ((marge == 6) || (marge == 7)) {
        damage.choc = 2;
        damage.O = true;
        damage.chute = true;
    }
    if (marge == 8) {
        damage.choc = 2;
        damage.K = true;
        damage.chute = true;
    }
    if (marge == 9) {
        damage.choc = 3;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 10) {
        damage.choc = 4;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 11) {
        damage.choc = 4;
        damage.O = true;
        damage.bls = 1;
    }
    if (marge == 12) {
        damage.choc = 5;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 13) {
        damage.choc = 4;
        damage.O = true;
        damage.bls = 2;
    }
    if (marge == 14) {
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = 2;
    }
    if (marge == 15) {
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = 3;
    }
    if (marge > 15) {
        let nbBls = 3 + Math.floor(((marge - 16)/2));
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = nbBls;
    }
    return damage;
}


function margeToDamageForNormCharacter(marge) {
    let damage = {
        K: false,
        O:false,
        bls:0,
        choc:0,
        chute:false
    }
    if (marge == 0) {
        damage.choc = 1;
    }
    if (marge == 1) {
        damage.choc = 1;
    }
    if (marge == 2) {
        damage.choc = 1;
        damage.O = true;
    }
    if (marge == 3) {
        damage.choc = 1;
        damage.K = true;
    }
    if (marge == 4) {
        damage.choc = 2;
    }
    if (marge == 5) {
        damage.choc = 2;
        damage.O = true;
    }
    if ((marge == 6) || (marge == 7)) {
        damage.choc = 2;
        damage.O = true;
        damage.chute = true;
    }
    if (marge == 8) {
        damage.choc = 2;
        damage.K = true;
        damage.chute = true;
    }
    if (marge == 9) {
        damage.choc = 3;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 10) {
        damage.choc = 4;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 11) {
        damage.choc = 4;
        damage.O = true;
        damage.bls = 1;
    }
    if (marge == 12) {
        damage.choc = 5;
        damage.K = true;
        damage.bls = 1;
    }
    if (marge == 13) {
        damage.choc = 4;
        damage.O = true;
        damage.bls = 2;
    }
    if (marge == 14) {
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = 2;
    }
    if (marge == 15) {
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = 3;
    }
    if (marge > 15) {
        let nbBls = 3 + Math.floor(((marge - 16)/2));
        damage.choc = 5;
        damage.K = true;
        damage.O = true;
        damage.bls = nbBls;
    }
    return damage;
}

function applyDamageToToken(damage, tokenId) {
    const BLS_BAR = "bar3_value";
    const SHOCK_BAR = "bar1_value";
    const KO_BAR = "bar2_value";

    let token = getObj("graphic",tokenId);
    let bls = parseInt(token.get(BLS_BAR));
    let shock = parseInt(token.get(SHOCK_BAR));
    let ko = parseInt(token.get(KO_BAR));

    token.set(BLS_BAR, bls + damage.bls);
    token.set(SHOCK_BAR, shock + damage.choc);
    if (damage.K) {
        ko += ((ko%2) + 1) % 2;
    }
    if (damage.O) {
        ko += ((ko%4) + 2) % 4;
    }
    token.set(KO_BAR, ko);
}

function damageToInfoList(damage) {
    if (damage.choc == 0) {
        return ["!","Aucun dommage"];
    } else {
        let damageString = "";
        if (damage.bls > 0) {
            damageString += damage.bls+" Bls ";
        }
        if (damage.chute) {
            damageString += "Chute ";
        }
        if (damage.K) {
            damageString += "K";
        }
        if (damage.O) {
            damageString += "O";
        }
        damageString += " "+damage.choc;
        return ["Dommage",damageString];
    }
}


function sendResultToChat(who, result) {
    const TORG_COLOR="#e7f106";
    const COLOR_EVEN="#b6ab91";
    const COLOR_ODD="#cec7b6";
    const DIV_HEADER = "<div style='font-family: Impact; font-size: 1.2em; line-height: 1.2em; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 2px; text-align: center; vertical-align: middle; margin: 0px; padding: 2px 0px 0px 0px; border: 1px solid #000000; border-radius: 5px 5px 0px 0px; color: #000000; text-shadow: -1px -1px 0 #ffffff , 1px -1px 0 #ffffff , -1px 1px 0 #ffffff , 1px 1px 0 #ffffff; background-color: "+ TORG_COLOR +"; background-image: linear-gradient( rgba( 255 , 255 , 255 , .3 ) , rgba( 255 , 255 , 255 , 0 ) )';>";
    const SPAN_SUBTITLE = "<span style='font-family: tahoma; font-size: 13px; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 1px';>";
    const DIV_LINE = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000;'>";
    const DIV_LAST_LINE = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-radius: 0px 0px 5px 5px;'>";

    let content = DIV_HEADER + result.title + "<br/>";
    
    if (result.subtitle !== undefined) {
        content += SPAN_SUBTITLE + result.subtitle + "</span>";
    }
        
    content += "</div>";

    result.infoList.forEach( (info, i ) => {
        let color = COLOR_ODD;
        if ((i % 2) || result.infoList.length == 1) {
            color = COLOR_EVEN;
        }
        let line;
        if ((i+1) === result.infoList.length) {
            line = DIV_LAST_LINE.replace("|color|",color)
        } else {
            line = DIV_LINE.replace("|color|",color)
        }
        if (result.infoList[i][0].startsWith("!")) {
            content += line + result.infoList[i][1] + "</div>"
        } else {
            content += line + "<strong>" 
                        + result.infoList[i][0] 
                        + "</strong> " 
                        + result.infoList[i][1] 
                        + "</div>"
        }
    })
    sendChat(who,content); 
}

function playSoundFX(soundName) {
    let jukeBoxList = findObjs({ type: 'jukeboxtrack'});
    let sound = jukeBoxList.find(jb => jb.get('title') === soundName);
    if (sound != undefined) {
        sound.set({playing:true,softstop:false,level:30});
    }
}