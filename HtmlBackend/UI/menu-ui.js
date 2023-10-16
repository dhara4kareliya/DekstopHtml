import { sitIn, sitOutNextHand, tableSettings, tableSubscribe, waitForBB } from "../services/table-server";
import { playerBuyChips } from "../socket-client";

const menuButton = $(".menu_wrapper a")[0];
const buyInDiv = $("#buy_in_div")[0];
const buyInInput = $("#buyInInput")[0];
const buyInButton = $("#buyInButton")[0];
const sitInButton = $("#back-button")[0];
const waitForBBDiv = $("#waitForBBDiv")[0];
const waitForBBCheckbox = $("#waitForBBCheckbox")[0];
const SitOutNextHandDiv = $("#sitOutNextHandDiv")[0];
const SitOutNextHandCheckbox = $("#sitOutNextHandCheckbox")[0];

buyInButton.addEventListener('click', () => {
    playerBuyChips(+buyInInput.value);
});

sitInButton.addEventListener('click', sitIn);
waitForBBCheckbox.addEventListener('change', () => {
    waitForBB(waitForBBCheckbox.checked);
});
SitOutNextHandCheckbox.addEventListener('change', () => {
    sitOutNextHand(SitOutNextHandCheckbox.checked);
});

function onTableSettings (settings) {
    buyInInput.min = settings.minBuyIn;
    buyInInput.max = settings.maxBuyIn;
    buyInInput.value = settings.minBuyIn;
}

function onPlayerState (state) {
    setActive(sitInButton, false);
    setActive(buyInDiv, false);
    setActive(waitForBBDiv, false);
    setActive(SitOutNextHandDiv, false);
    switch (state) {
        case "SitOut":
            setActive(sitInButton, true);
            break;
        case "Joining":
            if (tableSettings.mode == "cash")
                setActive(buyInDiv, true);
            break;
        case "Waiting":
            setActive(waitForBBDiv, true);
            break;
        case "Playing":
            setActive(SitOutNextHandDiv, true);
            break;
    }
}

function setActive (element, value) {
    element.style.visibility = (value == false) ? "hidden" : "visible";
}

tableSubscribe("onTableSettings", onTableSettings);
tableSubscribe("onPlayerState", onPlayerState);