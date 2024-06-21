import { SubmitReport, getPlayerSeat, sitDown, tableSettings } from "../services/table-server";
import { getMoneyValue, getMoneyText } from "./money-display";
import { Card, getCardImageFilePath } from "./card-ui";
import { userMode } from '../services/game-server';
import { Sound } from './audio';

const sound = new Sound();
const actionColors = {
    "CHECK": "#1F9231",
    "CALL": "#1F9231",
    "ALLIN": "#1F9231",
    "RAISE": "#FF8400",
    "BET": "#FF8400",
    "FOLD": "#EC262F",
    "BIG BLIND": "#595959",
    "SMALL BLIND": "#595959",
    "MISSING BB": "#595959",
    "MISSING SB": "#595959",
    "BB": "#595959",
    "SB": "#595959",
    "Sitting Out": "#595959",
    "MUCKED": "#EC262F",
};

const playerFieldSelectors = {
    avatar: ".avatar",
    flag: ".flag",
    name: ".name",
    money: ".money",
    rating: ".rating",
    lastAction: ".action",
    blind: ".blind",
    dealer: ".dealer",
    handResult: ".handResult",
    winner: ".winnerImg",
    winnerHand: ".winnerhand",
    lastBet: ".lastBetDiv",
    stars: ".stars",
    prize: ".prize",
    missSb: ".missSb",
    missBb: ".missBb",
    lastBetAmount: '.betAmountAnimation',
    extraToken: ".extraToken"
};

const fieldAlternativeActions = {
    lastBet: (element, value) => {
        const span = $(element).find("span")[0];
        span.innerHTML = value;
    },
    lastBetAmount: (element, value) => {
        const span = $(element).find("span")[0];
        span.innerHTML = value;
    },
    prize: (element, value) => {
        const span = $(element).find("span")[0];
        span.innerHTML = value;
    },
    winnerHand: (element, value) => {
        const span = $(element).find("span")[0];
        span.innerHTML = value;
    },
    blind: srcToken,
    avatar: (element, value) => {
        element.src = value;
    },
    lastAction: (element, value) => {
        element.innerText = value;
        if (actionColors[value])
            element.style.backgroundColor = actionColors[value];
    },
    extraToken: srcToken
};

function srcToken(element, value) {
    element.src = value;

    if (value == missingSmallBlindSrc || value == missingBigBlindSrc)
        $(element).addClass('shrink');
    else
        $(element).removeClass('shrink');
}

const playerWrapperHTML = `<div>
<img class="avatar" src="./images/desktop/22 copy 7@2x.png">
<div class="player-cards"></div>
<div class = "betAnimation">
    <img src="./images/desktop/1 copy 4-1@2x.png">
   <!-- <span>$55</span> -->
</div>
<div class = "betAmountAnimation">
   <span>+55</span>
</div>
<div class="box">
    <table>
    <tr>
        <td>
        <img class = "flag" src="./images/desktop/546dfc16a2add4db09ebc44d307ac72a@2x.png">
        </td>
        <td></td>
        <td>
        <div class = "stars box">
            <img src="./images/desktop/material-star.svg">
            <span class="rating">4.2</span>
        </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td><span class="name">Tangotag</span></td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td><span class="money">$5.24</span></td>
        <td></td>
    </tr>
    </table>
    <div class="action">CHECK</div>
</div>
<div class = "turnTime">
    <div></div>
</div>
<div class="timeCircle"><div>10</div></div>
<div class = "lastBetDiv">
    <img src="./images/desktop/1 copy 4-1@2x.png">
    <span>$55</span>
 </div>
<img class="winnerImg" src="./images/desktop/WINNER.svg">
<div class = "prize">
    <span class="textset">Prize Amount</span>
</div>
<img class = "blind" src="./images/desktop/SB.png">
<img class = "dealer" src="./images/desktop/D.png">
<img class = "missSb"   src="./images/desktop/MSB.png">
<img class = "missBb"  src="./images/desktop/MBB.png">
<div class="winnerhand">
    <span></span>
    <canvas></canvas>
</div>
<div class="toast-container text-black p-3">
            <div id="toastMessage" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">Thank you user for 10BB Tips</strong>
                  </div>
            </div>
          </div>
</div>
`;

