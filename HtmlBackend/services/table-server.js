import { emit, playerSitDown, sendTurnAction, subscribe } from "../socket-client";
import { Get } from "../http-client";

export const PlayerState = Object.freeze({
    None: 0,
    Leaving: 1,
    Joining: 2,
    SitOut: 3,
    Waiting: 4,
    Playing: 5
});

export const SeatState = Object.freeze({
    Empty: 0,
    Joining: 1,
    SitOut: 2,
    Waiting: 3,
    Playing: 4
});

export const RoundState = Object.freeze({
    None: 0,
    HoleCards: 1,
    Flop: 2,
    Turn: 3,
    River: 4,
    Showdown: 5,
    End: 6
});

export const HandRank = Object.freeze({
    None: 0,
    HighCard: 1,
    Pair: 2,
    TwoPair: 3,
    ThreeOfAKind: 4,
    Straight: 5,
    Flush: 6,
    FullHouse: 7,
    FourOfAKind: 8,
    StraightFlush: 9
});

export class PlayerInfo {
    /**
     * @param {String} name 
     * @param {Number} avatar 
     * @param {Number} cash 
     * @param {Number} chips 
     */
    constructor (name, avatar, cash, chips) {
        this.name = name;
        this.avatar = avatar;
        this.cash = cash;
        this.chips = chips;
    }
}

export class TableSetting {
    constructor (name, numberOfSeats, mode, level, nextSB, 
        nextBB, duration, smallBlind, bigBlind, ante, minByIn, maxByIn) {
            this.name = name;
            this.numberOfSeats = numberOfSeats;
            this.mode = mode;
            this.level = level;
            this.nextSB = nextSB;
            this.nextBB = nextBB;
            this.duration = duration;
            this.smallBlind = smallBlind;
            this.bigBlind = bigBlind;
            this.ante = ante;
            this.minByIn = minByIn;
            this.maxByIn = maxByIn;
        }
}

export class TableStatus {
    constructor (breakTime, paused, round, state, cards, seatOfDealer,
        seatOfSmallBlind, seatOfBigBlind, pot, turn) {
            this.breakTime = breakTime;
            this.paused = paused;
            this.round = round;
            this.state = state;
            this.cards = cards;
            this.seatOfDealer = seatOfDealer;
            this.seatOfSmallBlind = seatOfSmallBlind;
            this.seatOfBigBlind = seatOfBigBlind;
            this.pot = pot;
            this.turn = turn; 
        }
}

export class Seat {
    constructor (state, player, money, pendingMoney, play,
        cards, action, lastAction, lastBet, missingSB, missingBB, sum) {
            this.state = state;
            this.player = player;
            this.money = money;
            this.pendingMoney = pendingMoney;
            this.play = play;
            this.cards = cards;
            this.action = action;
            this.lastAction = lastAction;
            this.lastBet = lastBet;
            this.missingSB = missingSB;
            this.missingBB = missingBB;
            this.sum = sum;
        }

    get totalMoney () {
        return this.money + this.pendingMoney;
    }
}

export class Turn {
    constructor (seat, pot, call, canRaise,
        minRaise, maxRaise, timeout, timeToReact, timeBank) {
            if (!seat)
                seat = -1;
            this.seat = seat;
            this.pot = pot;
            this.call = call;
            this.canRaise = canRaise;
            this.minRaise = minRaise;
            this.maxRaise = maxRaise;
            this.timeout = timeout;
            this.timeToReact = timeToReact;
            this.timeBank = timeBank;
        }

    get canCheck () {
        return this.call == 0;
    }

    get canCall () {
        return this.call > 0;
    }
}

export class Pot {
    constructor (amount, seats) {
        this.amount = amount;
        this.seats = seats;
    }
}

export class PlayerResult {
    constructor (seat, fold, bet, prize, handCards, handRank) {
        this.seat = seat;
        this.fold = fold;
        this.bet = bet;
        this.prize = prize;
        this.handCards = handCards;
        this.handRank = handRank;
    }
}

export class PotResult {
    constructor (amount, prize, winners) {
        this.amount = amount;
        this.prize = prize;
        this.winners = winners;
    }
}

export class RoundResult {
    /**
     * 
     * @param {PlayerInfo[]} players 
     * @param {Pot} pots 
     */
    constructor (players, pots) {
        this.players = players;
        this.pots = pots;
    }

    get lestPlayers () {
        return this.players.filter(player => {
            return !player.fold;
        });
    }

    get winners () {
        return this.players.filter(player => {
            return player.prize > 0;
        });
    }
}

export class SeatShowCards {
    constructor (seat, cards) {
        this.seat = seat;
        this.cards = cards;
    }
}

