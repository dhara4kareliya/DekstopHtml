import { SubmitReport, getPlayerSeat, sitDown, tableSettings } from "../services/table-server";
import { getMoneyValue, getMoneyText, roundWithFormatAmount } from "./money-display";
import { Card, getCardImageFilePath } from "./card-ui";
import { userMode } from '../services/game-server';
import { Sound } from './audio';
import countryData from '../languages/country.json';
import { customTimer } from "../services/utils-server";

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
    "ANTE": "#595959",
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
        const span = $(element).find(".hand-strength")[0];
        span.innerHTML = value;
    },
    blind: srcToken,
    avatar: (element, value) => {
        element.src = value;
    },
    flag: (element, value) => {
        if (value)
            element.src = `./images/flag/${countryData[value].toLowerCase()}.svg`;
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
        <img class ="flag" src="./images/flag/us.svg">
        </td>
        <td></td>
        <td>
        <div class = "stars box">
            <i aria-hidden="true" class="fa fa-star"></i>
            <span class="rating">4.2</span>
        </div>
        </td>
    </tr>
    <tr>
        <td colspan="3"><span class="name">Tangotag</span></td>
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
<div class="timeCircle">
  <div>10</div></div>
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
<div class="winnerhand" style="visibility: hidden;">
    <div class="show-panel">
        <div class="show-text">Show</div>
        <div>
            <div class="card-section">
                <div class="winnerCards">
                    
                </div>
                <div class="corner-fold"></div>
                <div class="corner-fold1"></div>
            </div>
            <div class="hand-strength">Hand Strength</div>
        </div>
    </div>
</div>
<div class="tipThankMessage">  
    <div class="thankyouCard">   
            <div><img src="./images/thankyou.png"  class="thankyou-img" alt=""></div>
            <div><img src="./images/Thanktext.png" class="thanktext" alt=""></div>
    </div>
</div>
 <div class="playerChatBubble">
    <span>Hello Mike! Could you please call me back</span>
    <div class="arrow"></div>
    <div class="arrow-border"></div>
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
                     <input type="radio" value="Offensive Language"  name='option' id="checkbox1" class="check1 reportType">
                     <label class="check-label lang" key="offensiveLang">Offensive Language</label>    
                 </li>
                 <li>
                    <input type="radio" name='option' value="Act like a bot"  id="checkbox2" class="check2 reportType">
                    <label class="check-label lang" key="actLikeBot">Act like a bot</label>    
                </li>
                <li class="other">
                    <input type="radio" name='option' value="Other" id="checkbox3" class="check3 reportType">
                    <label class="check-label lang" key="other">Other</label> 
                </li>
            </ul>
            <div class="text reportTextDiv">
                <span key="describeReport" class="lang">Describe Your Report</span>
                <input type="text" class="otherTextReport lang" key="reportText"  placeholder="Type report...">
            </div>
            <div class="btn">
                <button class="submitReport lang" key="submit">Submit</button>
                <button class="cancelReport cancel lang" key="Cancel">cancel</button>
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
        this.isPlayerTurn = false;
        this.storedCards = [];
        this.playerState = undefined;


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
        if (cards.length == 4 || cards.length == 5 || cards.length == 6) fourCardsClassName = "four-cards";

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

    showPlayerChatPopup(message) {
        const playerChatBubble = $(this.wrapper).find('.playerChatBubble')[0];
        playerChatBubble.style.visibility = "visible";
        $(playerChatBubble).find('span')[0].innerText = message;
        setTimeout(() => {
            playerChatBubble.style.visibility = "hidden";
        }, 2000);
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

        this.clearCards();
        this.cards = cards;

        let twoCardsClassName = "";
        let fourCardsClassName = "";

        if (cards.length == 2) twoCardsClassName = "two-cards";
        if (cards.length == 4 || cards.length == 5 || cards.length == 6) fourCardsClassName = "four-cards";

        if (this.cards.every(c => c !== '?')) fourCardsClassName += " isCardsOpen";

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
            if(this.wrapper.classList.contains('isPlayer')){
                const logcards = $(`<img class="" src="${cardImgFilePath}" style="opacity:1;height: 40px;width: 25px;"/>`);
                $('.playerCards').find('.cards').append(logcards)
            }
        }
    }

    showCards(cards) {
        if (JSON.stringify(this.cards) === JSON.stringify(cards)) return;


        const playerCards = $(this.wrapper).find(".player-card");

        const isCardsOpen = cards.every(c => c !== '?');
        if (isCardsOpen)
            $(this.wrapper).find('.player-cards').addClass("isCardsOpen");

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
    checkPlayerCards() {
        const playerCards = $(this.wrapper).find(".player-card");
        if(playerCards.length > 0)
            return true;
        else 
            return false;
    }

    clearCards() {
        if(this.wrapper.classList.contains('isPlayer')){
          $('.playerCards').find('.cards').html('')
        }
        const playerCards = $(this.wrapper).find('.player-cards')[0];
        playerCards.innerHTML = '';
        playerCards.classList.remove("isCardsOpen");

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

        this.playerState = seat.state;
    }

    setPlayerName(name) {
        this.setWrapperField("name", name);
        this.name = name;
    }

    setPlayerMoney(amount) {
        this.money = getMoneyValue(amount);
        const amountText = tableSettings.mode == 'cash' ? getMoneyText(amount).outerHTML : roundWithFormatAmount(getMoneyValue(amount));
        let value = amount ? amountText : false;
        this.setWrapperField("money", value);
        this.setTip(amount);
    }
    notifyPlayerTurn() {
        const turnEvent = {
            action: "playerTurn",
            windowTitle: "Turn",
            timestamp: Date.now()
        };
        
        localStorage.setItem("NRP_PLAYER_TURN", JSON.stringify(turnEvent));
        
        console.log("NR Poker: Player turn notification sent");
    }
    setPlayerBet(amount) {
        this.bet = amount;
        let value = false;

        if (amount) {
            const amountText = tableSettings.mode == 'cash' ? getMoneyText(amount).outerHTML : roundWithFormatAmount(getMoneyValue(amount));
            value = amountText;
        }

        this.setWrapperField("lastBet", value);
    }

    setPlayerRating(rating) {
        var ratingBox = $(this.wrapper).find(".stars.box")[0];
        if (tableSettings.mode !== 'cash') {
            ratingBox.style.visibility = 'hidden';
            return;
        }

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
        //this.clearCards();
        this.setWrapperField("lastAction", "MUCKED");
    }

    removeMuckedFlag() {
        this.mucked = false;
        this.setWrapperField("lastAction", false);
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
            const amountText = tableSettings.mode == 'cash' ? getMoneyText(amount).outerHTML : roundWithFormatAmount(getMoneyValue(amount));
            value = amountText;
        }
        this.setWrapperField("prize", value);
    }

    setWinnerHand(handRank) {
        this.setWrapperField('winnerHand', handRank);
    }

    setWinnerCards(cards) {
        console.log(cards);
        const container  = $(this.wrapper).find(".winnerhand .winnerCards")[0];
        container.innerHTML = '';
        const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

        cards.sort((a, b) => {
            let rankA = a.slice(0, -1);
            let rankB = b.slice(0, -1);

            rankA = rankA.toString();
            rankB = rankB.toString();

            return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
        });
        // canvas.width = cardsImageProperties.cardWidth * 5 * 0.5;
        // canvas.height = cardsImageProperties.cardHeight * 0.5;
        for (let i = 0; i < cards.length; ++i) {
            let card = cards[i];
            let rank = card.slice(0, -1);  
            let suit = card.slice(-1);

            let color;
            if (suit === 'H') {
                color = 'Red';
            } else if (suit === 'S') {
                color = 'Black';
            } else if (suit === 'C') {
                color = '#1E8B31';
            } else if (suit === 'D') {
                color = '#2248A2';
            }
            var winnerCardHtml = `<div class="card1">
                        <span class="winCardHand" style="color: ${color}">${rank}</span>
                    </div>`
                   container.innerHTML += winnerCardHtml;

        }
    }

    setDealerButton(visible) {
        if (!visible)
            this.setWrapperField("dealer", false);
        else
            this.setWrapperField("dealer", true);
    }

     setSmallBlindButton(visible) {
    //     // if (this.missingSB) return;
    //     if (!visible)
    //         this.setWrapperField("blind", false);
    //     else
    //         // this.setWrapperField("blind", smallBlindSrc);
     }

    setBigBlindButton(visible) {
    //     //  if (this.missingBB) return;
    //     if (!visible)
    //         this.setWrapperField("blind", false);
    //     else
    //         this.setWrapperField("blind", bigBlindSrc);
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
    setPlayerCountry(country) {
        this.setWrapperField("flag", country);
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

    submitReport(playerSeat) {
        const submitReport = $(this.wrapper).find(".submitReport")[0];
        submitReport.addEventListener(
            "click",
            () => {
                const reportTextDiv = $(this.wrapper).find(".reportTextDiv")[0];
                const reportType = $(this.wrapper).find(".reportType:checked")[0];
                const InputReport = $(reportTextDiv).find(".otherTextReport")[0];

                SubmitReport(reportType.value, InputReport.value, playerSeat, () => {
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
                this.addReportOption();
                this.submitReport(playerSeat)
                this.closeReport();
            }
        });
    }

    addReportOption() {
        const reportType = $(this.wrapper).find(".reportType");
        const reportTextDiv = $(this.wrapper).find(".reportTextDiv");

        for (const button of reportType) {
            button.addEventListener("click", () => {
                if ($(button)[0].value === "Other") {
                    reportTextDiv.addClass("active");
                } else {
                    if (reportTextDiv.hasClass('active'))
                        reportTextDiv.removeClass("active");
                }
            });
        }
    }

    closeReport() {
        if (this.isPlaying) {
            const CheckButton = $(this.wrapper).find(".cancelReport")[0];
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

    setTurnTimer(timeout, timeToReact, timeBank, isRootPlayer) {
        const totalInitialTime = timeToReact + timeBank;
        const elapsedTime = totalInitialTime - timeout;
    
        let remainingReactTime = timeToReact - elapsedTime;
        if (remainingReactTime < 0) remainingReactTime = 0;
    
        let remainingBankTime = timeBank;
        let elapsedBankTime = 0;
        if (remainingReactTime === 0) {
            elapsedBankTime = Math.round(timeBank - timeout);
            remainingBankTime = Math.round(timeout);
            if (remainingBankTime < 0) remainingBankTime = 0;
        }
    
        this.resetPlayerWrapperClasses();
        if (this.turnCountInterval != undefined) { return; }
        this.isPlayerTurn = true;
        let timeBanksound = false;
    
        let timeCircleCount = $(this.wrapper).find(".timeCircle div")[0];
        timeCircleCount.innerText = remainingReactTime || remainingBankTime;
    
        $(this.wrapper).find(".box").addClass("active-turn");
        $(this.wrapper).addClass("toPlay");
    
        const timeBar = $(this.wrapper).find(".turnTime div")[0];
        const clonedTimeBar = timeBar.cloneNode(true);
        timeBar.parentNode.replaceChild(clonedTimeBar, timeBar);
    
        const timeCircle = $(this.wrapper).find(".timeCircle")[0];
        const clonedTimeCircle = timeCircle.cloneNode(true);
        timeCircle.parentNode.replaceChild(clonedTimeCircle, timeCircle);
    
        if (remainingReactTime > 0) {
            clonedTimeBar.setAttribute("style", `-webkit-animation: timeReactRunOut ${timeToReact}s steps(500, start) ${-elapsedTime}s forwards;`);
            clonedTimeCircle.setAttribute("style", `-webkit-animation: turnCircleReact ${timeToReact}s steps(500, start) ${-elapsedTime}s forwards;`);
        }
    
        this.turnCountInterval = new customTimer();
        this.turnCountInterval.descendingTimer(remainingReactTime, (time) => {
            if (time.seconds > 0) {
                let timeCircleCount = $(this.wrapper).find(".timeCircle div")[0];
                timeCircleCount.innerText = time.seconds;
            }
            if (time.seconds == '0') {
               clonedTimeCircle.style.animation = `turnCircleBank ${remainingBankTime + 1}s steps(500, start) ${-elapsedBankTime}s forwards`;
                clonedTimeBar.style.animation = `timeBankRunOut ${remainingBankTime}s steps(500, start) ${-elapsedBankTime}s forwards`;
    
                if (remainingBankTime > 0) {
                    if (!timeBanksound && isRootPlayer) {
                        sound.playTurnTime(true);
                        timeBanksound = true;
                    }
    
                    this.turnCountInterval.descendingTimer(remainingBankTime, (banktime) => {
                        let timeCircleCount = $(this.wrapper).find(".timeCircle div")[0];
                        timeCircleCount.innerText = banktime.seconds;
                        if (banktime.seconds < 4 && banktime.seconds > 0) {
                            $(this.wrapper).find(".box").addClass("blink");
                            this.notifyPlayerTurn();
                        }
                        if(banktime.seconds == '0'){
                            this.clearIntervalTimer();
                        }
                    });
                } 
            }
        });
    }

    clearTurnTimer() {
        $(this.wrapper).find(".box").removeClass("blink");
        $(this.wrapper).find(".box").removeClass("active-turn");
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
        this.isPlayerTurn = false;
        if (this.turnCountInterval != undefined) {
            this.turnCountInterval.stopTimer();
            this.turnCountInterval = undefined;
        }
    }

    setTip(amount) {
        if (!this.wrapper.classList.contains('isPlayer') || this.playerState !== "Playing" || tableSettings.mode !== "cash")
            return false;

        const elements = $("#tip-button button");
        const tipDiv = $("#tip-button")[0];
        const bigBlind = tableSettings.bigBlind;
        for (const element of elements) {
            const tipValue = element.attributes['value'].value;
            element.disabled = (amount < (tipValue * bigBlind));

        }
        const elementValue = elements[0].attributes['value'].value;
        if (!amount || this.isPlayerTurn || (amount < (elementValue * bigBlind))) {
            tipDiv.style.visibility = 'hidden';
        } else {
            tipDiv.style.visibility = 'visible';
        };
    }

    setTipMessage(data) {
        const tipThankMessage = $(this.wrapper).find(".tipThankMessage")[0];
        tipThankMessage.style.display = 'block';
        const thankyouImg = $(tipThankMessage).find(".thankyou-img")[0];
        const thanktext = $(tipThankMessage).find(".thanktext")[0];

        thankyouImg.style.animation = "tipMessageAnimate 2.5s";
        thanktext.style.animation = "tipMessageAnimate 2.5s";

        if (data.money !== undefined && data.seat === getPlayerSeat())
            this.setPlayerMoney(data.money);

        setTimeout(() => {
            tipThankMessage.style.display = 'none';
            thankyouImg.style.animation = "";
            thanktext.style.animation = "";
        }, 3000);
    }
}