const PlayerDetail = ` <div class="main-section">
<div class="wrapper">
    <div class="user-detail">
        <div class="button">
            <div class="first-section">
                <div class="u-name">
                    <p><span class="lang" key="user">User</span>: 
                    <span class="report-name"></span>
                    </p>
                </div>
                <div class="date">
                    <p key="memberFrom" class="lang">Member From</p>
                    <span class="report-create"></span>
                </div>
            </div>
            <div class="playerRating">
            </div>
            <div class="btn-section">
                <button class="r-btn">
                    <img src="images/error.png" alt="">
                </button>
                <button class="l-btn lang" key="Report">Report</button>
            </div>
        </div>
        <div class="report-dd">
            <ul>
                 <li>
                     <input type="radio" value="Offensive Language"  name='option' id="checkbox1" class="check1 check">
                     <label class="check-label lang" key="offensiveLang">Offensive Language</label>    
                 </li>
                 <li>
                    <input type="radio" name='option' value="Act like a bot"  id="checkbox2" class="check2 check">
                    <label class="check-label lang" key="actLikeBot">Act like a bot</label>    
                </li>
                <li class="other">
                    <input type="radio" name='option' value="Other" id="checkbox3" class="check3 check">
                    <label class="check-label lang" key="other">Other</label> 
                </li>
            </ul>
            <div class="text">
            <span key="describeReport" class="lang">Describe Your Report</span>
                <input type="text" class="write lang" key="reportText"  placeholder="Type report...">
            </div>
            <div class="btn">
                <button class="submit lang" key="submit">Submit</button>
                <button class="cancel lang" key="Cancel">cancel</button>
            </div>
         </div> 
    </div>
</div>
</div>`;

const sitDownHTML = "<button class=\"sitDownButton\"></button>";

const smallBlindSrc = "./images/desktop/SB.png";
const bigBlindSrc = "./images/desktop/BB.png";

const dealerSrc = "./images/D.png";

const missingSmallBlindSrc = "./images/desktop/MSB.png";
const missingBigBlindSrc = "./images/desktop/MBB.png";

const mainPlayerIndex = 5;
let previousMainPlayerIndex = -1;

const cardsImageProperties = {
    cardWidth: 102,
    cardHeight: 142
}

const playerWrappers = getSortedPlayerWrappers();

function getSortedPlayerWrappers() {
    let playerWrappers = $(".player_wrapper");
    return playerWrappers.sort((a, b) => {
        if (a.classList[1] == undefined || b.classList[1] == undefined)
            return 0;
        return +a.classList[1] - +b.classList[1];
    });
}

export class Player {
    constructor(wrapper, seatIndex) {
        this.wrapper = wrapper;
        this.cards = [];
        this.seatIndex = seatIndex;
        this.wrapper.innerHTML = playerWrapperHTML;
        this.wrapper.style.visibility = "hidden";
        this.name = "";
        this.interval = undefined;
        this.reactTimeOut = undefined;
        this.showInBB = false;
        this.showInUSD = false;
        this.bigBlind = undefined;
        this.usdRate = undefined;
        this.money = undefined;
        this.bet = undefined;
        this.prize = undefined;
        this.turnCountInterval = undefined;
        this.missingBB = false;
        this.missingSB = false;
        this.mucked = false;
        this.isPlaying = false;
        this.storedCards = [];


    }

    setPlayState(isPlaying) {
        this.isPlaying = isPlaying;
    }

    setShowInBB(isShowInBB) {
        this.showInBB = isShowInBB;
        this.setPlayerMoney(this.money);
        this.setPlayerBet(this.bet);
    }
    setShowInUSD(isShowInUSD) {
        this.showInUSD = isShowInUSD;
        this.setPlayerMoney(this.money);
        this.setPlayerBet(this.bet);
    }

    setBigBlind(bb) {
        this.bigBlind = bb;
    }

    setUsdRate(usd) {
        this.usdRate = usd;
    }

    storeSitoutAndFoldCards(visible, cards) {
        $(this.wrapper).find('> div')[0].onclick = undefined;
        if (visible == true) {
            this.storedCards = cards;

            $(this.wrapper).find('> div')[0].onclick = () => {
                if ($(this.wrapper).find(".fold-cards").length !== 0) {
                    $(this.wrapper).find(".fold-cards").remove();
                } else {
                    this.showSitoutFoldCards(this.storedCards);
                }
            };
        } else {
            this.storedCards = [];
            if ($(this.wrapper).find(".fold-cards").length !== 0) {
                $(this.wrapper).find(".fold-cards").remove();
            }
        }
    }

