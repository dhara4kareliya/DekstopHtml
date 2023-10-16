import { getPlayerSeat, PlayerInfo, sitDown, tableSubscribe } from "../services/table-server";

const playerWrapperHTML = `
<div class="avtar_img">
    <img src="./images/avtar.png">
    <div class = "cards-container">
        <canvas><canvas>
    </div>
</div>
<div class="title">Tangotag</div>
<div class="price">$5.24</div>
<div class="raise action">RAISE</div>
<img class="blind">
<div class="bottom_price"><img src="./images/cicle.png"> <span>$55</span></div>
<div class="winner"> <img src="./images/WINNER.png"></div>
`;

const sitDownHTML = "<button class=\"sit_down_button\">Sit Down</button>";

const smallBlindSrc = "./images/SB.png";
const bigBlindSrc = "./images/BB.png";
const dealerSrc = "./images/D.png";

const mainPlayerIndex = 5;
let previousMainPlayerIndex = -1;

const playerWrappers = getSortedPlayerWrappers();

setup();

function getSortedPlayerWrappers () {
    let playerWrappers = $(".player_wrapper");
    return playerWrappers.sort((a, b) => {
        if (a.classList[1] == undefined || b.classList[1] == undefined)
            return 0;
        return +a.classList[1] - +b.classList[1];
    });
}

/**
 * Rotates the seats such that the targetSeat
 * is moved to destinationSeat.
 * The relative positions remain.
 * @param {Number} targetSeat 
 * @param {Number} destinationSeat 
 */
function rotatePlayerWrappers (targetSeat, destinationSeat) {
    const tempArray = playerWrappers.slice();
    const shift = (destinationSeat - targetSeat + playerWrappers.length) % playerWrappers.length;
    for (let i = 0; i < playerWrappers.length; i++) {
        playerWrappers[i] = tempArray[(i + shift) % playerWrappers.length];
    }
}

function setup () {
    hideAllPlayers();
}

/**
 * Sets the value in the element.
 * undefined or false will make it invisible.
 * true will make it visible again.
 * @param {DOM} wrapper 
 * @param {String} fieldName 
 * @param {String} value 
 */
function setWrapperField (wrapper, fieldName, value) {
    if (typeof wrapper == "number")
        wrapper = playerWrappers[wrapper];
    const selector = `.${fieldName}`;
    let element = $(wrapper).find(selector)[0];
    if (!element)
        return;
    if (value === undefined || value === false) {
        element.style.visibility = "hidden";
        return;
    }
    element.style.visibility = "visible";
    if (value === true) 
        return;
    if (fieldName == "bottom_price")
        element = $(element).find("span")[0];
    else if (fieldName == "avtar_img")
        element = $(element).find("img")[0];
    if (element.tagName.toLowerCase() == "img")
        element.src = value;
    else
        element.innerText = value;
}

/**
 * Make the player visible on the table.
 * @param {PlayerInfo} playerInfo 
 * @param {Number} seatIndex 
 */
function seatPlayer (playerInfo, seatIndex) {
    const wrapper = playerWrappers[seatIndex];
    wrapper.innerHTML = playerWrapperHTML;
    showPlayerName(seatIndex, playerInfo.name);
    showPlayerMoney(seatIndex, playerInfo.chips);
    showPlayerAvatar(seatIndex, playerInfo.avatar);
}

function makeMocupPlayers () {
    for (let i = 0; i < playerWrappers.length; i++) {
        const playerInfo = new PlayerInfo(i, "./images/avtar.png", 0, i);
        seatPlayer(playerInfo, i);
    }
}

export function getCardsCanvas (seatIndex) {
    const wrapper = playerWrappers[seatIndex];
    return $(wrapper).find(".cards-container canvas")[0];
}

export function getPlayerWrappersCount () {
    return playerWrappers.length;
}

function showPlayerName (seatIndex, name) {
    setWrapperField(seatIndex, "title", name);
} 

function showPlayerMoney (seatIndex, amount) {
    setWrapperField(seatIndex, "price", `$${amount}`);
}

function showPlayerBet (seatIndex, amount) {
    let value = amount ? `$${amount}` : false;
    setWrapperField(seatIndex, "bottom_price", value);
}

function showPlayerAction (seatIndex, action) {
    setWrapperField(seatIndex, "action", action? action.toUpperCase() : false);
}

function showPlayerWinner (seatIndex, value) {
    setWrapperField(seatIndex, "winner", value);
}

function showBlinds (smallBlindIndex, bigBlindIndex, dealerIndex) {
    for (const wrapper of playerWrappers)
        setWrapperField(wrapper, "blind", false);
    setWrapperField(smallBlindIndex, "blind", smallBlindSrc);
    setWrapperField(bigBlindIndex, "blind", bigBlindSrc);
    setWrapperField(dealerIndex, "blind", dealerSrc);
}

function showPlayerAvatar (seatIndex, avatar) {
    setWrapperField(seatIndex, "avtar_img", avatar);
} 

function hideAllPlayers () {
    for (let i = 0; i < playerWrappers.length; i++) {
        const wrapper = playerWrappers[i];
        wrapper.innerHTML = sitDownHTML;
        wrapper.seatIndex = i;
        $(wrapper).find(".sit_down_button")[0].addEventListener('click',
        () => {
            sitDown(wrapper.seatIndex);
        });
    }
    if (getPlayerSeat() != -1)
        hideSitDownButtons();
}

function hideSitDownButtons () {
    const buttons = $(".sit_down_button");
    for (const button of buttons)
        button.style.visibility = "hidden";
}

function onTableStatus (status) {
    hideAllPlayers();
    if (getPlayerSeat() != previousMainPlayerIndex) {
        rotatePlayerWrappers(getPlayerSeat(), mainPlayerIndex);
        previousMainPlayerIndex = getPlayerSeat();
    }
    for (let i = 0; i < status.seats.length; i++) {
        const seat = status.seats[i];
        if (seat.state == "Empty")
            continue;
        seatPlayer(seat.player, i);
        showPlayerAction(i, seat.lastAction);
        showPlayerBet(i, seat.lastBet);
        showPlayerMoney(i, seat.money);
    }
    showBlinds(status.seatOfSmallBlind, status.seatOfBigBlind, status.seatOfDealer);
}

tableSubscribe("onTableStatus", onTableStatus);

window.showPlayerName = showPlayerName;
window.showPlayerMoney = showPlayerMoney;
window.showPlayerBet = showPlayerBet;
window.showPlayerAction = showPlayerAction;
window.showPlayerWinner = showPlayerWinner;
window.showBlinds = showBlinds;
window.showPlayerAvatar = showPlayerAvatar;
window.makeMocupPlayers = makeMocupPlayers;

export default {
    setup,
    seatPlayer,
    getCardsCanvas,
    getPlayerWrappersCount,
    showPlayerMoney,
    showPlayerBet,
    showPlayerAction,
    showPlayerWinner,
    showBlinds
}