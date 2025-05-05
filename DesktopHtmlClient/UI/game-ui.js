import { playerLeave, getPreFlopAutoFold, shufflingVerificationReport, sideGameRandomString, updatePlayerSetting } from "../socket-client";
import { modes, Table } from "./table-ui";
import { getPlayerSeat, myTotalMoneyInGame } from '../services/table-server';
import { tableSubscribe } from '../services/table-server';
import { BuyInUI } from "./buyin-ui";
import { MainUI } from "./main-ui";
import { ActionUI } from "./action-ui";
import { tableSettings, myInfo, myMoneyInGame } from "../services/table-server";
import { Sound } from "./audio";
import { toggleCheckbox } from "./checkbox";
import { updatCurrency } from "./money-display";
import { SidebetUI } from "./sidebet-ui";
import { verifySeed } from '../services/utils-server';
import { initializeDeck, CardShuffler } from './card-ui';
import { getMessage } from "./language-ui";

let previousMainPlayerIndex = -1;
let lastTurnSeat = -1;
let prevRoundState = "None";
let prevRound;

const mainPlayerIndex = 5;
const table = new Table();
const buyInUI = new BuyInUI();
const mainUI = new MainUI(buyInUI);
const sidebetUI = new SidebetUI(mainUI);
export const actionUI = new ActionUI();
const sound = new Sound();
const cardShuffler = new CardShuffler();

const showBBCheckbox = $("#showAsBBCheckbox")[0];
const showSUDCheckbox = $("#showAsSUDCheckbox")[0];
const showAsBBCheckbox = $("#showAsBBCheckbox")[0];
const shuffleVerificationButtonCheckboxe = $("#shuffleVerificationButton")[0];
const themeColorMenu = $("#themeColor .dropdown-menu li");
const DisplayCards = $("#DisplayCards")[0];

showBBCheckbox.addEventListener('change', () => {
    if (showBBCheckbox.checked)
        toggleCheckbox(showSUDCheckbox, false);

    setShowInBB(showBBCheckbox.checked);
    updatePlayerSetting('showBB', showBBCheckbox.checked);
});

showSUDCheckbox.addEventListener('change', () => {
    if (showSUDCheckbox.checked)
        toggleCheckbox(showBBCheckbox, false);

    setShowInUSD(showSUDCheckbox.checked);
    updatePlayerSetting('showSUD', showSUDCheckbox.checked);
});

for (const button of themeColorMenu) {
    button.addEventListener('click', () => {
        $(themeColorMenu).removeClass("active");
        const value = button.dataset.value;
        button.classList.add("active");
        updatePlayerSetting('themeColor', value);
        $("#themeColor").find("button")[0].innerText = button.innerText;
        $("#selectedThemeColor")[0].className = "color-indicator " + value;
        document.body.className = value;
    });
}




shuffleVerificationButtonCheckboxe.addEventListener('change', () => {
    updatePlayerSetting('shuffleVerification', shuffleVerificationButtonCheckboxe.checked);
});
DisplayCards.addEventListener('change', () => {
    updatePlayerSetting('DisplayCards', DisplayCards.checked);
});

const preFlopAutoFoldCheckboxes = $(".preFlopAutoFold .checkbox")[0];
preFlopAutoFoldCheckboxes.addEventListener('change', setPreFlopAutoFoldData);




let showInBB = false;
showBBCheckbox.checked = false;

let showInUSD = false;
showSUDCheckbox.checked = false;

const autoMuckCheckbox = $("#autoMuckCheckbox")[0];
autoMuckCheckbox.addEventListener('change', () => {
    updatePlayerSetting('autoMuck', autoMuckCheckbox.checked);
    setAutoMuck(autoMuckCheckbox.checked);
});
let autoMuckCard = false;

function setAutoMuck(value) {
    autoMuckCard = value;
}

function setShowInBB(value) {
    showInBB = value;
    actionUI.setShowInBB(value);
    table.setShowInBB(value);
}

function setShowInUSD(value) {
    showInUSD = value;
    actionUI.setShowInUSD(value);
    table.setShowInUSD(value);
}