    showSitoutFoldCards(cards) {
        if (cards == undefined) return;

        $(this.wrapper).append('<div class="fold-cards"></div>');
        let twoCardsClassName = "";
        let fourCardsClassName = "";

        if (cards.length == 2) twoCardsClassName = "two-cards";
        if (cards.length == 4 || cards.length == 5) fourCardsClassName = "four-cards";

        if (fourCardsClassName != "") {
            $(this.wrapper).find('.fold-cards').addClass(fourCardsClassName);
        }
        for (let i = 0; i < cards.length; ++i) {
            const card = cards[i].toLowerCase();
            const cardImgFilePath = getCardImageFilePath(card);
            const tableCard = `<div class="content ${twoCardsClassName}">
                                    <img src="${cardImgFilePath}"/>
                                </div>`;

            $(this.wrapper).find('.fold-cards').append(tableCard)
        }

    }

    setCards(cards, isGrey) {
        if (cards == undefined) return;

        // const animated = this.cards.length > 0;
        // if (animated) return;

        if (this.cards.toString() == cards.toString()) return;

        if (this.cards.length > 0 && this.cards.every(c => c === '?') && cards.every(c => c !== '?')) {
            this.showCards(cards);
            return;
        }

        this.cards = cards;

        let twoCardsClassName = "";
        let fourCardsClassName = "";

        if (cards.length == 2) twoCardsClassName = "two-cards";
        if (cards.length == 4 || cards.length == 5) fourCardsClassName = "four-cards";

        if (fourCardsClassName != "") {
            $(this.wrapper).find('.player-cards').addClass(fourCardsClassName);
        }
        for (let i = 0; i < cards.length; ++i) {
            const card = cards[i].toLowerCase();
            const cardImgFilePath = getCardImageFilePath(card);
            const playerCard = `<div class="content player-card ${twoCardsClassName}" 
                                value=${card} 
                                style="animation-name:${card == '?' ? "slide-animation" : "slideInDown"}">
                                    <img class="back" src="./images/png/102x142/back.png"/>
                                    <img class="front" src="${cardImgFilePath}" style="opacity:${isGrey ? 0.5 : 1}"/>
                                </div>`;

            $(this.wrapper).find('.player-cards').append(playerCard)
        }
    }

    showCards(cards) {
        if (JSON.stringify(this.cards) === JSON.stringify(cards)) return;

        const playerCards = $(this.wrapper).find(".player-card");

        let i = 0;
        for (const card of playerCards) {
            const cardDeck = cards[i].toLowerCase();
            const cardImgFilePath = getCardImageFilePath(cardDeck);
            card.attributes['value'].value = cardDeck;
            $(card).find('.front')[0].src = cardImgFilePath;
            i = i + 1;
        };

        for (const card of playerCards) {
            card.style.animationName = "flip-animation";
        }
    }

    clearCards() {
            $(this.wrapper).find('.player-cards')[0].innerHTML = '';
            this.cards = [];
        }
        /**
         * Sets the value in the element.
         * undefined or false will make it invisible.
         * true will make it visible again.
         * @param {String} fieldName 
         * @param {String} value 
         */
    setWrapperField(fieldName, value) {
        const selector = playerFieldSelectors[fieldName];
        if (!selector)
            throw `No selector for ${fieldName}`;
        let element = $(this.wrapper).find(selector)[0];
        if (!element)
            return;
        if (value === undefined || value === false) {
            element.style.visibility = "hidden";
            return;
        }
        element.style.visibility = "visible";
        if (value === true)
            return;
        if (fieldAlternativeActions[fieldName])
            fieldAlternativeActions[fieldName](element, value);
        else
            element.innerHTML = value;
    }

    setStars(value) {
        this.setWrapperField("stars", value);
    }

    setGreyStatus(seat) {
        if (seat.state == 'SitOut' || seat.lastAction == 'fold') {
            this.wrapper.style.opacity = 0.5;
        } else {
            this.wrapper.style.opacity = 1;
        }

        if (seat.state == 'SitOut') {
            this.setWrapperField("lastAction", "Sitting Out");
        }
    }

    setPlayerName(name) {
        this.setWrapperField("name", name);
        this.name = name;
    }

    setPlayerMoney(amount) {
        this.money = getMoneyValue(amount);
        const amountText = getMoneyText(amount);
        let value = amount ? amountText.outerHTML : false;
        this.setWrapperField("money", value);
        
        if (this.wrapper.classList.contains('isPlayer')) {
            const elements = $("#tip-button button");
            const bigBlind = tableSettings.bigBlind;
            for (const element of elements) {
                const tipValue = element.attributes['value'].value;
                element.disabled = (amount < (tipValue * bigBlind));
            }

        }
    }

