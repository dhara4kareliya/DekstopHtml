import './menu-ui';
import './player-ui';
import './pot-ui';
import './action-ui';
import './card-ui';

export const playerInfo = {
    name: "Guest",
    seat: 0
};

export const levelInfo = {
    level: 0,
    duration: 0,
    nextSB: 0,
    nextBB: 0,
    ante: 0
};

export const tableInfo = {
    name: "Table",
    mode: "cash",
    smallBlind: 0,
    bigBlind: 0
};

export function getTableMode () {
    return tableInfo.mode;
}

export function getPlayerSeat () {
    return playerInfo.seat;
}

export function setPlayerName (newPlayerInfo) {
    playerInfo.name = newPlayerInfo.name;
}

export function setLevelInfo (level, duration, nextSB, nextBB, ante) {
    levelInfo.level = level;
    levelInfo.duration = duration;
    levelInfo.nextSB = nextSB;
    levelInfo.nextBB = nextBB;
    levelInfo.ante = ante;
}

export function setTableName (name) {
    tableInfo.name = name;
}

export function setSmallBlind (smallBlind) {
    tableInfo.smallBlind = smallBlind;
}

export function setBigBlind (bigBlind) {
    tableInfo.bigBlind = bigBlind;
}

export function showLevel (value) {

}

export function setShowDollarSign (value) {

}

export function showSitIn (value) {

}

export function showWaitForBB (value) {

}

export function setWaitForBB (value) {
    
}

export function showSitOutNextHand (value) {

}

export function setSitOutNextHand (value) {

}

export default {
    playerInfo,
    levelInfo,
    tableInfo,
    getTableMode,
    getPlayerSeat,
    setPlayerName,
    setLevelInfo,
    setTableName,
    setSmallBlind,
    setBigBlind,
    showLevel,
    setShowDollarSign,
    showSitIn,
    showWaitForBB,
    setWaitForBB,
    showSitOutNextHand,
    setSitOutNextHand
};