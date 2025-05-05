import { tableSettings, onMessage, getPlayerSeat } from "../services/table-server";
import { defaultCurrency } from '../services/game-server';
import { submitSideBet, hitGame01, dealGame02 } from "../socket-client";
import { getcurrencyIcon, getMoneyText, getMoneyValue, round2 } from "./money-display";
import { getCardImageFilePath } from './card-ui';
import { modes, sound } from "./table-ui";
import { getMessage } from "./language-ui";
import { generateHashAndRandomString } from '../services/utils-server';

const submitButton = $('#submit-sidebet')[0];
const streetsOnSideBet = new Map();
streetsOnSideBet.set('PreCards', 'Next Cards');
streetsOnSideBet.set('PreFlop', 'Flop');
streetsOnSideBet.set('Flop', 'Turn');
streetsOnSideBet.set('Turn', 'River');
streetsOnSideBet.set('HolePreCards', 'Next Hole Cards');
const sideBetTabsDiv = $(".sideBetTabs")[0];
const sidebetGame01Chips = $(".bet-chips button");
const sideberGameSubmitBtn = $(".hitme")[0];
/* const streetLabel = $(".text-street")[0]; */
const sidebetPanel = $(".side-bet_div")[0];
const aboutSideGame = $(".aboutSideGame")[0];
const sideBetBottomBar = $(".sideBetBottomBar")[0];
const aboutSideBetNote = $(".aboutSideBetNote")[0];
const sidebetMaxCount = 7;
const gameModes = Object.freeze({
    None: 0,
    Game01: 1,
    Game02: 2,
    Game03: 3,
});

let totalWinningAmount = 0;
let freeBalance = 1000;
let hash = undefined;
let randomString = undefined;

export class SidebetUI {
    constructor(mainUI) {
        this.mainUI = mainUI;
        this.sidebetStreet = undefined;
        this.originalSidebetOption = { street: "none" };
        this.currentSidebetOption = undefined;
        this.centerButtonId = 'buttoncenter';
        this.gameBetBBRatio = 0;
        this.isGame01Visible = false;
        this.currentGameMode = gameModes.None;
        this.isPlayerFold = false;
        this.gameBetSizes = new Map();
        this.sidebetBB = 0;
        this.totalAmount = 0;
        this.sidegameEnabled = false;
        this.sideBetEnabled = false;
        this.isHideSideBetOption = false;
        this.isShowPanel = null;
        this.init();
    }

