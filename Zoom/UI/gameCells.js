import { addTab, gamesOfTab, indexOfTab } from "./tabs";
import { addGameToTabByUrl } from "./tabs";
import { subscribe } from "../socket-client";
import { delay } from "./popup";

const gamesTd = $("#gamesTd")[0];
gamesTd.innerHTML = "";

const tableTokenToClient = new Map();

const addGameButtonHTML = `
<div>
    <span>
        + Add Table
    </span>
</div>
`;

const returnWindowHTML = `
<div>
    <span>
        Return Window
    </span>
</div>
`;

const gamesDivHTML = `
<table>
    <tr>
        <td class="gameCell" index="0"></td>
        <td class="gameCell" index="1"></td>
        <td class="gameCell" index="4"></td>
    </tr>
    <tr>
        <td class="gameCell" index="2"></td>
        <td class="gameCell" index="3"></td>
        <td class="gameCell" index="5"></td>
    </tr>
    <tr>
        <td class="gameCell" index="6"></td>
        <td class="gameCell" index="7"></td>
        <td class="gameCell" index="8"></td>
    </tr>
</table>
`;

function sortedGameCellsOfDiv (div) {
    if (typeof div === "number")
        div = $(".gamesDiv")[div];
    let gameCells = $(div).find(".gameCell");
    gameCells = gameCells.sort((a,b) => {
        const aIndex = +(a.getAttribute('index'));
        const bIndex = +(b.getAttribute('index'));
        return aIndex - bIndex;
    });
    return gameCells;
}

function gameCellsOfTab (tab) {
    const tabIndex = indexOfTab(tab);
    return sortedGameCellsOfDiv(tabIndex);
}

export function populateGameCells (tab) {
    const games = gamesOfTab(tab);
    const gameCells = gameCellsOfTab(tab);
    const windowCount = viewWindowCountOfTab(tab);
    for (let i = 0; i < gameCells.length; i++) {
        const gameCell = gameCells[i];
        gameCell.innerHTML = "";
        if (i < windowCount)
            $(gameCell).addClass("active");
        else
            $(gameCell).removeClass("active");
        if (i < games.length) {
            if (games[i].iframe)
                gameCell.appendChild(games[i].iframe);
            else
                $(gameCell).removeClass("active");
        } 
    }
}

function makeReturnWindowButton (tab, gameCellIndex) {
    const button = document.createElement('div');
    button.className = "addGameButton";
    button.innerHTML = returnWindowHTML;
    button.addEventListener('click', () => {
        const game = gamesOfTab(tab)[gameCellIndex];
        showIframe(tab, gameCellIndex);
        game.returnToMainWindow();
    });
    button.style.display = "none";
    return button;
}

function viewWindowCountOfTab (tab) {
    if (typeof tab === 'number') 
        tab = $(".tab")[tab];
    const viewOptionsButton = $(tab).find(".viewOptionsButton.openButton")[0];
    return +(viewOptionsButton.getAttribute('windowCount'));
}

export function addGamesDiv () {
    const div = document.createElement('div');
    div.className = "gamesDiv";
    div.innerHTML = gamesDivHTML;
    gamesTd.appendChild(div);
    return div;
}

export function activateGamesDiv (tab) {
    const index = indexOfTab(tab);
    const divs = $(".gamesDiv");
    for (let i = 0; i < divs.length; i++) {
        const div = $(divs[i]);
        if (i == index)
            div.addClass("active");
        else
            div.removeClass("active");
    }

    activateGameCells(tab);
}

function activateGameCells (tab) {
    const gameCells = gameCellsOfTab(tab);
    const windowCount = viewWindowCountOfTab(tab);
    for (let i = 0; i < gameCells.length; i++) {
        const gameCell = gameCells[i];
        if (i < windowCount)
            $(gameCell).addClass("active");
        else
            $(gameCell).removeClass("active");
    }
}

export function addGameToGameCell (game, tab, gameCellIndex) {
    const gameCell = gameCellsOfTab(tab)[gameCellIndex];
    if (game.iframe) {
        gameCell.innerHTML = "";
        gameCell.appendChild(game.iframe);
        gameCell.appendChild(makeReturnWindowButton(tab, gameCellIndex));
    }
}

export function getEmptyGameCell(tab) {
    const gameCells = gameCellsOfTab(tab);

    for (let i = 0; i < gameCells.length; ++i) {
        if (gameCells[i].className.indexOf('active') > -1 && $(gameCells[i]).find('iframe').length === 0) {
            return i;
        }
    }
}

function showIframe (tab, gameCellIndex) {
    const gameCell = gameCellsOfTab(tab)[gameCellIndex];
    const iframe = $(gameCell).find("iframe")[0];
    iframe.style.display = "";
    const returnWindowButton = $(gameCell).find("div")[0];
    returnWindowButton.style.display = "none";
}

export function hideIframe (tab, gameCellIndex) {
    const gameCell = gameCellsOfTab(tab)[gameCellIndex];
    const iframe = $(gameCell).find("iframe")[0];
    iframe.style.display = "none";
    const returnWindowButton = $(gameCell).find("div")[0];
    returnWindowButton.style.display = "";
}

function highlightIframe (tab, gameCellIndex) {
    const gameCell = gameCellsOfTab(tab)[gameCellIndex];
    const iframe = $(gameCell).find("iframe")[0];
    iframe.style.filter = "drop-shadow(2px 4px 6px yellow)";
    // iframe.style.filter = "unset";
}

function restoreHighlightIframe (tab, gameCellIndex) {
    const gameCell = gameCellsOfTab(tab)[gameCellIndex];
    const iframe = $(gameCell).find("iframe")[0];
    iframe.style.filter = "unset";
}

async function onAddClient(res) {
    const tabs = $('.tab');

    const lastTab = tabs[tabs.length - 1];
    const lastTabGames = gamesOfTab(lastTab);
    if (lastTabGames.length >= viewWindowCountOfTab(lastTab)) {
        addTab();
        await delay();
        await delay();
        await delay();
        await delay();
    }

    const newTabs = $('.tab');
    const targetTab = newTabs[newTabs.length - 1];
    const targetTabGames = gamesOfTab(targetTab);

    tableTokenToClient.set(getT(res.url), {tab: targetTab, cellIndex: targetTabGames.length})
    activateGamesDiv(targetTab)
    addGameToTabByUrl(res.url, targetTab, targetTabGames.length)

    // for (let i = 0; i < tabs.length; ++i) {
    //     const tab = tabs[i];
    //     const games = gamesOfTab(tab)
    //     const windowCount = viewWindowCountOfTab(tab);
        
    //     if (games.length < windowCount) {
    //         tableTokenToClient.set(getT(res.url), {tab: tab, cellIndex: games.length})
    //         activateGamesDiv(tab)
    //         addGameToTabByUrl(res.url, tab, games.length)    
            
    //         return;
    //     }
    // }
}

export function getT (url) {
    const matches = url.match(`t=([^&]+)`);
    if (matches)
        return matches[1];
}

// function onTurn(token) {
//     const client_data = tableTokenToClient.get(token)

//     highlightIframe(client_data.tab, client_data.cellIndex)
// }

// window.onmessage = function(e) {
//     console.log(e.data)

//     const client_data = tableTokenToClient.get(e.data.t)

//     if (e.data.turn) {
//         highlightIframe(client_data.tab, client_data.cellIndex)
//     }
//     else {
//         restoreHighlightIframe(client_data.tab, client_data.cellIndex)
//     }
// };

subscribe("onAddClient", onAddClient);
// subscribe("onTurn", onTurn);