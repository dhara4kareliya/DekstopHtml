import { Game, selectGame } from "../services/game-communicator";
import { activateGamesDiv, addGamesDiv, addGameToGameCell, getEmptyGameCell, populateGameCells } from "./gameCells";
import { delay, setupGameButton, setupViewOptionOpenButton } from "./popup";


const tabsDiv = $("#tabsDiv")[0];
const numberOfGamesSpan = $("#numberOfGames")[0];

const tabHTML = `
<table class="tabTop">
    <tr>
        <td>
            <span class="index">1</span>
            (<span class="numberOfGames">4</span> Games)
        </td>
        <td>
            <div class="viewOptionsButton openButton" windowCount="9">
                <table>
                    <tr>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                        <td>
                            <div></div>
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>
`;

const gameButtonHTML = `
<span class="tableName">
    BLUE TABLE
</span>
<span class="statusText" style="width: 6vw"></span>
<img class="menuIcon" src="./images/Group 11@2x.png"/>
<div class="gameActionsContainer"></div>
<div class="turnTime">
    <div></div>
</div>
`;

function getTabElement (index) {
    return $(".tab")[index];
}

/* An array of data representation of tabs.
    The elements in the sub-arrays are Game instances */
const tabs = [];

const gameUrls = [];

export function gamesOfTab (tab) {
    if (typeof tab !== "number")
        tab = indexOfTab(tab);
    return tabs[tab];
}

export function indexOfTab (tab) {
    if (typeof tab === "number")
        return tab;
    const tabsElements = $(".tab");
    for (let i = 0; i < tabsElements.length; i++) {
        if (tabsElements[i] == tab)
            return i;
    }
}

function updateNumberOfGamesSpan () {
    numberOfGamesSpan.innerText = 
    $(".gameButton").length;
}

export function addTab () {
    addGamesDiv();
    tabs.push([]);
    const tab = document.createElement('div');
    tabsDiv.appendChild(tab);
    tab.className = "tab";
    tab.innerHTML = tabHTML;
    const tabCount = $(".tab").length;
    updateTab(tabCount - 1);
    const viewOptionsButton = $(tab).find(".viewOptionsButton.openButton")[0];
    setupViewOptionOpenButton(viewOptionsButton);
    populateGameCells(tab);
    tab.addEventListener('click', () => {
        activateGamesDiv(tab);
    });
    return tab;
}

function updateTab (tabIndex) {
    const tab = getTabElement(tabIndex);
    $(tab).find(".index")[0].innerText = `${tabIndex + 1}`;
    $(tab).find(".numberOfGames")[0].innerText = `${tabs[tabIndex].length}`;
}

export function addGameToTabByUrl (gameUrl, tab, gameCellIndex) {
    if (typeof tab !== "number")
        tab = indexOfTab(tab);
    const game = new Game(gameUrl);
    tabs[tab].push(game);
    const gameButton = makeGameButton(game);
    getTabElement(tab).appendChild(gameButton);
    updateNumberOfGamesSpan();
    updateTab(tab);
    setupGameButton(gameButton, tab);
    addGameToGameCell(game, tab, gameCellIndex);
}

export async function refreshAfterMigration (prevTabIndex) {
    updateNumberOfGamesSpan();
    updateTab(prevTabIndex);
    // populateGameCells(prevTabIndex);
    const games = gamesOfTab(prevTabIndex);

    for (const game of games) {
        const parent = $(game.iframe).parent();
        parent[0].innerHTML = '';
    }

    const gameButtons = $($(".tab")[prevTabIndex]).find('.gameButton');

    activateGamesDiv(prevTabIndex);
    await delay();
    await delay();
    await delay();
    for (let i = 0; i < games.length; ++i) {
        const newGame = new Game(games[i].src);
        games[i] = newGame;
        addGameToGameCell(newGame, prevTabIndex, i);

        const gameButton = gameButtons[i];
        bindGameButton(newGame, gameButton);

        await delay();
        await delay();
    }

}

export function removeGameFromTabs (prevTabIndex, gameIndex) {
    tabs[prevTabIndex].splice(gameIndex, 1);
}

export function addGameToTabByGame (game, tab, currentGameButton) {
    if (typeof tab !== "number")
        tab = indexOfTab(tab);

    const newGame = new Game(game.src);
    tabs[tab].push(newGame);
    updateNumberOfGamesSpan();
    updateTab(tab);
    const gameCellIndex = getEmptyGameCell(tab);
    addGameToGameCell(newGame, tab, gameCellIndex);
    
    bindGameButton(newGame, currentGameButton);
    getTabElement(tab).appendChild(currentGameButton);
    setupGameButton(currentGameButton, tab);
}

function bindGameButton (newGame, currentButton) {
    currentButton.game = newGame;
    newGame.addEventListener('update', e => {
        updateGameButton(currentButton, e);
        // updateGameCell(newGame, e);

        for (const [key, value] of Object.entries(e)) {
            game.detail[key] = value
        }
    });

    currentButton.addEventListener('click', () => {
        selectGame(newGame);
    });
}

function makeGameButton (game) {
    const button = document.createElement('div');
    button.game = game;
    button.className = "gameButton";
    button.innerHTML = gameButtonHTML;
    game.addEventListener('update', e => {
        updateGameButton(button, e);
        // updateGameCell(game, e);

        for (const [key, value] of Object.entries(e)) {
            game.detail[key] = value
        }
    });
    button.addEventListener('click', () => {
        selectGame(game);
    });
    return button;
}

function updateGameCell (game, detail) {
    if (detail.status === 'turn')
        // game.iframe.style.filter = "drop-shadow(2px 4px 6px yellow)";
        $(game.iframe).addClass('turn');
    else
        // game.iframe.style.filter = "unset";
        $(game.iframe).removeClass('turn');
}

function updateGameButton (button, detail) {
    updateGameCell(button.game, detail);

    button = $(button);
    button.find(".tableName")[0].innerText = detail.tableName;
    updateTurnDuration(button, detail.turnDuration);
    updateGameButtonStatus(button, detail.status);

    var gamesTd = $("#gamesTd")[0];
    var gamesDiv = gamesTd.querySelector('.gamesDiv.active');
    var gameIframe = gamesDiv.querySelector('iframe.turn');
    var autoFocus = $("#autoFocus")[0];
    if (!gameIframe && detail.status === 'turn' && autoFocus.checked == true) {
        activateGamesDiv($(button).closest('.tab')[0]);
    }



}

function updateGameButtonStatus (button, status) {
    // If this is a vanilla element get the jquery element instead.
    if (!button.removeClass)
        button = $(button);
    for (const statusClass of ["next", "turn", "win", "lose"]) {
        button.removeClass(statusClass);
    }
    button.addClass(status);
    const turnTimeBar = button.find(".turnTime div")[0];
    restartAnimation(turnTimeBar);
}

function updateTurnDuration (button, duration) {
    // If this is a vanilla element get the jquery element instead.
    if (!button.find)
        button = $(button);
    const turnTimeBar = button.find(".turnTime div")[0];
    turnTimeBar.style.animationDuration = `${duration}s`;
}

function restartAnimation(element) {
    if (!element)
        return;
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
}

window.addEventListener('load', () => {
    // for (let i = 0; i < 4; i++)
        addTab();
});