function setPreFlopAutoFoldData() {
    if (preFlopAutoFoldCheckboxes.checked && tableSettings.gameType == "nlh") {

        getPreFlopAutoFold(preFlopAutoFoldCheckboxes.checked, (data) => {
            data = JSON.parse(data);

            if (data.status == true) {
                mainUI.setPlayerAutoFoldCards(data.AutoFoldCards);
                const playerCards = table.getTurnPlayerCards(getPlayerSeat());
                const activeSeats = table.getActiveSeats();
                mainUI.doPreFlopAutoFold(preFlopAutoFoldCheckboxes, playerCards, activeSeats);
                return true;
            }
        });
    } else {
        mainUI.setPlayerAutoFoldCards([]);
    }
}



function onLeaveClick() {
    playerLeave();
}

function onPlayerLeave(res) {
    table.setMode(modes.None);
    actionUI.showActionUI(false);

    if (res.type === 'tournament_leave') {
        mainUI.showTournamentResult(res.hasWin, res.prize, res.rank, res.isRegister, res.register_amount, res.id, res.tournament_id);
    } else if (res.type === 'double_browser_leave') {
        mainUI.showDoubleLoginMsg(res.msg);
    }
}

function onPlayerInfo(playerInfo) {
    $("#uiTable,.side-bet_div").show();
    $(".loader").hide();
    mainUI.setPlayerName(playerInfo);
}

function onTableSettings(settings) {
    var usdRate = parseFloat(settings.usdRate).toFixed(2);
    mainUI.setTableName(settings.name);
    mainUI.setTournamentName(settings.tournamentName);
    mainUI.setSmallBlind(settings.smallBlind);
    mainUI.setAnte(settings.ante);
    mainUI.setBigBlind(settings.bigBlind);
    actionUI.setBigBlind(settings.bigBlind);
    actionUI.setUsdRate(usdRate);
    //   mainUI.setCurrencyIcon();
    table.setBigBlind(settings.bigBlind);
    table.setUsdRate(usdRate);
    table.setCloseTable(settings.closeTable);
    table.setNumberOfSeats(settings.numberOfSeats);
    sidebetUI.setSidebetBB(settings.sidebetBB);
    sidebetUI.showPanel((settings.sideGameEnabled || settings.sideBetEnabled) && getPlayerSeat() >= 0, 1);
    sidebetUI.setSideGameStatus(settings.sideGameEnabled);
    sidebetUI.setSideBetStatus(settings.sideBetEnabled);
    sidebetUI.sideBetTabs();
    mainUI.setHandId(settings.handId);
    mainUI.showShuffleVerification(settings.isEncryptedShuffling);
    mainUI.setHeader(settings.mode == "tournament");
    let name = settings.mode == 'tournament' ? settings.tournamentName : settings.name;
    // settings.mode = settings.mode.charAt(0).toUpperCase() + settings.mode.slice(1);
    mainUI.setLogHead(settings.mode, settings.bigBlind, settings.smallBlind, settings.handId, name);

    if (settings.mode == "tournament") {
        mainUI.showLevel(true);
        mainUI.showTournamentTime(settings.timeDuration);
        mainUI.setLevelInfo(settings.level, settings.duration, settings.nextLevel, settings.nextSB, settings.nextBB, settings.nextAnte, settings.displayAnte, settings.displaySB, settings.displayBB);
        mainUI.showTrophyInfo(true);
        table.setSitVisible(false);

        // setShowDollarSign(false);
    } else {
        mainUI.showLevel(false);
        table.setSitVisible(true);
        showSUDCheckbox.parentElement.style.display = "flex";
        showAsBBCheckbox.parentElement.style.display = "flex";
        // setShowDollarSign(true);
    }
}

