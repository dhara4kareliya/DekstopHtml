import { hideIframe, activateGamesDiv, getEmptyGameCell, populateGameCells } from "./gameCells";
import { addGameToTabByGame, addGameToTabByUrl, addTab, gamesOfTab, refreshAfterMigration, removeGameFromTabs } from "./tabs";
import { indexOfElementInSelector, indexOfElementInSelector_1 } from "./util";

const viewOptionsMenu = $("#viewOptionsMenu")[0];
const gameActionsMenu = $("#gameActionsMenu")[0];
const viewOptionsMenuButtons = $("#viewOptionsMenu .viewOptionsButton");
const externalWindowButton = $("#externalWindowButton")[0];


let selectedTabIndex = 0;
let selectedGameIndex = 0;

gameActionsMenu.addEventListener('click', () => {
    // Clicking on the actions menu also activates the onclick of the gameButton.
    // So, we remove the class after it is added.
    setTimeout(() => {
        $(gameActionsMenu).removeClass("active");
    },10);
});

// externalWindowButton.addEventListener('click', moveGameToExternalWindow);
externalWindowButton.addEventListener('click', moveGameToNewTab);

export function setupViewOptionOpenButton (button) {
    button.addEventListener('click', () => {
        $(button).parent().prepend(viewOptionsMenu);
        setTimeout(() => {
            $(viewOptionsMenu).addClass("active");
            $(gameActionsMenu).removeClass("active");
        });
        selectedTabIndex = indexOfElementInSelector_1(button, ".viewOptionsButton.openButton");
    });
}

export function setupGameButton (button, tabIndex) {
    const menuIcon = $(button).find('.menuIcon')[0];
    menuIcon.addEventListener('click', () => {
        if (!button.parentNode) return;

        const elements = $(gameActionsMenu).find('.migrateTab');
        $(gameActionsMenu).find('.migrateTab').remove();
        const tabs = $('.tab');
        for (var i = 0; i < tabs.length; ++i) {
            if (i == tabIndex) continue;

            const div = document.createElement('div');
            div.setAttribute('index', i);
            div.className = 'migrateTab';
            div.innerHTML = '<img src="./images/exit@2x.png"> Move To Screen' + (i + 1)
            $(gameActionsMenu).append(div);

            div.addEventListener('click', (e) => { moveGameToOtherTab(e) });
        }

        const gameActionsContainer = $(button).find(".gameActionsContainer")[0];
        $(gameActionsContainer).append(gameActionsMenu);
        setTimeout(() => {
            $(gameActionsMenu).addClass("active");
            $(viewOptionsMenu).removeClass("active");
        });
        selectedGameIndex = indexOfElementInSelector(button, ".gameButton")
        selectedTabIndex = indexOfElementInSelector(button.parentNode, ".tab")
    });
}

window.addEventListener('click', function(e){   
    if (!document.getElementById('gameActionsMenu').contains(e.target)){
        $(gameActionsMenu).removeClass("active");
    }
  });

const gameButtons = $(".gameButton");

for (const button of gameButtons) {
    setupGameButton(button);
}

function getViewOptionsOpenButtonByIndex (tabIndex) {
    return $(".viewOptionsButton.openButton")[tabIndex];
}

for (const button of viewOptionsMenuButtons) {
    button.addEventListener('click', () => {
        getViewOptionsOpenButtonByIndex(selectedTabIndex).setAttribute(
            "windowcount",
            button.getAttribute("windowcount")
        );
        $(viewOptionsMenu).removeClass("active");
        rearrangeGameCellsOfTab(selectedTabIndex);
    });
}

async function rearrangeGameCellsOfTab (tabIndex) {
    const games = gamesOfTab(selectedTabIndex);
    const cellCounts = +(getViewOptionsOpenButtonByIndex(tabIndex).getAttribute('windowcount'));

    if (games.length < cellCounts)
        return;
    
    const length = games.length;
    for (let i = cellCounts; i < length; ++i) {
        for (let tab = 0; tab < 4; ++tab) {
            if (tab != tabIndex && getEmptyGameCell(tab) !== undefined) {
                const game = gamesOfTab(tabIndex)[cellCounts];
                game.iframe.remove();
                removeGameFromTabs(tabIndex, cellCounts);

                const gameButtons = $($(".tab")[tabIndex]).find('.gameButton');
                const currentGameButton = gameButtons[cellCounts];
                currentGameButton.remove();

                await delay();
                await delay();
                activateGamesDiv(tab);
                addGameToTabByGame(game, tab, currentGameButton);
                await delay();
                await delay();

                break;
            }
        }
    }
    await delay();
    await refreshAfterMigration(tabIndex);
}

function moveGameToExternalWindow () {
    const game = gamesOfTab(selectedTabIndex)[selectedGameIndex];
    window.externalWindow = game.moveToExternalWindow();
    hideIframe(selectedTabIndex, selectedGameIndex);
}

async function moveGameToNewTab () {
    addTab();
    await delay();
    await delay();
    await delay();

    const tabs = $('.tab');
    const targetIndex = tabs.length - 1;
    
    if (getEmptyGameCell(targetIndex) === undefined)
        return;

    const game = gamesOfTab(selectedTabIndex)[selectedGameIndex];
    const parent = $(game.iframe).parent();
    parent[0].innerHTML = '';
    // gamesOfTab(selectedTabIndex).splice(selectedGameIndex, 1);

    const gameButtons = $($(".tab")[selectedTabIndex]).find('.gameButton');
    const currentGameButton = gameButtons[selectedGameIndex];
    currentGameButton.remove();
    
    await delay();
    activateGamesDiv(selectedTabIndex);
    removeGameFromTabs(selectedTabIndex, selectedGameIndex);
    await refreshAfterMigration(selectedTabIndex);

    await delay();
    await delay();
    await delay();
    activateGamesDiv(targetIndex);
    addGameToTabByGame(game, targetIndex, currentGameButton);
}

export const delay = () => new Promise(res => setTimeout(res, 100));

async function moveGameToOtherTab (e) {
    const targetIndex = +(e.currentTarget.getAttribute('index'));
    
    if (getEmptyGameCell(targetIndex) === undefined)
        return;

    const game = gamesOfTab(selectedTabIndex)[selectedGameIndex];
    const parent = $(game.iframe).parent();
    parent[0].innerHTML = '';
    // gamesOfTab(selectedTabIndex).splice(selectedGameIndex, 1);

    const gameButtons = $($(".tab")[selectedTabIndex]).find('.gameButton');
    const currentGameButton = gameButtons[selectedGameIndex];
    currentGameButton.remove();
    
    await delay();
    activateGamesDiv(selectedTabIndex);
    removeGameFromTabs(selectedTabIndex, selectedGameIndex);
    await refreshAfterMigration(selectedTabIndex);

    await delay();
    await delay();
    await delay();
    activateGamesDiv(targetIndex);
    addGameToTabByGame(game, targetIndex, currentGameButton);
}