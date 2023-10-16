import { dispatchEvent, getSelectedGame } from "../services/game-communicator";

const backToLobbyButton = $("#backToLobbyButton")[0];
const sitOutButton = $("#sitOutButton")[0];
const leaveButton = $("#leaveButton")[0];

const addChipsButton = $("#addChipsButton")[0];
const buyInMenu = $("#buyInMenu")[0];
const buyInMinSpan = $("#buyInMin")[0];
const buyInMaxSpan = $("#buyInMax")[0];
const buyInSlider = $("#buyInSlider")[0];
const chipsLowerThenBuyInCheckbox = $("#chipsLowerThenBuyInCheckbox")[0];
const runOutOfChipsCheckbox = $("#runOutOfChipsCheckbox")[0];
const cancleButton = $("#buyInMenu .cancleButton")[0];
const okButton = $("#buyInMenu .okButton")[0];

backToLobbyButton.addEventListener('click', backToLobby);
sitOutButton.addEventListener('click', sitOut);
leaveButton.addEventListener('click', leave);

addChipsButton.addEventListener('click', openBuyInMenu);
cancleButton.addEventListener('click', closeBuyInMenu);
okButton.addEventListener('click', () => {
    buyIn();
    closeBuyInMenu();
});
chipsLowerThenBuyInCheckbox.addEventListener('change', () => {
    toggleCheckbox(chipsLowerThenBuyInCheckbox);
});
runOutOfChipsCheckbox.addEventListener('checnge', () => {
    toggleCheckbox(runOutOfChipsCheckbox);
});

function backToLobby () {
    dispatchEvent('backToLobby');
}

function sitOut () {
    dispatchEvent('sitOut');
}

function leave () {
    dispatchEvent('leave');
}

function openBuyInMenu () {
    buyInMenu.style.visibility = "visible";
    const detail = getSelectedGame().detail;
    if (detail.buyInMin) {
        buyInMinSpan.innerText = detail.buyInMin ? detail.buyInMin : "";
        buyInSlider.min = +detail.buyInMin;
    }
    if (detail.buyInMax) {
        buyInMaxSpan.innerText = detail.buyInMax ? detail.buyInMax : "";
        buyInSlider.max = +detail.buyInMax;
    }
}

function closeBuyInMenu () {
    buyInMenu.style.visibility = "hidden";
}

function buyIn () {
    dispatchEvent('buy-in', buyInSlider.value);
}

function toggleCheckbox (checkbox) {
    dispatchEvent('checkbox', {id: checkbox.id, value: checkbox.value});
}