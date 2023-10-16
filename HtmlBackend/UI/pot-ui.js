import { tableSubscribe } from "../services/table-server";

const potSpan = $(".totalpost span")[0];
const bottomPriseDiv = $(".center_div .bottom_price")[0];
const centerDiv = $(".center_div")[0];
const smallBlindSpan = $("#smallBlindSpan")[0];
const bigBlindSpan = $("#bigBlindSpan")[0];
const anteSpan = $("#anteSpan")[0];
const levelSpan = $("#levelSpan")[0];
const tournamentDiv = $(".tournament_only")[0];

setup();

function setup () {
    setTotalPot(0);
    centerDiv.style.visibility = "hidden";
    bottomPriseDiv.style.visibility = "hidden";
}

function setTotalPot (amount) {
    potSpan.innerText = `$${amount}`;
}

function onTableStatus (status) {
    setTotalPot(status.pot);
}

function onTableSettings (settings) {
    centerDiv.style.visibility = "visible";
    smallBlindSpan.innerText = settings.smallBlind;
    bigBlindSpan.innerText = settings.bigBlind;
    anteSpan.innerText = settings.ante;
    levelSpan.innerText = settings.level;
    tournamentDiv.style.visibility = (settings.mode == "tournament" ? "visible" : "hidden");
}

tableSubscribe("onTableStatus", onTableStatus);
tableSubscribe("onTableSettings", onTableSettings);

window.setTotalPot = setTotalPot;
export default {
    setup
}