function onPlayerState(state) {
    switch (state) {
        case "Observing":
            table.setMode(modes.Observing);
            break;
        case "Joining":
            table.setMode(modes.Joining);
            break;
        case "Waiting":
        case "Playing":
        case "SitOut":
            table.setMode(modes.Playing);
            break;
    }


    table.clearTurn();
    actionUI.showActionUI(false);
    mainUI.showFoldToAnyBetCheckbox(state == "Playing");
    mainUI.showShareHand(state == "Playing");
    if (state !== "Joining")
        sidebetUI.toggleSideBetAndGame(state == "Waiting" || state == "SitOut");
    // mainUI.showFoldToAnyBetOption(state == "Playing");

    if (tableSettings.sideBetEnabled || tableSettings.sideGameEnabled) {
        sidebetUI.showPanel(state == "Waiting" || state == "Playing" || state == "SitOut");
        sidebetUI.sideBetTabs();
    }

    if (tableSettings.mode == "cash") {

        mainUI.showSitIn(state == "SitOut");
        mainUI.showWaitForBB(state == "Waiting");
        mainUI.showPreFlopAutoFold(tableSettings.gameType == "nlh");
        mainUI.showAutoFoldSetting(tableSettings.gameType == "nlh");
        // mainUI.setWaitForBB(true);
        mainUI.showSitOutNextHand(state == "Playing");
        mainUI.setSitOutNextHand(false);
        mainUI.showTipDealer(state == "Playing");

        if (getPlayerSeat() >= 0 && (state == "Playing" || state == "Waiting") && buyInUI.visible) {} else if (getPlayerSeat() >= 0 && state == "Joining") {
            showBuyIn();
        } else {
            hideBuyIn();
        }

        // actionUi.setShowDollarSign(true);
        // tableUi.setShowDollarSign(true);
    } else {
        mainUI.showWaitForBB(false);
        // mainUI.setWaitForBB(false);
        mainUI.showSitOutNextHand(false);
        mainUI.setSitOutNextHand(false);

        //     actionUi.setShowDollarSign(false);
        //     tableUi.setShowDollarSign(false);
        mainUI.showTipDealer(false);
        mainUI.showPreFlopAutoFold(false);
        mainUI.showAutoFoldSetting(false);
    }
}

export function showBuyIn() {
    buyInUI.showBuyIn(true);
    buyInUI.setBuyInPanelInfo(tableSettings.minBuyIn);
}
export function removeMuckedFlag() {
    table.removeMuckedFlag();
}

function hideBuyIn() {
    buyInUI.showBuyIn(false);
}

