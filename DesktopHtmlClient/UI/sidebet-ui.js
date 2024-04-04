import { tableSettings } from "../services/table-server";
import { submitSideBet, hitGame01, dealGame02 } from "../socket-client";
import { getMoneyText } from "./money-display";
import { getCardImageFilePath } from './card-ui';
import { modes } from "./table-ui";

const submitButton = $('#submit-sidebet')[0];
const streetsOnSideBet = new Map();
streetsOnSideBet.set('PreCards', 'Next Cards');
streetsOnSideBet.set('PreFlop', 'Flop');
streetsOnSideBet.set('Flop', 'Turn');
streetsOnSideBet.set('Turn', 'River');
const sidebetStreetDiv = $(".street")[0];
const sidebetGame01Chips = $(".bet-chips button");
const sideberGameSubmitBtn = $(".hitme")[0];
const streetLabel = $(".text-street")[0];
const sidebetPanel = $(".side-bet_div")[0];
const sidebetMaxCount = 7;
const gameModes = Object.freeze({
    None: 0,
    Game01: 1,
    Game02: 2,
});

let totalWinningAmount = 0;
let freeBalance = 1000;

export class SidebetUI {
    constructor(mainUI) {
        this.mainUI = mainUI;
        this.sidebetStreet = undefined;
        this.originalSidebetOption = undefined;
        this.currentSidebetOption = undefined;
        this.centerButtonId = 'buttoncenter';
        this.gameBetBBRatio = 0;
        this.isGame01Visible = false;
        this.currentGameMode = gameModes.None;
        this.isPlayerFold = false;
        this.gameBetSizes = new Map();
        this.sidebetBB = 0;
        this.init();
    }

    init() {
        updateTotalPaid(0);
        // updateFreeBalance(0);
        this.gameBetSizes.set(gameModes.Game01, [1, 2, 4]);
        this.gameBetSizes.set(gameModes.Game02, [2, 4, 8]);

        sidebetStreetDiv.addEventListener('click', () => {
            if (this.isGame01Visible) {
                this.toggleSidebetGame();
            }
            else {
                if (this.originalSidebetOption.street == this.currentSidebetOption.street) {
                    this.updateSideBetOptions(tableSettings.precardSidebetOptions.street, tableSettings.precardSidebetOptions.streetText, tableSettings.precardSidebetOptions.options);
                } 
                else {
                    this.updateSideBetOptions(this.originalSidebetOption.street, this.originalSidebetOption.streetText, this.originalSidebetOption.options);
                }
            }
        });

        submitButton.addEventListener('click', () => {

            let sidebets = [];
            let count = 0;
            const elements = $('.btun');
            for (const button of elements) {
                if (count >= sidebetMaxCount) break;

                if (button.classList.contains('selected')) {
                    sidebets.push(button.id);
                    count++;
                }
            }
            submitSideBet(sidebets, this.sidebetStreet, addSidebetCard);
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
            if (this.currentGameMode == gameModes.Game01) {
                hitGame01(this.gameBetBBRatio, this.showGame01Result);
            }
            else if (this.currentGameMode == gameModes.Game02) {
                dealGame02(this.gameBetBBRatio, this.showGame02Result);
            }
            sideberGameSubmitBtn.disabled = true;
            setTimeout(() => {
                sideberGameSubmitBtn.disabled = false;
            }, 4000);
        });
    }

    setSidebetBB(value) {
        this.sidebetBB = value;
    }