    init() {
        updateTotalPaid(0);
        // updateFreeBalance(0);
        this.gameBetSizes.set(gameModes.Game01, [1, 2, 4]);
        this.gameBetSizes.set(gameModes.Game02, [2, 4, 8]);
        submitButton.style.visibility = "hidden";
        setTimeout(() => {
            aboutSideBetNote.innerHTML = getMessage("aboutSideBet");
        }, 2000);

        submitButton.addEventListener('click', () => {
            submitButton.style.visibility = "hidden";

            let sidebets = [];
            let count = 0;
            const elements = $('.betButton');
            for (const button of elements) {
                if (count >= sidebetMaxCount) break;

                if (button.classList.contains('selected')) {
                    sidebets.push(button.id);
                    count++;
                }
            }
            submitSideBet(sidebets, this.sidebetStreet, this.currentSidebetOption.streetText === "HolePreCards", addSidebetCard);
            sound.submitBet();
            this.removeSidebetOptions();
            this.initSideBetPanel();
        });

        for (const chip of sidebetGame01Chips) {
            chip.addEventListener('click', (e) => {
                const clickedButtonId = e.target.parentNode.id;
                const clickedButton = document.getElementById(clickedButtonId);
                const centerButton = document.getElementById(this.centerButtonId);

                this.gameBetBBRatio = clickedButton.querySelector('img').getAttribute('value');
                // Add class "tobottom" to the image of the clicked button
                clickedButton.querySelector('.tarimg').classList.add('totop');

                // Remove class "totop" from the image of the center button
                centerButton.querySelector('.tarimg').classList.remove('totop');

                // Store the HTML content of the center button
                const temp = centerButton.querySelector('img').outerHTML;

                // Swap the HTML content of centerButton with the clickedButton
                centerButton.querySelector('img').outerHTML = clickedButton.querySelector('img').outerHTML;
                clickedButton.querySelector('img').outerHTML = temp;

                centerButton.id = clickedButtonId;
                clickedButton.id = this.centerButtonId;

                // Set the new center button id for the next click
                this.centerButtonId = clickedButtonId;

                const betSizes = [];
                for (let i = 1; i <= 3; ++i) {
                    betSizes.push($(`.bigcoin${i} img`)[0].getAttribute('value'));
                }
                this.gameBetSizes.set(this.currentGameMode, betSizes);
            });
        }

        sideberGameSubmitBtn.addEventListener('click', () => {
            this.removeAllSidegameCards();

            this.disableGameChenge(true);
            if (tableSettings.isEncryptedShuffling) {
                const generatedInfo = generateHashAndRandomString();
                hash = generatedInfo.hash;
                randomString = generatedInfo.randomString;
            }

            if (this.currentGameMode == gameModes.Game01) {
                hitGame01(this.gameBetBBRatio, hash, (data) => this.showGame01Result(data));
            } else if (this.currentGameMode == gameModes.Game02) {
                dealGame02(this.gameBetBBRatio, hash, (data) => this.showGame02Result(data));
            }

        });

        aboutSideGame.addEventListener('click', () => {

            if (this.currentGameMode == gameModes.Game01) {
                this.changeModalPositionAccordingButton(aboutSideGame);
                $('.sidebet-note')[0].innerHTML = getMessage('aboutSideGame');
                $("#modal-note").modal('show');
            } else if (this.currentGameMode == gameModes.Game02) {
                $('#modal-game').modal('show');
            }
        });
    }

    getRandomString() {
        return randomString;
    }

    removeSidebetCards(result) {
        if (!!result && result.length > 0)
            for (const list of result) {
                const element = $(`.sidebet_card#${list.streetName +'-'+ list.betName.split(' ').join('-')}`);
                element.remove();
            }
    }

    addCards(cards) {
        const elements = $('.sidebet_card');

        for (const element of elements) {
            const h1Element = $(element).find('h1')[0];
            h1Element.innerText = h1Element.innerText + '(' + cards.join(',') + ')';
        }
    }

    removeAllSidebetCards() {
        $('.sidebet_card').remove();
    }

    removeSidebetOptions() {
        $(".scroll_prents").find('.fund_prent').remove();
        this.totalAmount = 0;
        $('#total-payout')[0].innerText = '0';
    }

    showSidebetCardsResult(result) {
        if (!!result && result.length > 0)
            for (const list of result) {
                const element = $(`.sidebet_card#${list.streetName +'-'+ list.betName.split(' ').join('-')}`);
                if (list.award > 0) {
                    $(element).find('.sideBetResult')[0].innerHTML = `<div class="win-cards"><img src="./images/win.png" alt=""></div>
                         <div class="wind-card-second"><img src="./images/flower.gif" alt=""></div>`;
                    element[0].classList.remove("pending");
                    /* element[0].classList.add("winning"); */
                } else {
                    $(element).find('.sideBetResult')[0].innerHTML = `<div class="loose-card"><img src="./images/loose.png" alt=""></div>

                        <div class="loose-card-second loose-card1"><img src="./images/loose.gif" alt=""></div>`;
                    element[0].classList.remove("pending");
                    /* element[0].classList.add('losing'); */
                }
            }
    }

    initSideBetPanel() {
        this.totalAmount = 0;
        $('#total-payout')[0].innerText = '0';

        const payoutBtns = $(".scroll_prents").find(".button_payout");
        for (const payoutbtn of payoutBtns) {
            payoutbtn.style.visibility = 'hidden';
        }

        const elements = $('.betButton');
        for (const button of elements) {
            if (button.classList.contains('selected')) {
                button.classList.remove("selected");
            }
        }
    }

    changeModalPositionAccordingButton(element) {
        var button = $(element);
        var offset = button.offset();
        var modalDialog = $('#modal-note .modal-dialog');

        // Set modal position based on button's position
        modalDialog.css({
            top: offset.top + button.outerHeight() + 30,
            //left: offset.left
        });
    }