    setPlayerBet(amount) {
        this.bet = amount;
        let value = false;

        if (amount) {
            const amountText = getMoneyText(amount);
            value = amountText.outerHTML;
        }

        this.setWrapperField("lastBet", value);
    }

    setPlayerRating(rating) {
        if (!rating) return;

        this.setWrapperField("rating", rating);
        rating = rating / 2;
        var playerRatingInStar = ``;
        for (let i = 1; i <= 5; i++) {
            if (i <= rating)
                playerRatingInStar += `<img src="./images/desktop/full-star.png" alt="">`;
            else if (i > rating && (i - 1) < rating)
                playerRatingInStar += `<img class="half" src="./images/desktop/half-star.png" alt="">`;
            else
                playerRatingInStar += `<img class="half" src="./images/desktop/blank-star.png" alt="">`;
        }
        $(this.wrapper).find(".playerRating").html(playerRatingInStar);
    }


    setAmountAnimation(amount) {
        let value = amount ? `+${getMoneyValue(amount)}` : false;
        this.setWrapperField("lastBetAmount", value);
        var element = $(this.wrapper).find(".betAmountAnimation")[0];
        if (value === false) {
            element.style.animation = '';
            element.style.animationFillMode = `none`;
        } else {
            element.style.animation = `betAmountAnimation 1s`;
            element.style.animationFillMode = `both`;
        }
    }

    setPlayerAction(action) {
        this.setWrapperField("lastAction", action ? action.toUpperCase() : false);
    }

    muckCards() {
        this.mucked = true;
        this.clearCards();
        this.setWrapperField("lastAction", "MUCKED");
    }

    removeMuckedFlag() {
        this.mucked = false;
    }

    removeActionLabel() {
        if (this.mucked) return;

        this.setWrapperField("lastAction", false);
    }

    showWinner(value) {
        if (value) {
            $(this.wrapper).addClass("winner");
            this.setWrapperField("prize", true);
        } else {
            let element = $("#winPot")[0];
            element.style = "";
            element.style.visibility = "hidden";
            $(this.wrapper).removeClass("winner");
            this.setWrapperField("prize", false);
        }
    }

    showWinnerHand(value) {
        if (value) {
            this.setWrapperField("winnerHand", true);
        } else {
            this.setWrapperField("winnerHand", false);
        }
    }

    showPrize(amount) {
        let value = false;
        if (amount) {
            const amountText = getMoneyText(amount);
            value = amountText.outerHTML;
        }
        this.setWrapperField("prize", value);
    }

    setWinnerHand(handRank) {
        this.setWrapperField('winnerHand', handRank);
    }

    setWinnerCards(cards) {
        const canvas = $(this.wrapper).find(".winnerhand canvas")[0];

        if (!canvas) return;

        canvas.width = cardsImageProperties.cardWidth * 5 * 0.5;
        canvas.height = cardsImageProperties.cardHeight * 0.5;

        for (let i = 0; i < cards.length; ++i) {
            const card = new Card(canvas);
            card.setCardName(cards[i]);
            card.setPosition(i);
            card.setRatio(0.5)
            card.drawCard();
        }
    }

    setDealerButton(visible) {
        if (!visible)
            this.setWrapperField("dealer", false);
        else
            this.setWrapperField("dealer", true);
    }

    setSmallBlindButton(visible) {
        if (this.missingSB) return;
        if (!visible)
            this.setWrapperField("blind", false);
        else
            this.setWrapperField("blind", smallBlindSrc);
    }

    setBigBlindButton(visible) {
        if (this.missingBB) return;
        if (!visible)
            this.setWrapperField("blind", false);
        else
            this.setWrapperField("blind", bigBlindSrc);
    }

    setMissingBigBlindButton(visible) {
        this.missingBB = visible;
        // if(!visible)
        //     this.setWrapperField("blind", false);
        // else 
        //     this.setWrapperField("blind", missingBigBlindSrc);
        if (!visible)
            this.setWrapperField("missBb", false);
        else
            this.setWrapperField("missBb", true);
    }

    setMissingSmallBlindButton(visible) {
        this.missingSB = visible;
        // if(!visible)
        //     this.setWrapperField("extraToken", false);
        // else 
        //     this.setWrapperField("extraToken", missingSmallBlindSrc);

        if (!visible)
            this.setWrapperField("missSb", false);
        else
            this.setWrapperField("missSb", true);
    }