    removeSidebetCards(result) {
        if (!!result && result.length > 0)
        for (const list of result) {
            const element = $(`.sidebet_card#${list.betName.split(' ').join('-')}`);
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

    removeAllSidegameCards() {
        $('.row2 .card11').remove();
        $('#dealer_cards div').remove();
        $('#player_cards div').remove();
    }

    showSidebetCardsResult(result) {
        if (!!result && result.length > 0)
        for (const list of result) {
            const element = $(`.sidebet_card#${list.betName.split(' ').join('-')}`);
            
            if (list.award > 0) {    
                $(element).find('.win')[0].innerText = 'Win !';
                element[0].classList.remove("pending");
                element[0].classList.add("winning");
            }
            else {
                $(element).find('.win')[0].innerText = 'Loose !';
                element[0].classList.remove("pending");
                element[0].classList.add('losing');
            }
        }
    }

    setFoldStatusAndSideGamePanel(value) {
        if (this.isPlayerFold == value) return;
        
        this.isPlayerFold = value;
        if (this.isPlayerFold) {
            this.toggleSideBetAndGame(true);
        }
    }

    showGamePanel(mode) {
        if (mode == gameModes.Game02) {
            sideberGameSubmitBtn.innerText = 'DEAL ME';
            streetLabel.innerText = "New Deal";
        }
        else if (mode == gameModes.Game01) {
            sideberGameSubmitBtn.innerText = 'HIT ME';
            streetLabel.innerText = "Hit The Dealer";
        }
        else if (mode == gameModes.None) {
            return;
        }

        const betSizes = this.gameBetSizes.get(this.currentGameMode);
        this.gameBetBBRatio = Number(betSizes[1]);

        for (let i = 0; i < 3; ++i) {
            $(`.bigcoin${i + 1} img`)[0].setAttribute('src', `images/sidebet_chip_${betSizes[i]}bb.svg`);
            $(`.bigcoin${i + 1} img`)[0].setAttribute('value', betSizes[i]);
        }
    }

    toggleSidebetGame() {
        if (this.currentGameMode == gameModes.Game01) {
            this.currentGameMode = gameModes.Game02;
        }
        else {
            this.currentGameMode = gameModes.Game01;
        }

        this.showGamePanel(this.currentGameMode);
        this.removeAllSidegameCards();
    }
    
    initSideBetPanel() {
        $('#submit-sidebet').find('#total-amount')[0].innerText = '0';
        $('#total-payout')[0].innerText = '0';

        const payoutBtns = $(".scroll_prents").find(".button_payout");
        for (const payoutbtn of payoutBtns) {
            payoutbtn.style.visibility = 'hidden';
        }

        const elements = $('.btun');
        for (const button of elements) {
            if (button.classList.contains('selected')) {
                button.classList.remove("selected");
            }
        }
    }

    setCurrentSidebetOptions(street, streetText, options) {
        this.originalSidebetOption = { street, streetText, options };
    }

    updateSideBetOptions(street, streetText, options) {
        this.sidebetStreet = street;
        $(".scroll_prents").find('.fund_prent').remove();
        $('#submit-sidebet').find('#total-amount')[0].innerText = '0';
        $('#total-payout')[0].innerText = '0';

        if (!this.isGame01Visible) {
            streetLabel.innerText = streetsOnSideBet.get(streetText) || "Street";
        }

        if (!street) return;

        this.currentSidebetOption = { street, streetText, options };
        let div = '';
        for (const option of options) {
            div = div + `<div class="fund_prent mb-1 mt-1">
                            <div class="fund3 ">
                                <div class="top_prent">
                                    <div class="Hitting_prents">
                                        <div class="side-bet">
                                            <p class="bet-name">${option.betName}</p>
                                            <p class="bet-ratio"><span class="mulitplier-symbol">X</span> ${Number(option.ratio)}</p>
                                        </div>
                                        <button class="button_payout" style="visibility: hidden"> <span class="text-white-pay">Payout:</span><span class="text-yellow"><span id="payout">0</span></span></button>
                                    </div>
                                    <i class="bi bi-question-circle icon-question"
                                        data-bs-toggle="modal" data-bs-target="#modal-note"><span id="sidebet-note" style="display: none;">${option.note}</span></i>
                                </div>
                                <div class="main_right">
                                    <div class="">
                                        <button id="${option.betName}-${this.sidebetBB * 2}" class="p-bule btun"><span class="btau_text">${(getMoneyText(this.sidebetBB * 2)).outerHTML}</span></button>
                                    </div>
                                    <div class="">
                                        <button id="${option.betName}-${this.sidebetBB * 5}" class="p-bule btun"><span class="btau_text">${(getMoneyText(this.sidebetBB * 5)).outerHTML}</span></button>
                                    </div>
                                    <div class="">
                                        <button id="${option.betName}-${this.sidebetBB * 10}" class="p-bule btun"><span class="btau_text">${(getMoneyText(this.sidebetBB * 10)).outerHTML}</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }
        $(".scroll_prents").append(div);

        const questionIcons = $('.icon-question');
        for (const icon of questionIcons) {
            icon.addEventListener('click', (e) => {
                $('.sidebet-note')[0].innerText = $(e.currentTarget).find("#sidebet-note")[0].innerText;
            });
        }

        const elements = $('.btun');
        for (const button of elements) {
            button.addEventListener('click', (e) => {
                const parentNode = e.currentTarget.parentNode.parentNode.parentNode;
                const ratio = Number($(parentNode).find(".bet-ratio")[0].innerText.split(' ')[1]);
                const totalAmountNode = $('#submit-sidebet').find('#total-amount')[0];

                if (e.currentTarget.classList.contains('selected')) {
                    e.currentTarget.classList.remove("selected");
                    $(parentNode).find("#payout")[0].innerText = 0;
                    $(parentNode).find(".button_payout")[0].style.visibility = 'hidden';
                } else {
                    const currentBetAmount = Number(e.currentTarget.id.split('-')[1]);
                    const totalBetedAmount = Number(totalAmountNode.innerText.split('$')[0]);

                    if (currentBetAmount + totalBetedAmount > freeBalance) {
                        return;
                    }

                    e.currentTarget.classList.add("selected");
                    $(parentNode).find("#payout")[0].innerHTML = (getMoneyText(currentBetAmount * ratio)).outerHTML;
                    $(parentNode).find(".button_payout")[0].style.visibility = 'visible';
                }

                let totalBet = 0;
                for (const otherButton of elements) {
                    if (otherButton.id !== e.currentTarget.id && (otherButton.id.split('-')[0] === e.currentTarget.id.split('-')[0])) {
                        otherButton.classList.remove("selected");
                    }

                    if (otherButton.classList.contains('selected')) {
                        totalBet = totalBet + Number(otherButton.id.split('-')[1]);
                    }
                }

                let totalPayout = 0;
                for (const payout of $(".text-yellow")) {
                    totalPayout = totalPayout + Number($(payout).find("#payout")[0].innerText);
                }

                const totalBetText = getMoneyText(totalBet);
                const totalPayoutText = getMoneyText(totalPayout);
                totalAmountNode.innerHTML = totalBetText.outerHTML;
                $('#total-payout')[0].innerHTML = totalPayoutText.outerHTML;
            });
        }
    }

    setNewFreeBalance(balance) {
        updateFreeBalance(balance);
    }

    updateSideBetHistory(res) {
        setTimeout(() => {
            this.showSidebetCardsResult(res.results);    
        }, 3000);
        setTimeout(() => {
            if (!res.unclaimed)
                this.removeSidebetCards(res.results);
        }, 5000);
        

        if (Number(res.totalReward) > 0) {
            const totalRewardText = getMoneyText(res.totalReward);
            $('.top_200')[0].innerHTML = totalRewardText.outerHTML;
            setTimeout(() => {
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
            div = div + `<div class="fund_prents mb-1 mt-1">
                            <div class="funds3 ">
                                <div class="top_prents">
                                    <div class="main_hittings">
                                        <div class="top px-1"><img src="images/dollar coinn.png">
                                            <div class="allmix">
                                                <p class="pair">${list.betName}
                                                <p class="today">Today | ${hour}:${min}</p>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="div_in_text">
                                            <p class="amount">$${list.award}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }

        $(".scroll_prentss").find('.fund_prents').remove();
        $(".scroll_prentss").append(div);
        const totalText = getMoneyText(total);
        $(".sidebet-total-win")[0].innerHTML = totalText.outerHTML;
    }

    showGame01Result(data) {
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
            $('.top_200')[0].innerHTML = `${data.winningRatioBB}BB`;
            $('.got')[0].style.display = '';
            $('.winner_trofie')[0].style.backgroundSize = '100% 100%';
        }
        else {
            $('.top_200')[0].innerHTML = `Dealer won with ${data.winnerRank}`;
            $('.got')[0].style.display = 'none';
            $('.winner_trofie')[0].style.backgroundSize = '0% 0%'
        }

        setTimeout(() => {
            $('#modal-wining-payout').modal('show');
        }, 4500);

        setTimeout(() => {
            $('#modal-wining-payout').modal('hide');
            updateTotalPaid(Number(data.winningRatioBB) * tableSettings.bigBlind);

            if (!!data.freeBalance)
                updateFreeBalance(Number(data.freeBalance));
        }, 6500);
    }

    toggleSideBetAndGame(value) {
        if (this.isGame01Visible && value) return;

        this.isGame01Visible = value;
        const game01Div = $('.gane_div_prents')[0];
        if (!value) {
            game01Div.style.display = 'none';
            $('.text_div')[0].classList.remove('d-none');
            streetLabel.innerText = "Street";
        }
        else {
            game01Div.style.display = '';
            $('.text_div')[0].classList.add('d-none');
            this.currentGameMode = this.currentGameMode == gameModes.None ? gameModes.Game01 : this.currentGameMode;
            this.showGamePanel(this.currentGameMode);
            this.removeAllSidegameCards();
        }
    }

    showGame02Result(data) {
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
            $('.top_200')[0].innerHTML = `${data.winningRatioBB}BB\n${data.winnerRank}`;
            $('.got')[0].style.display = '';
            $('.winner_trofie')[0].style.backgroundSize = '100% 100%';
        }
        else {
            $('.top_200')[0].innerHTML = `${data.winnerRank} No Win`;
            $('.got')[0].style.display = 'none';
            $('.winner_trofie')[0].style.backgroundSize = '0% 0%'
        }

        setTimeout(() => {
            highlightGame01TableCards(data.winnersHand[0].cards);
            highlightGame01PlayerCards($('#player_cards > div'), data.winnersHand[0].cards);
        }, 2000);

        setTimeout(() => {
            $('#modal-wining-payout').modal('show');
        }, 2000);

        setTimeout(() => {
            $('#modal-wining-payout').modal('hide');
            updateTotalPaid(Number(data.winningRatioBB) * tableSettings.bigBlind);

            if (!!data.freeBalance)
                updateFreeBalance(Number(data.freeBalance));
        }, 4000);
    }

    showPanel(value) {
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
    totalWinningAmount = totalWinningAmount + amount;
    const amountText = getMoneyText(totalWinningAmount);
    $('#total-paid')[0].innerHTML = amountText.outerHTML;
}

function updateFreeBalance(balance) {
    freeBalance = Math.floor(balance);
    const balanceText = getMoneyText(freeBalance);
    $('#free-balance')[0].innerHTML = balanceText.outerHTML;
}

function addSidebetCard(sidebets) {
    if (!sidebets) return;

    for (const sidebet of sidebets) {
        for (const option of sidebet.bets) {
            const prevElement = $(`.sidebet_card#${option.betName.split(' ').join('-')}`);
            if (prevElement.length > 0) continue;

            const element = `
                <div class="sidebet_card pending" id=${option.betName.split(' ').join('-')}>
                    <h1 class="Hitting_panel">${option.betName}</h1>
                    <div class="win_top">
                        <div>
                            <button class="pay_buttons">Payout: <span class="span_y">${option.ratio * option.amount}</span></button>
                        </div>
                        <h1 class="win"></h1>
                    </div>
                </div>
            `
            $('.sidebet_cards').append(element);
        }
    }
}