    updateSideBetHistory(res) {
        setTimeout(() => {
            this.showSidebetCardsResult(res.results);
        }, 3000);
        setTimeout(() => {
            if (!res.unclaimed)
                this.removeSidebetCards(res.results);

            if (this.isGame01Visible && gameModes.Game03 === this.currentGameMode) {

                this.showGamePanel(this.currentGameMode);
            }
        }, 5000);


        if (Number(res.totalReward) > 0) {
            var img = getcurrencyIcon().outerHTML;
            var balance = round2(res.totalReward);
            $('.top_200')[0].innerHTML = `<div class="imageFeatures">${img} <span>${balance}</span></div>`;
            setTimeout(() => {
                sound.winSideBet();
                $('.winner_trofie')[0].style.backgroundSize = '100% 100%';
                $('#modal-wining-payout').modal('show');
            }, 3000);

            setTimeout(() => {
                $('#modal-wining-payout').modal('hide');
                updateTotalPaid(Number(res.totalReward));
            }, 5000);
        }

        console.log('Winning History', res.historyLists);
        let total = 0;
        let div = '';

        if (!!res.historyLists && res.historyLists.length > 0)
            for (const list of res.historyLists) {
                total = total + list.award;
                let day = new Date(list.timestamp).getDay();
                const hour = new Date(list.timestamp).getHours();
                const min = new Date(list.timestamp).getMinutes();
                var sideBetResult = "";
                if (list.award > 0) {
                    sideBetResult = `<div class="win-card"><img src="./images/win.png" alt=""></div>
                        <div class="wind-card-second"><img src="./images/flower.gif" alt=""></div>`
                } else {
                    sideBetResult = `<div class="loose-card"><img src="./images/loose.png.png" alt=""></div>
                    <div class="loose-card-second loose-card1"><img src="./images/loose.gif" alt=""></div>`;
                }
                var img = getcurrencyIcon().outerHTML;
                var balance = list.award;
                div = div + `<div class="fund_prents flop-card flop-card-four">
                        <div class="flop-title">${list.streetName}</div>
                        <div class="flop-content">${list.betName}</div>
                        <div class="flop-payout">Payout: <span>${img} ${balance}</span></div>
                        ${sideBetResult}
                    </div>`;
            }

        $("#bets-history-content").find('.fund_prents').remove();
        $("#bets-history-content").append(div);
        //const totalText = getMoneyText(total);
        /*  $(".sidebet-total-win")[0].innerHTML = totalText.outerHTML; */
    }

    setSidebetBB(value) {
        this.sidebetBB = value;
    }

    setSideGameStatus(value) {
        this.sidegameEnabled = value;
    }

    setCurrentSidebetOptions(street, streetText, options) {
        this.originalSidebetOption = { street, streetText, options };
        this.sideBetTabs();
    }

    setSideBetStatus(value) {
        this.sideBetEnabled = value;
    }

    setNewFreeBalance(balance) {
        updateFreeBalance(balance);
    }

    setFoldStatusAndSideGamePanel(value) {
        if (this.isPlayerFold == value) return;

        this.isPlayerFold = value;
        if (this.isPlayerFold) {
            this.toggleSideBetAndGame(true);
        } else {
            this.sideBetTabs();
        }
    }

    toggleSideBetAndGame(value) {
        if (this.isGame01Visible && value) return;

        this.isGame01Visible = value;
        if (!value) {
            this.showSideBet(true);
        } else if (this.sidegameEnabled) {
            this.showSideBet(false);
            this.removeAllSidegameCards();
        }
        this.sideBetTabs();
    }

    showSideBet(value) {
        const game01Div = $('.gane_div_prents')[0];
        const game02Div = $('#scroll_bar')[0];

        if (value) {
            game01Div.style.display = 'none';
            game02Div.style.display = '';
            $('.text_div')[0].classList.remove('d-none');

        } else {
            game02Div.style.display = 'none';
            game01Div.style.display = '';
            $('.text_div')[0].classList.add('d-none');
        }
    }

