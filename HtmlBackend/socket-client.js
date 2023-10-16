import {io} from 'socket.io-client';
let socket = undefined;

export function getSocket() {
    return socket;
}

export function connectSocket (server) {
    disConnectSocket();
    socket = io(server);
    setSocketEventListeners();
}

export function disConnectSocket () {
    if (socket && socket.connected)
        socket.close();
}

function setSocketEventListeners () {
    socket.on("REQ_PLAYER_INFO", eventTrigger("onPlayerInfo"));
    socket.on("REQ_TABLE_SETTINGS", eventTrigger("onTableSettings"));
    socket.on("REQ_PLAYER_STATE", eventTrigger("onPlayerState"));
    socket.on("REQ_TABLE_STATUS", eventTrigger("onTableStatus"));
    socket.on("REQ_TABLE_SIDEPOTS", eventTrigger("onTableSidePots"));
    socket.on("REQ_TABLE_TURN", eventTrigger("onTableTurn"));
    socket.on("REQ_TABLE_ROUNDRESULT", eventTrigger("onTableRoundResult"));
    socket.on("REQ_TABLE_PLAYERSHOWCARDS", eventTrigger("onTablePlayerShowCards"));
    socket.on("REQ_PLAYER_LEAVE", eventTrigger("onPlayerLeave"));
    socket.on("connect", eventTrigger("onConnect"));
    socket.on("disconnect", eventTrigger("OnDisconnect"));
}

// TS -> client

const eventListeners = {
    onPlayerInfo: [],
    onTableSettings: [],
    onPlayerState: [],
    onTableStatus: [],
    onTableSidePots: [],
    onTableTurn: [],
    onTableRoundResult: [],
    onTablePlayerShowCards: [],
    onPlayerLeave: [],
    onConnect: []
};

function triggerEventListeners (name, data) {
    console.log(`EventName: ${name}\nData:`);
    console.log(data);
    if (!eventListeners[name])
        return;
    try {
        data = JSON.parse(data);
    } catch {}
    eventListeners[name].forEach(listener => {
        listener(data);
    });
}

function eventTrigger (name) {
    return data => {
        triggerEventListeners(name, data);
    };
}

/**
 * Adds a function that will be called when the event is triggered.
 * @param {String} eventName 
 * @param {Function} callback 
 */
export function subscribe (eventName, callback) {
    if (!eventListeners[eventName])
        eventListeners[eventName] = [];
    if (typeof callback !== 'function')
        throw "The callback should be a function";
    eventListeners[eventName].push(callback);
}

// client - TS

export function emit (eventName, data) {
    socket.emit(eventName, data);
}

export function joinToTs (userToken, tsToken) {
    socket.emit("REQ_PLAYER_ENTER", {
        user: userToken,
        user_token: userToken,
        thread: userToken,
        table: tsToken,
        table_token: tsToken
    }); 
}

export function playerLeave () {
    socket.emit("REQ_PLAYER_LEAVE");
}

export function playerSitDown (sitIndex) {
    socket.emit("REQ_PLAYER_SITDOWN", {
        seat: sitIndex
    });
}

export function playerBuyChips (amount, outoTopUp) {
    if (!outoTopUp)
        outoTopUp = false;
    socket.emit("REQ_PLAYER_BUYIN", {
        amount: amount,
        autoTopUp: outoTopUp
    });
}

export function sendTurnAction (action, amount) {
    console.log({
        action: action,
        bet: amount
    });
    socket.emit("REQ_PLAYER_ACTION", {
        action: action,
        bet: amount
    });
}

export function showCards () {
    socket.emit("REQ_PLAYER_SHOWCARDS");
}

export function waitForBB (value) {
    socket.emit("REQ_PLAYER_ WAITFORBB", {
        value: value
    });
}

export function sitOutNextHand (value) {
    socket.emit("REQ_PLAYER_SITOUTNEXTHAND", {
        value: value
    });
}

export function playerSitOut () {
    socket.emit("REQ_PLAYER_SITOUT");
}

export function playerSitIn () {
    socket.emit("REQ_PLAYER_SITIN");
}

