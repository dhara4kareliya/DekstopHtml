import { myInfo, myMoneyInGame, tableSubscribe, turnAction } from "../services/table-server";

const foldButton = $("#fold-button")[0];
const callButton = $("#call-button")[0];
const betButton = $("#bet-button")[0];
const betButtonChild = $("#bet-button div")[0];
const actionUIDiv = $(".bottom_buttons_Wrapper")[0];
const backButton = $("#back-button")[0];
const betInput = $("#bet-input")[0];
const allInButton = $("#all-in-button")[0];
const times4Button = $("#4x-button")[0];
const times3Button = $("#3x-button")[0];
const times2_5Button = $("#2_5x-button")[0];
const minusButton = $(".control-minus")[0];
const plusButton = $(".control-plus")[0];
const betDiv = $("#myDIV")[0]; // What a noob.

let callAmount = 0;
let betChangeStep = 1;
let potAmount = 0;

foldButton.addEventListener('click', fold);
callButton.addEventListener('click', checkOrCall);
betButton.addEventListener('click', raise);
betInput.addEventListener('change', logBetAmount);
allInButton.addEventListener('click', allIn);
times4Button.addEventListener('click', () => bet(potAmount * 2/3));
times3Button.addEventListener('click', () => bet(potAmount * 1/2));
times2_5Button.addEventListener('click', () => bet(potAmount * 1/3));
plusButton.addEventListener('click', () => bet(+betInput.value + betChangeStep));
minusButton.addEventListener('click', () => bet(+betInput.value - betChangeStep));

setup();

function setup () {
    setActive(backButton, false);
    setActive(actionUIDiv, false);
    updateCallAmount(0);
}

function setActive (element, value) {
    element.style.visibility = (value == false) ? "hidden" : "visible";
}

function setDisplay (element, value) {
    element.style.display = (value == false) ? "none" : "block";
}

function bet (amount) {
    betInput.value = amount;
    betButtonChild.innerHTML = `$${amount}`;
}

function allIn () {
    bet(myMoneyInGame());
}

function logBetAmount () {
    console.log(betInput.value);
}

function fold () {
    setDisplay(betDiv, false);
    turnAction("fold");
}

function call () {
    turnAction("bet", callAmount);
}

function check () {
    turnAction("bet", 0);
}

function checkOrCall () {
    setDisplay(betDiv, false);
    if (callAmount == 0)
        check();
    else
        call();
}

function raise () {
    turnAction("bet", +betInput.value);
}

function updateCallAmount (amount = 0) {
    callAmount = +amount;
    callButton.innerHTML = callAmount == 0 ? "CHECK" : "CALL";
}

function setActiveActionButtons (value) {
    betInput.max = myMoneyInGame();
    setActive(actionUIDiv, value);
    setDisplay(betDiv, value);
}

function onTableSettings (settings) {
    if (settings.bigBlind)
        betChangeStep = settings.bigBlind;
}

function onRoundTurn (turn) {
    if (turn.call != undefined) {
        updateCallAmount(turn.call);
        betInput.min = turn.call
        bet(betInput.value);
    }
}

function onTableStatus (status) {
    potAmount = status.pot;
}

tableSubscribe("onTurnChange", setActiveActionButtons);
tableSubscribe("onTableSettings", onTableSettings);
tableSubscribe("onRoundTurn", onRoundTurn);
tableSubscribe("onTableStatus", onTableStatus);

window.updateCallAmount = updateCallAmount;
window.setActiveActionButtons = setActiveActionButtons;

export default {
    setup,
    updateCallAmount,
    setActiveActionButtons
}