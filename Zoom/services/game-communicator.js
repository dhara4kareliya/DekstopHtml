import { getT } from '../UI/gameCells';

// Responsible for communication between this zoom and the client windows and iframes.

// Add the origin where the game page is hosted.
const allowedGameOrigins = [
    // "http://127.0.0.1:5500",
    // "http://127.0.0.1:5501"
    // "http://dev.nrpoker.net"
    "http://localhost:3000"
];

let gameId = 0;
let messageId = 0;
const games = [];

window.addEventListener('message', triggerEventListener);

export class Game {
    constructor(gameUrl) {
        games.push(this);
        // this.id = gameId++;
        this.id = getT(gameUrl);
        this.eventListeners = [];
        this.src = gameUrl;
        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('src', gameUrl);
        this.iframe.setAttribute('frameborder', "0");
        this.window = undefined;
        this.detail = {};
        // this.addEventListener('update', e => this.updateDetail(e));
        // This is to cofirm the message was received by the child window and it can send messages back. 
        this.addEventListener('yes', eventData => console.log(eventData));
    }

    updateDetail(detail) {
        console.log(detail)
        for (const [key, value] of Object.entries(detail)) {
            this.detail[key] = value
        }
        // for (const key of detail) {
        //     if (detail[key])
        //         this.detail[key] = detail[key];
        // }
    }

    dispatchEvent(eventName, eventData) {
        if (!this.window)
            this.setWindow(this.iframe.contentWindow);
        if (!this.window)
            throw "Can't send message to null window";
        for (const allowedGameOrigin of allowedGameOrigins) {
            let sent = false;
            try {
                this.window.postMessage({messageId: messageId++, gameId: this.id, eventName: eventName, eventData: eventData }, allowedGameOrigin);
                sent = true;
            } catch (e) {
                //console.warn(e);
            }
            if (!sent)
                console.warn("The origin of the target window is not in the whitelist");
        }
    }

    addEventListener(eventName, handler) {
        const eventListener = {
            eventName: eventName,
            handler: handler
        };
        this.eventListeners.push(eventListener);
    }

    moveToExternalWindow() {
        this.setWindow(open(this.src));
        return this.window;
    }

    returnToMainWindow() {
        this.window.close();
        this.setWindow(this.iframe.contentWindow);
    }

    setWindow(window) {
        this.window = window;
    }
}

let selectedGame = undefined;

/**
 * Set the game to communicate with while preforming client actions.
 * @param {Game} game 
 */
export function selectGame(game) {
    selectedGame = game;
}

export function getSelectedGame() {
    return selectedGame;
}

export function dispatchEvent(eventName, eventData) {
    selectedGame.dispatchEvent(eventName, eventData);
}


/**
 * Trigger the event listener on the corresponding game.
 * @param {{data: {gameId, eventName, eventData}}} message 
 */
function triggerEventListener (message) {
    // Reject events from origins not on the list.
    if (allowedGameOrigins.indexOf(message.origin) == -1) {
        console.warn(`Message rejected from origin ${message.origin}`);
        return;
    }
    const game = games.find(g => g.id == message.data.gameId);
    if (!game)
        return;
    const listener = game.eventListeners.find(e => e.eventName == message.data.eventName);
    if (listener)
        listener.handler(message.data.eventData);
}