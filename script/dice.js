var jukeBoxList;

on("ready", function() {
    jukeBoxList = findObjs({ type: 'jukeboxtrack'});
});

on("chat:message", function(msg) {
    if (msg.type == "api") {
        //log(msg.content);
        if(msg.content.indexOf("!tDice") !== -1) {
            let dice = rollTorgDice().toString();
            let res = {
                title:`${msg.who} jette un dès`,
                infoList:[["resultat",dice]]
            }
            sendResultToChat(msg.who, res);
        }
        if(msg.content.indexOf("!tScore") !== -1) {
            let dice = rollTorgDice();
            let score = diceToScore(dice).toString();
            let res = {
                title:`${msg.who} obtient un score`,
                infoList:[["resultat",score]]
            }
            sendResultToChat(msg.who, res);
        }
        if (msg.content.indexOf("!tAttack") !== -1) {
            let parameters = getParameters(msg.content);
            if (parameters.sound) {
                //log('sound:'+parameters.sound);
                playSoundFX(parameters.sound);
            }
            let res = attack(parameters);
            sendResultToChat("", res);
        }
        if (msg.content.indexOf("!tResetToken") !== -1) {
            //log(msg.content);
            let tokenId = msg.content.split("--tokenId")[1].trim();
            if (tokenId) {
                resetToken(tokenId);
            }
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
        if (contentElement.indexOf('+') !== -1) {
            let numberValue = contentElement.split('+').reduce( (prev, cur) => prev + parseInt(cur), 0);
            if (isNaN(numberValue)) {
                parameterSet[parameterName] = contentElement.trim();
            } else {
                parameterSet[parameterName] = numberValue;
            }

        } else {
            let numberValue = parseInt(contentElement);
            if (isNaN(numberValue)) {
                parameterSet[parameterName] = contentElement.trim();
            } else {
                parameterSet[parameterName] = numberValue;
            }
        }
    })
    return parameterSet;
}


function rollTorgDice(blocked) {
    blocked = blocked || false;
    const DICE = 20;
    let dice = Math.floor(Math.random() * Math.floor(DICE))+1;
    if (!blocked && (dice === 10 || dice === 20)) {
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

function attack(parameters) {
    let result = {};
    let attackerTokenId = parameters.attackerTokenId;
    let defenderTokenId = parameters.defenderTokenId;
    let skillNumber = parameters.skillNumber;
    let diffModifier = parameters.diffModifier;
    let weaponNumber = parameters.weaponNumber;
    let previousDice = parameters.previousDice || 0;
    let distance = parameters.dist || 0;
    let blocked = parameters.blocked || false;
    let extraDice = parameters.extraDice || false;

    let attackerToken = getObj("graphic",attackerTokenId);
    let defenderToken = getObj("graphic",defenderTokenId);
    let attacker = attackerToken.get("represents");
    let defender = defenderToken.get("represents");

    let attackerName = getAttrByName(attacker,"Name");
    let defenderName = getAttrByName(defender,"Name");
    let defenderHasPossibility = parseInt(getAttrByName(defender, "Possib")) > 0;
    
    let attackerSkill = computeSkill(attacker, skillNumber);
    let difficulty = computeSkill(defender, 1) + diffModifier;

    let weaponBase = parseInt(getAttrByName(attacker,`Weapon${weaponNumber}Mod`));
    let weaponMax = parseInt(getAttrByName(attacker,`Weapon${weaponNumber}Value`));

    let toughness = parseInt(getAttrByName(defender,"TOU"));
    let armorBase = parseInt(getAttrByName(defender,"Armor1Mod"));
    let armorMax = parseInt(getAttrByName(defender,"Armor1Value"));
    

    log(`${attackerName} attaque avec skill:${attackerSkill}, weapon:${weaponBase}, weaponMax:${weaponMax})`);
    log(`${defenderName} défend avec difficulty:${difficulty}, armorBase:${armorBase}, armorMax:${armorMax}, END:${toughness}`);
    log(`option (blocked:${blocked}), (exra:${extraDice})`);
    let dice = rollTorgDice(blocked) + previousDice;
    if (extraDice) {
        log('extraDice');
        dice += rollTorgDice(blocked);
    }
    result.title = `${attackerName} attaque ${defenderName}`;
    result.infoList = [["Dès obtenu", dice]];
    let score = diceToScore(dice);
    if (isSuccess(score, attackerSkill, difficulty + distance)) {
        result.subtitle = `${defenderName} a été touché`;
        result.infoList.push(["Score obtenu",score]);
        let damage;
        log(`has defender possibility : ${defenderHasPossibility}`);
        if (defenderHasPossibility) {
            damage = computeDamagePossibilite(weaponBase, weaponMax, score-distance, toughness, armorBase, armorMax);
        } else {
            damage = computeDamageNorm(weaponBase, weaponMax, score-distance, toughness, armorBase, armorMax);
        }
        applyDamageToToken(damage, defenderTokenId);
        updateTokenGraphicalAspec(defenderTokenId);
        result.infoList.push(damageToInfoList(damage));
    } else {
        result.subtitle = `${defenderName} a esquivé l'attaque`;
        result.infoList.push(["Score obtenu",score]);
    }
    return result;
}

function computeSkill(character, skillNumber) {
    let characterSkillComp = getAttrByName(character,"Skill"+skillNumber+"Mod").replace(/[@{}]+/g, '');
    let characterSkillCompValue = parseInt(getAttrByName(character, characterSkillComp));
    let characterSkillAdds = parseInt(getAttrByName(character,"Skill"+skillNumber+"Adds"));
    return characterSkillCompValue + characterSkillAdds;
}

function isSuccess(score, skill, difficulty) {
    return ((score + skill) >= difficulty);
}

function computeDamagePossibilite(weaponBase, weaponMax, score, toughness, armorBase, armorMax) {
    let attack = weaponBase + score;
    //log(`attack:${attack}`);
    if (weaponMax) {
        attack = Math.min(attack, weaponMax);
        //log(`attack:${attack} with weaponMax (${weaponMax})`);
    }
    let defense = toughness + armorBase;
    //log(`defense:${defense}`);
    if (armorMax) {
        defense = Math.min(defense, armorMax);
        //log(`defense:${defense} with armorMax (${armorMax})`);
    }
    let marge = attack - defense;
    //log(`marge:${marge}`);
    return margeToDamageForCharacterWithPossibility(marge);
}

function computeDamageNorm(weaponModifier, weaponMax, score, toughness, armorBase, armorMax) {
    let attack = weaponModifier + score;
    if (weaponMax) {
        attack = Math.min(attack, weaponMax);
    }
    let defense = toughness + armorBase;
    if (armorMax) {
        defense = Math.min(defnse, armorMax);
    }
    let marge = attack - defense;
    return margeToDamageForNormCharacter(marge);
}

function margeToDamageForCharacterWithPossibility(marge) {
    let damage = {
        K: false,
        O:false,
        KO:false,
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
    if (marge == 6)  {
        damage.choc = 2;
        damage.O = true;
        damage.chute = true;
    }
    if ((marge == 7) || (marge == 8)) {
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
        KO:false,
        bls:0,
        choc:0,
        chute:false
    }
    if (marge == 0) {
        damage.choc = 1;
    }
    if (marge == 1) {
        damage.O = true;
        damage.choc = 1;
    }
    if (marge == 2) {
        damage.choc = 1;
        damage.K = true;
    }
    if (marge == 3) {
        damage.choc = 2;
        damage.O = true;
    }
    if (marge == 4) {
        damage.choc = 3;
        damage.O = true;
    }
    if (marge == 5) {
        damage.choc = 3;
        damage.K = true;
    }
    if (marge == 6) {
        damage.choc = 4;
        damage.KO = true;
        damage.chute = true;
    }
    if (marge == 7) {
        damage.choc = 5;
        damage.KO = true;
        damage.chute = true;
    }
    if (marge == 8) {
        damage.choc = 7;
        damage.KO = true;
        damage.bls = 1;
    }
    if (marge == 9) {
        damage.choc = 9;
        damage.KO = true;
        damage.bls = 1;
    }
    if (marge == 10) {
        damage.choc = 10;
        damage.KO = true;
        damage.bls = 1;
    }
    if (marge == 11) {
        damage.choc = 11;
        damage.KO = true;
        damage.bls = 2;
    }
    if (marge == 12) {
        damage.choc = 12;
        damage.K = true;
        damage.O = true;
        damage.bls = 2;
    }
    if (marge == 13) {
        damage.choc = 13;
        damage.K = true;
        damage.O = true;
        damage.bls = 3;
    }
    if (marge == 14) {
        damage.choc = 14;
        damage.K = true;
        damage.O = true;
        damage.bls = 3;
    }
    if (marge == 15) {
        damage.choc = 15;
        damage.K = true;
        damage.O = true;
        damage.bls = 4;
    }
    if (marge > 15) {
        damage.choc = 15;
        damage.K = true;
        damage.O = true;
        let nbBls = 3 + Math.floor(((marge - 16)/2));
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
        if (ko == 0) {
            ko = 1;
        } else if (ko == 2) {
            ko = 3;
        }
    }
    if (damage.O) {
        if (ko == 0) {
            ko = 2;
        } else if (ko == 1) {
            ko = 3;
        }
    }
    if (damage.KO) {
        switch (ko) {
            case 0 : ko = 1;
                break;
            case 1 : ko = 3;
                break;
            case 2 : ko = 3;
                break;
        }
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
        if (damage.KO) {
            damageString += "K/O";
        }
        damageString += " "+damage.choc;
        return ["Dommage",damageString];
    }
}

function updateTokenGraphicalAspec(tokenId) {
    const BLS_BAR = "bar3_value";
    const SHOCK_BAR = "bar1_value";
    const SHOCK_MAX = "bar1_max";
    const KO_BAR = "bar2_value";

    let token = getObj("graphic",tokenId);
    let bls = parseInt(token.get(BLS_BAR));
    let shock = parseInt(token.get(SHOCK_BAR));
    let shockMax = parseInt(token.get(SHOCK_MAX));
    let ko = parseInt(token.get(KO_BAR));

    //log(`update graphical (bls:${bls}) (shock:${shock})`)

    if (bls >= 4) {
        token.set("status_dead", true);
        token.set("status_death-zone", true);
    }
    if (shock >= shockMax) {
        token.set("status_dead", true);
        token.set("status_sleepy", true);
    }
    if (ko >= 3) {
        token.set("status_dead", true);
        token.set("status_sleepy", true);
    }
    if (bls >= 1) {
        token.set("status_red", true);
    }
    if (shock >= 1) {
        token.set("status_green", true);
    }
    if (ko >= 1) {
        token.set("status_blue", true);
    }

}


function resetToken(tokenId) {
    //log(`resetToken: ${tokenId}`);
    const BLS_BAR = "bar3_value";
    const BLS_MAX = "bar3_max";
    const SHOCK_BAR = "bar1_value";
    const SHOCK_MAX = "bar1_max";
    const KO_BAR = "bar2_value";
    const KO_MAX = "bar2_max";

    let token = getObj("graphic",tokenId);
    let character = token.get("represents");
    
    let shockMax = parseInt(getAttrByName(character,"TOU"));

    token.set(BLS_BAR,0);
    token.set(BLS_MAX,4);
    token.set(SHOCK_BAR,0);
    token.set(SHOCK_MAX,shockMax);
    token.set(KO_BAR,0);
    token.set(KO_MAX,3);
    token.set("status_dead", false);
    token.set("status_death-zone", false);
    token.set("status_sleepy", false);
    token.set("status_red", false);
    token.set("status_green", false);
    token.set("status_blue", false);
}


function sendResultToChat(who, result) {
    const TORG_COLOR="#e7f106";
    const COLOR_EVEN="#b6ab91";
    const COLOR_ODD="#cec7b6";
    const DIV_CLEAR="<div class='spacer'></div><div style='clear: both; margin-left: -7px; border-radius: 5px';>";
    const DIV_HEADER = "<div style='font-family: Impact; font-size: 1.2em; line-height: 1.2em; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 2px; text-align: center; vertical-align: middle; margin: 0px; padding: 2px 0px 0px 0px; border: 1px solid #000000; border-radius: 5px 5px 0px 0px; color: #000000; text-shadow: -1px -1px 0 #ffffff , 1px -1px 0 #ffffff , -1px 1px 0 #ffffff , 1px 1px 0 #ffffff; background-color: "+ TORG_COLOR +"; background-image: linear-gradient( rgba( 255 , 255 , 255 , .3 ) , rgba( 255 , 255 , 255 , 0 ) )';>";
    const SPAN_SUBTITLE = "<span style='font-family: tahoma; font-size: 13px; font-weight: normal; font-style: normal; font-variant: normal; letter-spacing: 1px';>";
    const DIV_LINE = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000;'>";
    const DIV_LAST_LINE = "<div style='color: #000000; background-color: |color|; line-height: 1.1em; vertical-align: middle; font-family: helvetica; font-size: 14px; font-weight: normal; font-style: normal; text-align: left; padding: 4px 5px 2px 5px; border-left: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-radius: 0px 0px 5px 5px;'>";

    let content = DIV_CLEAR + DIV_HEADER + result.title + "<br/>";
    
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

    content += "</div>";

    setTimeout(() => {
        sendChat("","/desc " + content); 
    },250);
    log('attack is done');
    
}

function playSoundFX(soundName) {
    if (jukeBoxList) {
        let sound = jukeBoxList.find(jb => jb.get('title') === soundName);
        if (sound != undefined) {
            sound.set({playing:true,softstop:false,level:30});
        }
    }
}