function onTableStatus(status) {
    document.hasFocus();
    let mainPlayerSeat = getPlayerSeat();
    if(mainPlayerSeat != -1){
        let isBet = false;
        let isCallButton = false;
        let lastBet = 0;
        for (let index = 0; index < status.seats.length; index++) {
            const currentValue = status.seats[index];
            if(mainPlayerSeat !== index && currentValue.lastBet > 0){
                if (status.state == 'PreFlop' && !['sb', 'bb'].includes(currentValue.lastAction)) {
                    isBet = true;
                } else {
                    isBet = false;
                }

                if(status.seats[mainPlayerSeat].lastBet < currentValue.lastBet  && status.seats[mainPlayerSeat].lastAction !== 'fold' && ['call', 'raise'].includes(currentValue.lastAction))
                {
                    console.log(currentValue);
                    isCallButton = true;
                    lastBet = Math.max(currentValue.lastBet,lastBet);
                }
                   
                
            }
        }

        mainUI.setCallButton((isCallButton) ? lastBet :  isCallButton, status.seats[mainPlayerSeat].lastBet);
        actionUI.showBetButton(isBet);
    }
    let firstSeat = Math.max(0, mainPlayerSeat);
    if (mainPlayerSeat != previousMainPlayerIndex) {
        if (previousMainPlayerIndex != -1 && mainPlayerSeat == -1) {
            table.restorePlayerWrappers();
            mainUI.showBackLobbyButton(true);
        } else {
            table.rotatePlayerWrappers(mainPlayerSeat, mainPlayerIndex);
            mainUI.showBackLobbyButton(false);
        }
        previousMainPlayerIndex = mainPlayerSeat;
    }

    if (mainPlayerSeat != -1) {
        mainUI.setHandResult(status.seats[firstSeat].handRank, (status.state != prevRoundState) ? status.cards.length * 450 : 0);
        mainUI.setPlayStatus(true);
        mainUI.showTipDealer(status.seats[mainPlayerSeat].state === 'Playing' && tableSettings.mode == "cash");
        mainUI.showLeaveGameButton((status.seats[mainPlayerSeat].lastAction === 'fold' || status.seats[mainPlayerSeat].state !== 'Playing') && tableSettings.mode == "cash");
        sidebetUI.setFoldStatusAndSideGamePanel(status.seats[mainPlayerSeat].lastAction === 'fold');
        mainUI.showMultiTableButton(true);
    } else {
        mainUI.setHandResult(false);
        mainUI.setPlayStatus(false);
        mainUI.showTipDealer(false);
        mainUI.showLeaveGameButton(false);
        mainUI.showMultiTableButton(false);
    }

    if (mainPlayerSeat != -1 && status.seats[mainPlayerSeat].state === 'Playing' && status.state == prevRoundState) {
        const mainPlayerBet = status.seats[mainPlayerSeat].lastBet || 0;
        const isAutoFold = status.seats.find((currentValue, index) => {
            return currentValue.state === "Playing" && mainPlayerSeat != index && mainPlayerBet < currentValue.lastBet  && !['sb', 'bb'].includes(currentValue.lastAction);
        });
        mainUI.setFoldToAnyBetText(isAutoFold);
        mainUI.showautoCheckButton(status.seats[mainPlayerSeat].lastAction != 'sb');
        mainUI.showFoldToAnyBetOption(status.state != "Showdown" && ['sb', 'bb', undefined].includes(status.seats[mainPlayerSeat].lastAction));
    } else {
        mainUI.showFoldToAnyBetOption(false);
    }
    if (tableSettings.mode == "cash" && mainPlayerSeat >= 0) {
        mainUI.showAddChips(true);

        if (status.seats[mainPlayerSeat].state === 'SitOut') {
            mainUI.showSitOut(false);
        } else {
            mainUI.showSitOut(true);
        }


    } else {
        mainUI.showAddChips(false);
        mainUI.showSitOut(false);
    }

    if (status.state != "Showdown")
        mainUI.showShowCardsButton(false);

    if (status.state == "None" || status.state == "PreFlop") {
        table.setShowSbBbButtons(true);
    } else {
        table.setShowSbBbButtons(false);
    }

    // mainUI.showWaitList(!status.seats.find(seat => seat.state === "Empty") && mainPlayerSeat == -1);

    table.setFirstSeat(firstSeat);
    table.setSeats(status.seats, status.state);
    table.setButtons(status.seatOfDealer, status.seatOfSmallBlind, status.seatOfBigBlind);
    table.setTableCards(status.cards);
    table.setTotalPot(status.pot);
    table.setStreetPot(status.streetPot);

    if (lastTurnSeat != -1 && status.seats[lastTurnSeat].hasOwnProperty('lastAction')) {
        if (status.seats[lastTurnSeat].lastAction == "raise" && mainPlayerSeat != lastTurnSeat)
            checkAutoCheckFoldValid(status.seats, true);
    }

    table.clearTurn();
    mainUI.showBreakTime(status.breakTime, status.duration);

    if (status.state != prevRoundState) {
        updatCurrency();
        sidebetUI.setHideSideBetOption(true);
        if (status.state == "PreFlop") {
            sound.playCardDealt();
            window.clearTableCards();
        } else if (status.state == "Flop") {
            sound.playFlop();
        } else if (status.state == "Turn" || status.state == "River") {
            sound.playTurnRiver();
        } else if (status.state == "Showdown") {
            sound.playEndStreet();
            checkAutoCheckFoldValid(status.seats, false);
        }

        if (status.state != "Showdown") {
            checkAutoCheckFoldValid(status.seats, true);
        }
    }

    if (status.state == "Showdown") {
        table.removePlayerActionLabel();
    }

    if (status.round != prevRound) {
        //sound.playCardDealt();
        table.removeMuckedFlag();
    }

    prevRoundState = status.state;
    prevRound = status.round;
}

function checkAutoCheckFoldValid(seats, isShow) {
    let isValid = true;
    const playerSeat = getPlayerSeat();

    if (playerSeat == -1)
        isValid = false;
    else {
        if (seats[playerSeat].state != "Playing" || seats[playerSeat].fold || seats[playerSeat].lastAction == "allin")
            isValid = false;
    }

    if (!isValid) {
        mainUI.showAutoCheckOptions(false);
        return;
    }

    mainUI.showAutoCheckOptions(isShow);
}

function onRoundResult(roundResult) {
    table.showRoundResult(roundResult);
    table.AutoTip(roundResult);
    mainUI.resetFoldToAnyBetOption();
    mainUI.roundResult();

    if (getPlayerSeat() == -1) {
        sidebetUI.removeAllSidebetCards();
    }

    if (mainUI.isOpenAutoFoldSetting) {
        setPreFlopAutoFoldData();
        mainUI.isOpenAutoFoldSetting = false
    }


    // const players = roundResult.lastPlayers;
    // mainUI.showShowCardsButton(roundResult.players.length > 1 && players.length == 1 && players[0].seat != getPlayerSeat());
}

function onAnimation(res) {
    switch (res.type) {
        case "TableStatus":
            table.totalChipAnimation(res);
            mainUI.showFoldToAnyBetOption(false);
            break;
        case "betAction":
            table.betActionAnimation(res);
            break;
        case "allPlayersAllIn":
            table.setLastAnimationAction("allPlayersAllIn");
            break;
        case "returnSidePot":
            table.returnSidePotAnimation(res);
            break;
        default:
            break;
    }

}