    showGamePanel(mode) {
        if (!this.sidegameEnabled && mode != gameModes.Game03) return;
        if (mode == gameModes.Game02) {
            sideberGameSubmitBtn.innerText = 'DEAL ME';

            /*  streetLabel.innerText = "New Deal"; */
        } else if (mode == gameModes.Game01) {
            sideberGameSubmitBtn.innerText = 'HIT ME';

            /*   streetLabel.innerText = "Hit The Dealer"; */
        } else if (mode == gameModes.Game03) {
            this.isHideSideBetOption = false;

            this.updateSideBetOptions(tableSettings.precardSidebetOptions.street, "HolePreCards", tableSettings.precardSidebetOptions.options);
            return;
        } else if (mode == gameModes.None) {
            return;
        }

        const betSizes = this.gameBetSizes.get(this.currentGameMode);
        this.gameBetBBRatio = Number(betSizes[1]);
        const currency = (defaultCurrency === "USDC") ? "usdc" : "xrp";
        var chiplogo = (tableSettings.mode === 'cash') ? 'bb' : currency;
        for (let i = 0; i < 3; ++i) {
            $(`.bigcoin${i + 1} img`)[0].setAttribute('src', `images/sidebet_chip_${betSizes[i]+chiplogo}.svg`);
            $(`.bigcoin${i + 1} img`)[0].setAttribute('value', betSizes[i]);
        }
    }

    removeAllSidegameCards() {
        $('.row2 .card11').remove();
        $('#dealer_cards div').remove();
        $('#player_cards div').remove();
    }

    sideBetTabs() {
        var html = '';
        if (getPlayerSeat() == -1)
            return;
        var showPanel = false;
        var showBetHistory = false;
        if (this.isGame01Visible) {
            const activeGame = (game) => { return (this.currentGameMode == game || (this.currentGameMode === gameModes.None && game == gameModes.Game01)) ? "active" : ""; };
            showPanel = this.sidegameEnabled;
            var HolePreCards = "";
            if (this.sideBetEnabled && tableSettings.mode === "cash" && tableSettings.isRandomTable != true && this.isPlayerFold) {
                HolePreCards = `<button class="side-bet-panel-btn-second ${activeGame(gameModes.Game03)}" data-tab="Game03">${streetsOnSideBet.get("HolePreCards")}</button>`;
            }

            if (this.currentGameMode === gameModes.None || (HolePreCards === "" && this.currentGameMode === gameModes.Game03)) {
                this.currentGameMode = gameModes.Game01;
                this.showGamePanel(this.currentGameMode);
                this.showSideBet(false);
            }
            html = `<button class="side-bet-panel-btn-second ${activeGame(gameModes.Game01)}" data-tab="Game01">Hit The Dealer</button><button class="side-bet-panel-btn-first ${activeGame(gameModes.Game02)}" data-tab="Game02">New Deal</button>${HolePreCards}`;
        } else {

            showPanel = this.sideBetEnabled;

            if (this.originalSidebetOption.street !== undefined && this.originalSidebetOption.street !== "none")
                html = `<button class="side-bet-panel-btn-third active" data-tab="originalSidebe">${streetsOnSideBet.get(this.originalSidebetOption.streetText)}</button>`;

            if (tableSettings.precardSidebetOptions.street !== undefined && tableSettings.mode === "cash" && tableSettings.isRandomTable != true && this.originalSidebetOption.street !== tableSettings.precardSidebetOptions.street)
                html += `<button class="side-bet-panel-btn-third" data-tab="precardSidebet">${streetsOnSideBet.get(tableSettings.precardSidebetOptions.streetText)}</button>`;

            showBetHistory = (html == '');
            html += `<button class="side-bet-panel-btn-third ${showBetHistory ? 'active' : ''}" data-tab="bets">Bets</button>`;
            this.setDisplay(sideBetBottomBar, !showBetHistory);
        }

        this.showPanel(showPanel);

        if (!showPanel)
            return;

        sideBetTabsDiv.innerHTML = html;
        this.showBetHistory(showBetHistory);

        const sideBetTabsButton = $(sideBetTabsDiv).find("button");

        for (const button of sideBetTabsButton) {
            button.addEventListener('click', () => {
                this.setActiveTab(button);
            });
        }
    }

