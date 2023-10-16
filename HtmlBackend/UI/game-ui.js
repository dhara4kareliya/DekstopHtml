import actionUi from "./action-ui";
import { getPlayerSeat, getTableMode, setLevelInfo, setPlayerName, setSitOutNextHand, setSmallBlind, setTableName, setWaitForBB, showLevel, showSitIn, showSitOutNextHand, showWaitForBB } from "./main-ui";
import { playerLeave, subscribe } from "../socket-client";
import tableUi, { clearTurn, modes, playerStates, setMode } from "./table-ui";

function onLeaveClick () {
    playerLeave();
}

function onPlayerLeave () {
    setMode(modes.None);
    actionUi.setActive(false);
}

function onPlayerInfo (playerInfo) {
    setPlayerName(playerInfo);
}

function onTableSettings (settings) {
    if (settings.mode == "tournament") {
        showLevel(true);
        setLevelInfo(settings.level, settings.duration, settings.nextSB, settings.nextBB, settings.ante);
        setShowDollarSign(false);
    } else {
        showLevel(false);
        setShowDollarSign(true);
    }
    setTableName(settings.name);
    setSmallBlind(settings.smallBlind);
}

function onPlayerState (state) {
    switch (state) {
        case playerStates.Joining:
            setMode(modes.Joining);
            break;
        case playerStates.Waiting:
        case playerStates.Playing:
        case playerStates.SitOut:
            setMode(modes.Playing);
            break;
    }
    clearTurn();
    actionUi.setActive(false);
    showSitIn(state == playerStates.SitOut);
    if (getTableMode() == "cash") {
        showWaitForBB(state == playerStates.Waiting);
        setWaitForBB(true);
        showSitOutNextHand(state == playerStates.Playing);
        setSitOutNextHand(false);
        if (getPlayerSeat() >= 0 && state == playerStates.Joining) {
            console.log("Insufficient money. Waiting for buy-in.");
            syncAndBuyIn();
        } else {
            hideBuyIn();
        }

        actionUi.setShowDollarSign(true);
        tableUi.setShowDollarSign(true);
    } else {
        showWaitForBB(false);
        setWaitForBB(false);
        showSitOutNextHand(false);
        setSitOutNextHand(false);
        actionUi.setShowDollarSign(false);
        tableUi.setShowDollarSign(false);
    }
}

function onSeatClick (seat) {
    sitDown(seat);
}

function sitDown (seat) {
    console.log(`Trying sitdown. seat: ${seat}`);
}

function syncAndBuyIn () {

}

function hideBuyIn () {

}

subscribe("onPlayerInfo", onPlayerInfo);
subscribe("onTableSettings", onTableSettings);
subscribe("onPlayerState", onPlayerState);
subscribe("onPlayerLeave", onPlayerLeave);