function onShowCardsButton(res) {
    if (!autoMuckCard)
        mainUI.showShowCardsButton(true);
}

function onAlwaysFold(res) {
    mainUI.setAlwaysFold(true);
    actionUI.showActionUI(false);
}

function onRoundTurn(turn) {
    table.setTurn(turn);
    lastTurnSeat = turn.seat;

    if (turn.seat != -1 && turn.seat == getPlayerSeat()) {
        // mainUI.showFoldToAnyBetOption(state == "Playing");
        const playerCards = table.getTurnPlayerCards(turn.seat);
        const activeSeats = table.getActiveSeats();

        if (mainUI.doFoldToBet())
            return;

        if (mainUI.doAutoCheckOrFold())
            return;

        if (mainUI.doAutoCheck())
            return;

        if (mainUI.doCall())
            return;

        if (tableSettings.gameType == "nlh" && mainUI.doPreFlopAutoFold(preFlopAutoFoldCheckboxes, playerCards, activeSeats))
            return;

        actionUI.showActionUI(true);
        mainUI.showFoldToAnyBetOption(false);
        if (!document.hasFocus() && !$('body').is(':hover'))
            sound.playNotification();

        mainUI.setTurnFlag(true);

        actionUI.showCall(turn.call, myMoneyInGame(), tableSettings.mode);

        if (turn.canRaise)
            actionUI.showRaise(turn.minRaise, turn.maxRaise, turn.pot, tableSettings.bigBlind, turn.currentBet);
        else
            actionUI.hideRaise();
    } else {
        actionUI.showActionUI(false);
        mainUI.setTurnFlag(false);
    }
}

function onSidePots(pots) {
    table.setSidePots(pots);
}

function onSideBet(res) {
    sidebetUI.setHideSideBetOption(res.options === undefined || res.options.length <= 0);
    sidebetUI.setCurrentSidebetOptions(res.street, res.streetText, res.options);
    sidebetUI.updateSideBetOptions(res.street, res.streetText, res.options);
}

function onSideBetHistory(res) {
    sidebetUI.updateSideBetHistory(res);
}

function onTableFreeBalance(balance) {
    sidebetUI.setNewFreeBalance(balance);
}

function onTableExtraCard(cards) {
    table.setTableCards(cards);

    setTimeout(() => {
        window.clearTableCards();
    }, (cards.length * 200) + 4000);
}

function onTournamentCancelTime(res) {
    mainUI.showTournamentCancelTime(res);
}

function onPlayerCard(cards) {
    table.setMainPlayerCards(cards);
}

function onPlayerSidebetCard(cards) {
    sidebetUI.addCards(cards);
}

function onPlayerSideGameRandomString(res) {

    const randomString = sidebetUI.getRandomString();
    sideGameRandomString(randomString);
}

function onPlayerGameSetting(res) {

    var checkBoxes = { mute: $("#muteCheckbox")[0], fourColors: $("#fourColorsCheckbox")[0], autoMuck: autoMuckCheckbox, showBB: showBBCheckbox, showSUD: showSUDCheckbox, shuffleVerification: shuffleVerificationButtonCheckboxe, DisplayCards: DisplayCards }
    Object.keys(res).forEach(value => {
        if (value == "themeColor") {
            $(themeColorMenu).removeClass("active");
            for (const element of themeColorMenu) {
                if (element.dataset.value == res[value]) {
                    element.classList.add("active");
                    $("#themeColor").find("button")[0].innerText = element.innerText
                }
            }




            $("#selectedThemeColor")[0].className = "color-indicator " + res[value];
            document.body.className = res[value];
        } else {
            toggleCheckbox(checkBoxes[value], res[value]);
        }

    });

}