    setActiveTab(button) {
        const sideBetTabsButton = $(sideBetTabsDiv).find("button");
        const tab = button.getAttribute("data-tab");
        sideBetTabsButton.removeClass("active");

        if (this.isGame01Visible) {
            if (tab === "Game02")
                this.currentGameMode = gameModes.Game02;
            else if (tab === "Game01")
                this.currentGameMode = gameModes.Game01;
            else if (tab === "Game03") {
                this.currentGameMode = gameModes.Game03;
                this.showBetHistory(false);
            }


            this.removeSidebetOptions();
            this.removeAllSidegameCards();
            this.showGamePanel(this.currentGameMode);
            this.showSideBet(tab === "Game03");
        } else {

            if (tab === "originalSidebe")
                this.updateSideBetOptions(this.originalSidebetOption.street, this.originalSidebetOption.streetText, this.originalSidebetOption.options);
            else if (tab === "precardSidebet")
                this.updateSideBetOptions(tableSettings.precardSidebetOptions.street, tableSettings.precardSidebetOptions.streetText, tableSettings.precardSidebetOptions.options);

            this.showBetHistory(tab === "bets");
        }

        this.setDisplay(sideBetBottomBar, tab !== "bets");
        button.classList.add("active");
    }

    setDisplay(element, value) {
        element.style.display = value ? "block" : "none";
    }

    showBetHistory(value) {
        const betsOptionsContent = $("#bets-options-content")[0];
        const betsHistoryContent = $("#bets-history-content")[0];
        betsOptionsContent.classList.remove("active");
        betsHistoryContent.classList.remove("active");

        if (value)
            betsHistoryContent.classList.add("active");
        else
            betsOptionsContent.classList.add("active");
    }