export const myInfo = new PlayerInfo();
export const tableSettings = new TableSetting();
export const round = new TableStatus();
export const turn = new Turn();
let playerState = PlayerState.None;
let playerSeat = -1;
let type = "";

export function getPlayerSeat () {
    return playerSeat;
}

export function myMoneyInGame () {
    const seat = round.seats[playerSeat];
    if (!seat)
        return 0;
    return seat.money;
}

function onPlayerLeave (reason) {
    playerState = PlayerState.None;
    playerSeat = -1;
    triggerEventListeners("onPlayerLeave", reason);
}

function onPlayerInfo (info) {
    copyTo(info, myInfo);
    triggerEventListeners("onPlayerInfo", myInfo);
}

function onPlayerState (state) {
    playerState = state.state;
    triggerEventListeners("onPlayerState", playerState);
}

function onTableSettings (settings) {
    copyTo(settings, tableSettings);
    triggerEventListeners("onTableSettings", tableSettings);
}

function onTableStatus (status) {
    copyTo(status, round);
    playerSeat = status.seats.findIndex(seat => {
        return seat.player && (seat.player.name == myInfo.name);
    });
    const players = round.seats.map(seat => {
        return `${seat.state}(${seat.player ? seat.player.name : ""})`;
    });
    triggerEventListeners("onTableStatus", round);
    triggerEventListeners("onTurnChange", round.turn == playerSeat);
}

function onTableSidePots (res) {
    triggerEventListeners("onSidePots", res);
}

function onTableTurn (res) {
    copyTo(res, turn);
    if (turn.seat == undefined)
        turn.seat = -1;
    if (turn.seat >= 0) {
        if (turn.canRaise) {
            turn.minRaise = turn.raise[0];
            if (type == "plo")
                turn.maxRaise = turn.pot;
            else
                turn.maxRaise = turn.raise[1];
        } else {
            turn.minRaise = 0;
            turn.maxRaise = 0;
        }

        turn.timeout = turn.time[0];
        turn.timeToReact = turn.time[1];
        turn.timeBank = turn.time[2];
    } else {
        turn.call = 0;
        turn.canRaise = false;
        turn.minRaise = 0;
        turn.maxRaise = 0;
        turn.timeout = 0;
        turn.timeToReact = 0;
        turn.timeBank = 0;
    }

    triggerEventListeners("onRoundTurn", turn);
}

export function turnAction (action, bet = 0) {
    if (isNaN(bet))
        bet = 0;
    sendTurnAction(action, bet);
}

function onTableRoundResult (res) {
    let result = new RoundResult(res.players, res.pots);
    triggerEventListeners("onRoundResult", result);
}

export function showCards () {
    emit("REQ_PLAYER_SHOWCARDS");
}

function onTablePlayerShowCards (res) {
    const showCards = new SeatShowCards (res.seat, res.cards);
    triggerEventListeners("onShowCards", showCards);
}

export function waitForBB (value = true) {
    emit("REQ_PLAYER_WAITFORBB", {value: value});
}

export function sitOutNextHand (value = true) {
    emit("REQ_PLAYER_SITOUTNEXTHAND", {value: value});
}

export function sitOut () {
    emit("REQ_PLAYER_SITOUT");
}

export function sitIn () {
    emit("REQ_PLAYER_SITIN");
}

export function sitDown (seatIndex) {
    if (playerState != "Playing")
        playerSitDown(seatIndex);
}

subscribe("onPlayerLeave", onPlayerLeave);
subscribe("onPlayerInfo", onPlayerInfo);
subscribe("onTableSettings", onTableSettings);
subscribe("onPlayerState", onPlayerState);
subscribe("onTableStatus", onTableStatus);
subscribe("onTableSidePots", onTableSidePots);
subscribe("onTableTurn", onTableTurn);
subscribe("onTableRoundResult", onTableRoundResult);
subscribe("onTablePlayerShowCards", onTablePlayerShowCards);


export async function getOptions () {
    try {
    const options = await Get("/api/options");
    } catch {
        throw "Failed to connect to game server."
    }
}


function copyTo (source, destination) {
    for (const key in source)
        destination[key] = source[key];
}

const eventListeners = {};

function triggerEventListeners (name, data) {
    if (!eventListeners[name])
        return;
    try {
        data = JSON.parse(data);
    } catch {}
    eventListeners[name].forEach(listener => {
        listener(data);
    });
}

/**
 * Adds a function that will be called when the event is triggered.
 * @param {String} eventName 
 * @param {Function} callback 
 */
export function tableSubscribe (eventName, callback) {
    if (!eventListeners[eventName])
        eventListeners[eventName] = [];
    if (typeof callback !== 'function')
        throw "The callback should be a function";
    eventListeners[eventName].push(callback);
}

window.sitDown = sitDown;