    setPlayerAvatar(avatar) {
        this.setWrapperField("avatar", avatar);
    }

    setTotalCardMask() {
        const playerCards = $(this.wrapper).find(".player-card");

        for (const card of playerCards) {
            card.classList.remove("with_mask")
        };

        for (const card of playerCards) {
            card.classList.add("with_mask")
        }
    }

    HighlightCards(cards) {
        const playerCards = $(this.wrapper).find(".player-card");

        if (!cards) {
            for (const card of playerCards) {
                if (card.attributes['value'].value != "?")
                    card.classList.remove("with_mask")
            };
            return;
        }

        for (const card of playerCards) {
            if (cards.indexOf(card.attributes['value'].value.toUpperCase()) == -1) {
                card.classList.add("with_mask")
            }
        }
    }

    showPlayer(visible) {
        if (this.isPlaying && visible) return;

        this.wrapper.innerHTML = playerWrapperHTML;
        this.wrapper.style.visibility = visible ? "visible" : "hidden";
    }

    setIsPlayer(visible) {
        if (visible == true)
            this.wrapper.classList.add("isPlayer");
        else
            this.wrapper.classList.remove("isPlayer");
    }

    setPlayerDetail(visible, seat, playerSeat) {
        this.wrapper.querySelector('.avatar').onclick = undefined;
        if (visible == true) {

            this.wrapper.querySelector('.avatar').onclick = () => {
                if ($(this.wrapper).find(".main-section").length !== 0) {
                    $(this.wrapper).find(".main-section").remove();
                } else {
                    $("#playerWrappers").find(".main-section").remove();
                    $(this.wrapper).append(PlayerDetail);
                    $(this.wrapper).find(".report-name")[0].innerText = seat.player.name;
                    $(this.wrapper).find(".report-create")[0].innerText = seat.player.joiningDate;

                    this.setPlayerRating(seat.player.rating);
                    this.addReportMenu(playerSeat);
                }
            };
        } else {
            if ($(this.wrapper).find(".main-section").length !== 0) {
                $(this.wrapper).find(".main-section").remove();
            }
        }
    }

    submitReport(type, playerSeat) {
        const SubmitButton = $(".btn").find(".submit")[0];
        SubmitButton.addEventListener(
            "click",
            () => {
                const InputReport = $(this.wrapper).find(".write")[0];
                SubmitReport(type, InputReport.value, playerSeat, () => {
                    $(this.wrapper).find(".main-section").remove();
                });
            }, {}
        );
    }

    addReportMenu(playerSeat) {
        const ReportButton = $(this.wrapper).find(".l-btn")[0];
        ReportButton.addEventListener("click", () => {
            const reportMenu = $(this.wrapper).find(".report-dd");
            if (reportMenu.hasClass("active")) {
                reportMenu.removeClass("active");
            } else {
                reportMenu.addClass("active");
                this.addReportOption(playerSeat);
                this.closeReport();
            }
        });
    }

    addReportOption(playerSeat) {
        const CheckButton = $(".player_wrapper").find(".check");

        for (const button of CheckButton) {
            button.addEventListener("click", () => {
                const Check = $(this.wrapper).find(".text");
                if (Check.hasClass("active")) {
                    Check.removeClass("active");
                } else if ($(button)[0].value === "Other") {
                    Check.addClass("active");
                }
                // this.submitReport($(button)[0].value, playerSeat);
            });
        }

        const SubmitButton = $(".btn").find(".submit")[0];
        SubmitButton.addEventListener(
            "click",
            () => {
                const selectedOption = document.querySelector('input[name="option"]:checked');
                const InputReport = $(this.wrapper).find(".write")[0];
                console.log(selectedOption.value);
                SubmitReport(selectedOption.value, InputReport.value, playerSeat, () => {
                    $(this.wrapper).find(".main-section").remove();
                });
            }, {}
        );
    }

    closeReport() {
        if (this.isPlaying) {
            const CheckButton = $(".player_wrapper").find(".cancel")[0];
            CheckButton.addEventListener("click", () => {
                const Check = $(this.wrapper).find(".report-dd");
                Check.removeClass("active");
            });
        }
    }

    clearPlayerAnimationCss() {
        const player_wrapper = this.wrapper;
        const lastBetDiv = player_wrapper.querySelector(".lastBetDiv");
        if (lastBetDiv)
            lastBetDiv.style = "";

    }