    updateSideBetOptions(street, streetText, options) {
        if (this.isPlayerFold && !this.sidegameEnabled) return;

        if (this.isGame01Visible && streetText != "HolePreCards") return;

        this.sidebetStreet = street;
        this.removeSidebetOptions();

        if (!this.isGame01Visible || this.currentGameMode == gameModes.Game03) {
            /* treetLabel.innerText = streetsOnSideBet.get(streetText) || "Street"; */
        }
        submitButton.style.visibility = "hidden";

        if (!street) return;

        this.currentSidebetOption = { street, streetText, options };
        let streetActivBets = ($(`.sidebet_cards > .sideBet-${streetText}`).length || 0);
        if (streetText === "HolePreCards")
            streetActivBets = streetActivBets + ($(`.sidebet_cards > .sideBet-PreCards`).length || 0);

        if (streetActivBets > 0 || this.isHideSideBetOption) {
            options = [];
        }
        var img = getcurrencyIcon().outerHTML;
        let div = '';
        for (const option of options) {
            div = div + `<div class="flash-draw-second fund_prent">
                            <div class="flash-draw">
                                <div class="flash-draw-before"></div>

                                <h5 class="bet-name" >${option.betName}</h5>
                                <div class="flash-draw-img">
                                    <img class="flash-draw-img flash-draw-img-first" src="./images/desktop/question.png" alt="">
                                    <div class="hover-container">
                                    ${option.note}
                                    </div>
                                </div>
                            </div>
                            <div class="flash-bet-content">
                                <div class="flash-bet-content-head">
                                    <h4 class="bet-ratio"><span>X</span> ${Number(option.ratio)}</h4>
                                    <div class="button_payout text-yellow1" style="visibility: hidden">
                                    <p class="text-yellow"  >Payout: ${img}<span class="total-payout-value" id="payout">0</span> </p>
                                    </div>
                                </div>
                                <div class="flash-bet-box">
                                    <button id="${option.betName}-${this.sidebetBB * 2}" class="betButton">${img} ${(round2(this.sidebetBB * 2 ))}</button>
                                    <button id="${option.betName}-${this.sidebetBB * 5}" class="betButton">${img} ${(round2(this.sidebetBB * 5))}</button>
                                    <button id="${option.betName}-${this.sidebetBB * 10}" class="betButton">${img} ${(round2(this.sidebetBB * 10))}</button>
                                </div>
                            </div>
                        </div>`;
        }
        $(".scroll_prents").append(div);

        /*  const questionIcons = $('.icon-question');
         for (const icon of questionIcons) {
             icon.addEventListener('click', (e) => {
                 this.changeModalPositionAccordingButton(icon);
                 $('.sidebet-note')[0].innerText = $(e.currentTarget).find("#sidebet-note")[0].innerText;
             });
         } */
        updateFreeBalance(freeBalance);
        updateTotalPaid(0);

        $(".totalPayout")[0].innerHTML = img;
        const elements = $('.betButton');
        for (const button of elements) {
            button.addEventListener('click', (e) => {
                const parentNode = e.currentTarget.parentNode.parentNode;


                const ratio = Number($(parentNode).find(".bet-ratio")[0].innerText.split(' ')[1]);
                //const totalAmountNode = $('#submit-sidebet').find('#total-amount')[0];
                let newSideBet = false;

                if (e.currentTarget.classList.contains('selected')) {
                    e.currentTarget.classList.remove("selected");
                    $(parentNode).find("#payout")[0].innerText = 0;
                    $(parentNode).find(".button_payout")[0].style.visibility = 'hidden';
                } else {
                    const currentBetAmount = Number(e.currentTarget.id.split('-')[1]);

                    if (currentBetAmount + this.totalAmount > freeBalance) {
                        onMessage({ msg: getMessage("notEnoughFreeBalance") });
                        return;
                    }

                    e.currentTarget.classList.add("selected");
                    var payoutAmount = currentBetAmount * ratio;
                    $(parentNode).find("#payout")[0].innerHTML = round2(payoutAmount);
                    $(parentNode).find(".button_payout")[0].style.visibility = 'visible';
                    newSideBet = true;
                }

                let totalBet = 0;
                let totalSelectedBet = ($(".sidebet_cards > .sidebet_card").length || 0);
                for (const otherButton of elements) {
                    if (otherButton.id !== e.currentTarget.id && (otherButton.id.split('-')[0] === e.currentTarget.id.split('-')[0])) {
                        otherButton.classList.remove("selected");
                    }

                    if (otherButton.classList.contains('selected')) {
                        totalBet = totalBet + Number(otherButton.id.split('-')[1]);
                        totalSelectedBet++;
                    }
                }

                if (totalSelectedBet > sidebetMaxCount && newSideBet) {
                    e.currentTarget.classList.remove("selected");
                    $(parentNode).find("#payout")[0].innerText = 0;
                    $(parentNode).find(".button_payout")[0].style.visibility = 'hidden';
                    return;
                }

                let totalPayout = 0;
                for (const payout of $(".text-yellow1")) {
                    totalPayout = totalPayout + Number($(payout).find("#payout")[0].innerText);
                }

                submitButton.style.visibility = (totalPayout <= 0) ? "hidden" : "visible";

                this.totalAmount = round2(totalBet);
                $('#total-payout')[0].innerText = round2(totalPayout);

            });
        }
    }

    setHideSideBetOption(value) {
        this.isHideSideBetOption = value;
    }

