on("chat:message", function(msg) {
    if (msg.type == "api") {
        log(msg.content);
        if(msg.content.indexOf("!tDice") !== -1) {
            let dice = rollTorgDice().toString();
            sendChat(msg.who, dice);
        }
        if(msg.content.indexOf("!tScore") !== -1) {
            let dice = rollTorgDice();
            let score = diceToScore(dice).toString();
            sendChat(msg.who, score);
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

    } else {
        result.success = false;
        
    }

}

function isSuccess(score, skill, difficulty) {
    return score + skill >= difficulty;
}