function onVerifyShuffling(res) {
    if (!shuffleVerificationButtonCheckboxe.checked)
        return;

    // A. client verifies the seed independently
    const seed = res.seed;
    const isSeedValid = verifySeed(seed, res.jsonString);
    if (!isSeedValid) {
        shufflingVerificationReport("Seed verification failed.");
        console.log("Seed verification failed.");
        return;
    }

    // B. Reconstruct the deck and perform cryptographic shuffling with the verified seed
    let deck = initializeDeck();
    deck = cardShuffler.shuffle(deck, seed);

    let verificationPreFlopArray = [];
    for (let i = 0; i < res.pfCount; i++) {
        verificationPreFlopArray.push(deck.pop());
    }

    // D. Draw common cards from the deck
    const commonCards = res.commonCards;
    let verificationCommonCards = [];
    for (let i = 0; i < commonCards.length; i++) {
        verificationCommonCards.push(deck.pop());
    }

    // E. Compare the common cards with the original common cards
    const verificationSuccess = arraysEqual(commonCards, verificationCommonCards);

    if (verificationSuccess) {
        shufflingVerificationReport(getMessage('successVerification'));
        console.log("Verification successful: The shuffling was fair.");
    } else {
        shufflingVerificationReport(getMessage('failVerification'));
        console.log("Verification failed: The shuffling was tampered with.");
    }
}

function arraysEqual(array1, array2) {
    return JSON.stringify(array1) === JSON.stringify(array2);
}

function onShowCards(showCards) {
    // if (showCards.seat != getPlayerSeat()) // show others only
    table.showCards(showCards.seat, showCards.cards);
    mainUI.addLog({ log: table.players[showCards.seat].name + ' shows ' + showCards.cards.join(), rank: showCards.handrank, avatar: showCards.avatar });
}

function onMuckCards(seat) {
    table.muckCards(seat);
}


function onInsurance(data) {
    mainUI.showInsurance(data);
}

function onMessage(res) {
    if (res.status)
        console.log(res.msg);
    else {
        console.error(res.msg);
        mainUI.showMessage(res.msg, res.data);
    }
}
function onCancelBet() {
    actionUI.showActionUI(true);
}

function onTourneyInfo(res) {
    mainUI.setTrophyInfo(res.position, res.number);
    mainUI.setAverageAndBiggestStack(res.averageStack, res.biggestStack);
}

function onCashWaitList(res) {
    mainUI.setWaitList(res);
}

function onWaitForBB(res) {
    mainUI.setWaitForBB(res);
}

function onLog(res) {
    mainUI.addLog(res);
}

function onChat(res) {
    mainUI.addChat(res);
}

function onTip(res) {
    table.setTipMessage(res);
}

function onBuyInPanelOpen(res) {
    buyInUI.setBuyInPanelInfo(res);
}

tableSubscribe("onPlayerInfo", onPlayerInfo);
tableSubscribe("onTableSettings", onTableSettings);
tableSubscribe("onPlayerState", onPlayerState);
tableSubscribe("onPlayerLeave", onPlayerLeave);
tableSubscribe("onTableStatus", onTableStatus);
tableSubscribe("onRoundResult", onRoundResult);
tableSubscribe("onAnimation", onAnimation);
tableSubscribe("onRoundTurn", onRoundTurn);
tableSubscribe("onSidePots", onSidePots);
tableSubscribe("onShowCards", onShowCards);
tableSubscribe("onMuckCards", onMuckCards);
tableSubscribe("onShowCardsButton", onShowCardsButton);
tableSubscribe("onAlwaysFold", onAlwaysFold);
tableSubscribe("onBuyInPanelOpen", onBuyInPanelOpen);
tableSubscribe("onMessage", onMessage);
tableSubscribe("onCancelBet", onCancelBet);
tableSubscribe("onInsurance", onInsurance);
tableSubscribe("onTourneyInfo", onTourneyInfo);
tableSubscribe("onCashWaitList", onCashWaitList);
tableSubscribe("onWaitForBB", onWaitForBB);
tableSubscribe("onSideBet", onSideBet);
tableSubscribe("onSideBetHistory", onSideBetHistory);
tableSubscribe("onTableFreeBalance", onTableFreeBalance);
tableSubscribe("onLog", onLog);
tableSubscribe("onChat", onChat);
tableSubscribe("onTip", onTip);
tableSubscribe("onTableExtraCard", onTableExtraCard);
tableSubscribe("onTournamentCancelTime", onTournamentCancelTime);
tableSubscribe("onPlayerCard", onPlayerCard);
tableSubscribe("onPlayerSidebetCard", onPlayerSidebetCard);
tableSubscribe("onVerifyShuffling", onVerifyShuffling);
tableSubscribe("onPlayerSideGameRandomString", onPlayerSideGameRandomString);
tableSubscribe("onPlayerGameSetting", onPlayerGameSetting)

export default {
    showBuyIn,
}