    showGame01Result(data) {
        if (!data.status) {
            this.disableGameChenge(false);
            return;
        }
        const tableCards = data.tableCards;
        for (let i = 0; i < tableCards.length; ++i) {
            const cardFilePath = getCardImageFilePath(tableCards[i]);
            const tableCard = `<div class="card1 card11" value=${tableCards[i].toLowerCase()}>
                                    <img class="front fronts" src="${cardFilePath}"/>
                                    <img class="back backs" src="./images/png/102x142/back.png" class="h-100 w-100"/>
                                </div>`;

            $('.row2').append(tableCard);
        }

        const dealerCards = data.dealerCards;
        for (let i = 0; i < dealerCards.length; ++i) {
            const cardFilePath = getCardImageFilePath(dealerCards[i]);
            const dealerCard = `<div class="card0${i} card12" value=${dealerCards[i].toLowerCase()}>
                                    <div class="back backs backss">
                                        <img src="./images/png/102x142/back.png" alt="" class="h-100 w-100">
                                    </div>  
                                    <div class="front fronts frontss">
                                        <img src="${cardFilePath}" alt="">
                                    </div>
                                </div>`;

            $('#dealer_cards').append(dealerCard);
        }

        const playerCards = data.playerCards;
        for (let i = 0; i < playerCards.length; ++i) {
            const cardFilePath = getCardImageFilePath(playerCards[i]);
            const playerCard = `<div class="card0${i} card13" value=${playerCards[i].toLowerCase()}>    
                                    <div class="back backs backss">
                                        <img src="./images/png/102x142/back.png" alt="" class="h-100 w-100">
                                    </div>
                                    <div class="front fronts frontss">
                                        <img src="${cardFilePath}" alt="">
                                    </div>
                                </div>`;


            $('#player_cards').append(playerCard);
        }

        setTimeout(() => {
            highlightGame01TableCards(data.winnersHand[0].cards);
            highlightGame01PlayerCards($('#dealer_cards > div'), data.winnersHand[0].cards);
            highlightGame01PlayerCards($('#player_cards > div'), data.winnersHand[0].cards);
        }, 3500);

        if (data.winningRatioBB > 0) {
            const currency = (defaultCurrency === "USDC") ? "USDC" : "XRP";
            $('.top_200')[0].innerHTML = `${data.winningRatioBB}${tableSettings.mode === 'cash' ? 'BB' : currency}`;
            $('.got')[0].style.display = '';
            $('.winner_trofie')[0].style.backgroundSize = '100% 100%';
        } else {
            $('.top_200')[0].innerHTML = `Dealer won with ${data.winnerRank}`;
            $('.got')[0].style.display = 'none';
            $('.winner_trofie')[0].style.backgroundSize = '0% 0%'
        }

        setTimeout(() => {
            $('#modal-wining-payout').modal('show');
            if (data.winningRatioBB > 0)
                sound.winSideGame();
        }, 4500);

        setTimeout(() => {
            $('#modal-wining-payout').modal('hide');
            const bigBlind = (tableSettings.mode === 'cash') ? (tableSettings.bigBlind || 0) : 1;
            updateTotalPaid(Number(data.winningRatioBB) * bigBlind);

            if (!!data.freeBalance)
                updateFreeBalance(Number(data.freeBalance));

            // this.removeAllSidegameCards();
            this.disableGameChenge(false);
        }, 6500);
    }

    showGame02Result(data) {
        if (!data.status) {
            this.disableGameChenge(false);
            return;
        }

        const tableCards = data.tableCards;
        for (let i = 0; i < tableCards.length; ++i) {
            const cardFilePath = getCardImageFilePath(tableCards[i]);
            const tableCard = `<div class="card1 card11" value=${tableCards[i].toLowerCase()}>
                                <img class="front fronts" src="${cardFilePath}"/>
                                <img class="back backs" src="./images/png/102x142/back.png" class="h-100 w-100"/>
                            </div>`;

            $('.row2').append(tableCard);
        }

        const playerCards = data.playerCards;
        for (let i = 0; i < playerCards.length; ++i) {
            const cardFilePath = getCardImageFilePath(playerCards[i]);
            const playerCard = `<div class="card0${i} card13" value=${playerCards[i].toLowerCase()}>    
                                    <div class="back backs backss">
                                        <img src="./images/png/102x142/back.png" alt="" class="h-100 w-100">
                                    </div>
                                    <div class="front fronts frontss">
                                        <img src="${cardFilePath}" alt="">
                                    </div>
                                </div>`;

            $('#player_cards').append(playerCard);
        }
        if (data.winningRatioBB > 0) {
            const currency = (defaultCurrency === "USDC") ? "USDC" : "XRP";
            $('.top_200')[0].innerHTML = `${data.winningRatioBB}${(tableSettings.mode === 'cash') ? 'BB' : currency}\n${data.winnerRank}`;
            $('.got')[0].style.display = '';
            $('.winner_trofie')[0].style.backgroundSize = '100% 100%';
        } else {
            $('.top_200')[0].innerHTML = `${data.winnerRank} <br> No Win`;
            $('.got')[0].style.display = 'none';
            $('.winner_trofie')[0].style.backgroundSize = '0% 0%'
        }

        setTimeout(() => {
            highlightGame01TableCards(data.winnersHand[0].cards);
            highlightGame01PlayerCards($('#player_cards > div'), data.winnersHand[0].cards);
        }, 2000);

        setTimeout(() => {
            $('#modal-wining-payout').modal('show');
            if (data.winningRatioBB > 0)
                sound.winSideGame();
        }, 2000);

        setTimeout(() => {
            $('#modal-wining-payout').modal('hide');
            const bigBlind = (tableSettings.mode === 'cash') ? (tableSettings.bigBlind || 0) : 1;
            updateTotalPaid(Number(data.winningRatioBB) * bigBlind);

            if (!!data.freeBalance)
                updateFreeBalance(Number(data.freeBalance));

            // this.removeAllSidegameCards();

            this.disableGameChenge(false);
        }, 4000);
    }

