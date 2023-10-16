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
    socket.on("REQ_MT_CLIENT_ADD", eventTrigger("onAddClient"));
    socket.on("REQ_MT_TURN", eventTrigger("onTurn"));
    socket.on("connect", eventTrigger("onConnect"));
    socket.on("disconnect", eventTrigger("OnDisconnect"));
}

// TS -> client

const eventListeners = {
    onAddClient: [],
    onTurn: [],
    onPlayerInfo: [],
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

// client - MT

export function emit (eventName, data) {
    socket.emit(eventName, data);
}

export function joinToMT (userToken) {
    socket.emit("REQ_USER_ENTER", {
        user_token: userToken
    }, (success) => {
        if (success)
        {
            console.log("Success to join MT server.");
        }
        else
        {
            console.error("Failed to join MT server. Quiting now.");
        }
    }); 
}

export function playerLeave () {
    socket.emit("REQ_USER_LEAVE");
    window.close();
}