    showWaitForBBLabel(value) {
        this.setWrapperField("lastAction", value ? "Sitting Out" : false);
    }

    showSitDownButton(visible) {
        if (visible && userMode !== 1) {
            this.wrapper.innerHTML = sitDownHTML;
            this.wrapper.style.visibility = "visible";
            $(this.wrapper).find(".sitDownButton")[0].addEventListener('click',
                () => {
                    sitDown(this.seatIndex);
                });
        } else {
            this.wrapper.innerHTML = playerWrapperHTML;
            this.wrapper.style.visibility = "hidden";
        }
    }

    setTurnTimer(timeout, timeToReact, timeBank) {

        this.resetPlayerWrapperClasses();
        if (this.turnCountInterval != undefined) { return; }

        var timeBanksound = false;
        const timeCircleCount = $(this.wrapper).find(".timeCircle div")[0];
        timeCircleCount.innerText = timeToReact;
        var totaltime = timeToReact;
        this.turnCountInterval = setInterval(() => {
            const timeCircleCount = $(this.wrapper).find(".timeCircle div")[0];
            if (timeToReact > 0) {
                timeCircleCount.innerText = --timeToReact;
                timeCircleCount.style.width = `${timeToReact *100/totaltime}%`;
            }

            // --timeToReact;

            if (timeToReact === 0) {
                if (timeBank >= 0) {
                    if (!timeBanksound) {
                        sound.playTurnTime(true);
                        timeBanksound = true;
                    }

                    timeCircleCount.innerText = timeBank--;
                } else if (timeBank == -1) {
                    this.clearIntervalTimer();
                }
            }
        }, 1000);

        $(this.wrapper).addClass("toPlay");
        const timeBar = $(this.wrapper).find(".turnTime div")[0];
        const clonedTimeBar = timeBar.cloneNode(true);
        timeBar.parentNode.replaceChild(clonedTimeBar, timeBar);
        clonedTimeBar.setAttribute("style", `-webkit-animation: timeReactRunOut calc(${timeToReact + 1}s) steps(500, start);`);
        /* clonedTimeBar.style.animationDuration = `${timeToReact}s`;
         clonedTimeBar.style.animationName = "timeReactRunOut";*/


        const timeCircle = $(this.wrapper).find(".timeCircle")[0];
        const clonedTimeCircle = timeCircle.cloneNode(true);
        timeCircle.parentNode.replaceChild(clonedTimeCircle, timeCircle);
        clonedTimeCircle.setAttribute("style", `-webkit-animation: turnCircleReact calc(${timeToReact + 1}s) steps(500, start);`);
        /* clonedTimeCircle.style.animationDuration = `${timeToReact}s`;
        clonedTimeCircle.style.animationName = "turnCircleReact"; */

        this.reactTimeOut = setTimeout(() => {
            clonedTimeBar.style.animationDuration = `${timeBank}s`;
            clonedTimeBar.style.animationName = "timeBankRunOut";
            clonedTimeCircle.style.animationDuration = `${timeBank + 1}s`;
            clonedTimeCircle.style.animationName = "turnCircleBank";

            if (this.reactTimeOut != undefined)
                clearTimeout(this.reactTimeOut);
        }, timeToReact * 1000);

    }

    clearTurnTimer() {
        sound.playTurnTime(false);
        this.clearIntervalTimer();
        this.resetPlayerWrapperClasses();
        $(this.wrapper).removeClass("toPlay");
        if (this.reactTimeOut != undefined)
            clearTimeout(this.reactTimeOut);
    }

    resetPlayerWrapperClasses() {
        $(this.wrapper).removeClass("toPlay");
        $(this.wrapper).removeClass("winner");
    }

    restartAnimation(element) {
        if (!element)
            return;
        element.style.animation = 'none';
        element.offsetHeight; /* trigger reflow */
        element.style.animation = null;
    }

    clearIntervalTimer() {
        if (this.turnCountInterval != undefined) {
            clearInterval(this.turnCountInterval);
            this.turnCountInterval = undefined;
        }
    }

    TipDealer(data) {
        const tostMessage = $(this.wrapper).find("#toastMessage")[0];
        const tostText = $(this.wrapper).find('#toastMessage .me-auto')[0];
        tostText.innerText = data.msg;
        tostMessage.style.display = 'block';

        setTimeout(() => {
            tostMessage.style.display = 'none';
        }, 2000);
    }
}