    disableGameChenge(value) {
        if (value) {
            sideberGameSubmitBtn.disabled = true;
            $(sideBetTabsDiv).find("button").prop('disabled', true);
        } else {
            sideberGameSubmitBtn.disabled = false;
            $(sideBetTabsDiv).find("button").prop('disabled', false);
        }

    }

    showPanel(value) {
        if (this.isShowPanel === value) return;
        sidebetPanel.style.visibility = value ? "visible" : "hidden";
    }

}


function highlightGame01TableCards(cards) {
    const tableCards = $(".row2 .card11");

    if (!cards) {
        for (const card of tableCards) {
            if (card.attributes['value'].value != "?")
                card.classList.remove("with_mask")
        };
        return;
    }

    for (const card of tableCards) {
        if (cards.indexOf(card.attributes['value'].value.toUpperCase()) == -1) {
            card.classList.add("with_mask")
        }
    }
}

function highlightGame01PlayerCards(cards, winnerCards) {
    if (!winnerCards) {
        for (const card of cards) {
            if (card.attributes['value'].value != "?")
                $(card).find('.front').classList.remove("with_mask")
        };
        return;
    }

    for (const card of cards) {
        if (winnerCards.indexOf(card.attributes['value'].value.toUpperCase()) == -1) {
            $(card).find('.front')[0].classList.add("with_mask")
        }
    }
}

function updateTotalPaid(amount) {
    totalWinningAmount = Number(Math.floor(totalWinningAmount + amount).toFixed(1));
    var currency = getcurrencyIcon();
    $('.totalPaid_img')[0].innerHTML = currency.outerHTML;
    $('#total-paid')[0].innerHTML = totalWinningAmount;
}

function updateFreeBalance(balance) {
    freeBalance = Number(Math.floor(balance).toFixed(1));
    var currency = getcurrencyIcon();
    $('#free-balance')[0].innerHTML = freeBalance;
    $('.freebalance_img')[0].innerHTML = currency.outerHTML;
}

function addSidebetCard(sidebets) {
    if (!sidebets) return;

    for (const sidebet of sidebets) {
        for (const option of sidebet.bets) {

            const prevElement = $(`.sidebet_card#${sidebet.streetName +'-'+ option.betName.split(' ').join('-')}`);
            if (prevElement.length > 0) continue;
            var img = getcurrencyIcon().outerHTML;
            var balance = ((option.ratio * option.amount).toFixed(2));
            const element = `
                <div class="sidebet_card sideBet-${sidebet.streetName}" id=${sidebet.streetName +'-'+ option.betName.split(' ').join('-')}>
                    <div class="flop-card1 flop-card-third ">
                        <div class="flop-title">${streetsOnSideBet.get(sidebet.streetName)}</div>
                        <div class="flop-content">${option.betName}</div>
                        <div class="flop-payout flop-payout-second">Payout: <span>${img}
                                ${balance}</span></div>
                        <div class="sideBetResult"></div>
                    </div>
                </div>`;
            $('.sidebet_cards').append(element);
        }
    }
}