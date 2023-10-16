export const modes = Object.freeze({
    None: 0,
    Joining: 1, 
    Playing: 2
});

export const playerStates = Object.freeze({
    None: 0,
    Leaving: 1,
    Joining: 2,
    SitOut: 3,
    Waiting: 4,
    Playing: 5
});

let currentMode = modes.None;

export function setMode (mode) {
    currentMode = mode;
}

export function clearTurn () {

}

export function setShowDollarSign (value) {

}



export default {
    modes,
    playerStates,
    setMode,
    clearTurn,
    setShowDollarSign
}