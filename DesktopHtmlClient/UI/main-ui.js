import { showCards, sitIn, sitOut, playerLeaveTable, sitOutNextHand, tableSettings, round, tableSubscribe, waitForBB, doChat, acceptInsurance, setIsBeforeunload } from "../services/table-server";
import { disConnectSocket, playerLeave, updatePlayerInfo, submitSideBet, ShowTipToDealer, onShareHand, hitGame01 } from "../socket-client";
import { toggleCheckbox } from "./checkbox";
import { getPlayerSeat, getCurrentTurn, turnAction, myInfo, registerTournament } from '../services/table-server';
import { removeMuckedFlag, showBuyIn } from './game-ui';
import { setDetectedDoubleBrowser, userMode, userToken, defaultCurrency } from '../services/game-server';
import { getMoneyText, getMoneyValue, getcurrencyIcon, round2, roundWithFormatAmount } from "./money-display";
import { getCardImageFilePath, getPlayerCardHandGroup } from './card-ui';
import { shareHandHostAddress, hostAddress } from '../http-client';
import { changeSelectedLanguage, hideLanguageOption, getMessage } from "./language-ui";
import { customTimer } from "../services/utils-server";
import countryData from '../languages/country.json';

const tableSettingSpanDiv = $(".tableSettingsSpan")[0];
const tableNameDiv = $(".tableName")[0];
const profit = $(".profit")[0];
const gameTypeDiv = $(".gameType");
const currentStatsType = $(".currentStatsType")[0];
const winHistoryTablename = $(".winHistoryTablename")[0];
const winHistoryVPIP = $(".winHistoryVpip")[0];
const historyBox = $(".historyBox")[0];
const prizeBox = $(".prize-popup-table")[0];
const tournamentNameDiv = $(".tournamentName");
const handIdDiv = $(".handId")[0];
const cashGameInfo = $(".cashGameInfo")[0];
const tournamentLevelInfo = $(".tournamentLevelInfo");
const draggableDiv = $('#activityContainer')[0];
const dragHandle = $('.drag-handle')[0];

const actionUIDiv = $("#turnActionsDiv")[0];
const betDivWrapper = $("#betDivWrapper")[0];
const raiseButton = $("#raiseButton")[0];
const automaticActionsDiv = $("#automaticActionsDiv")[0];
const autoCheckOrFoldButton = $("#autoCheckOrFoldButton")[0];
const autoCheckButton = $("#autoCheckButton")[0];
const autoCheckCheckbox = $("#autoCheckButton .checkbox")[0];
const autoCheckOrFoldCheckbox = $("#autoCheckOrFoldButton .checkbox")[0];
const alwaysFoldCheckboxes = $(".alwaysFoldButton .checkbox");
const alwaysFoldButtons = $(".alwaysFoldButton");
const waitForBBButtons = $(".waitForBBButton");
const waitForBBCheckboxes = $(".waitForBBButton .checkbox");
const sitOutNextHandButtons = $(".sitOutNextHandButton");
const sitOutNextHandCheckboxes = $(".sitOutNextHandButton .checkbox");
const smallBlindSpan = $(".smallBlind");
const winHistoryBuyIn = $(".winHistoryBuyIn")[0];
const statsUsername = $(".statsUsername")[0];
const statsAvatar = $(".statsAvatar")[0];
const statsFlag = $(".statsFlag")[0];
const statsTable = $(".statsTable")[0];
const statsWallet = $(".statsWallet")[0];
const statsGlobal = $(".statsGlobal")[0];
const sbSpan = $(".sb")[0];
const bbSpan = $(".bb")[0];
const levelInfoDiv = $(".levelInfo")[0];
const bigBlindSpan = $(".bigBlind");
const anteSpan = $(".ante");
const levelSpan = $(".level");
const nextLevelSpan = $(".nextLevel")[0];
const levelTimer = $(".tournamentOnly .timer")[0];
const statsTabButton = $(".statsTabButton")[0];
const LogHead = $(".activity-header span")[0];
const breakCountdownDiv = $("#breakTime")[0];
const tournamentCancelTimeDiv = $("#tournamentCancelTime")[0];
const callButton = $(".callButtonDiv")[0];
const foldToAnyBetButtonDiv = $(".foldToAnyBetButton")[0];
// const checkToAnyBetButtonDiv = $(".checkToAnyBetButton")[0];
const callButtonCheckbox = $(".callButtonDiv .checkbox")[0];
const foldToAnyBetButtonCheckboxe = $(".foldToAnyBetButton .checkbox")[0];
const shuffleVerificationButtonDiv = $("#shuffleVerificationButton")[0];
const showAsSUDCheckboxDiv = $("#showAsSUDCheckbox")[0];
const prev_button = $(".prev-button")[0];
const next_button = $(".next-button")[0];

const sitInBtn = $("#backButton")[0];
const showCardBtn = $("#showCardsButton")[0];
const menuBottomButtons = $(".menuBottomButtons button");
const addChipsButtons = $(".addChipsButton");
const addTipsButtons = $(".addTipsButton")[0];
const TipsOptions = $("#tip-button button");
const tipButtonDiv = $("#tip-button")[0];
const AutoTip = $(".AutoTip")[0];
const callText = $(".callText")[0];
const settingsButtons = $(".settingsButton");
const buyInMenu = $("#buyInMenu")[0];
const settingsMenu = $("#settingsMenu")[0];
const sitOutButtons = $(".sitOutButton");
const leaveButtons = $(".leaveButton");
const backLobbyButtons = $(".backLobbyButton");
const shareHand = $(".sharehand")[0];
const tournamentDivs = $(".tournamentOnly");
const tournamentInfoDiv = $(".tournamentInfo")[0];
const meDiv = $("#meDiv")[0];
const tropyDivs = $(".trophyDiv");
const tropySpans = $(".position");
const totalPlayingPlayersDiv = $(".totalPlayingPlayers")[0];
const openMenuButton = $("#openMenuButton")[0];
const mobileSideBar = $("#mobileSideBar")[0];
const handResultDiv = $(".handResult")[0];
// const waitListDiv = $(".waitingList")[0];
// const joinWaitingButton = $(".waitingList button")[0];
// const waitListCount = $(".waitingListSide > div:first-of-type")[0];
// const waitList = $(".users")[0];
// const waitListDropdown = $("#usersDropdown")[0];
// const waitListArrow = $("#arrow")[0]
const logDiv = $('.logData')[0];
const chatDiv = $('.chat-messages')[0];
const chatContainerDiv = $("#chatContainer")[0];
const chatInput = $('#chatInput')[0];
const chatSendIcon = $('.chatSend')[0];
const chatButton = $('.chatButton')[0];
const logButton = $('.logTabButton')[0];
const multiTableButtons = $(".multiTableButton");
const CloseModal = $(".close, #GO, .LobbyButton");
const preChatMsgOrEmoji = $('.preChatMsg');
const tournamentTimers = $(".timers")[0];
const insuranceYesButton = $(".insuranceYesButton")[0];
const rebuy_tournament = $(".rebuy_tournament")[0];
const insuranceNextTime = $(".insuranceNextTime")[0];
const insuranceClose = $(".insuranceClose")[0];
const insurancePrice = $(".insurancePrice")[0];
const allInPrice = $(".allInPrice");
const preFlopAutoFoldDiv = $(".preFlopAutoFold")[0];
const currencyImage = $(".currencyImage")[0];
const autoFoldSetting = $(".autoFoldSetting")[0];
const progressBar = $('.progress')[0];
const progressHandle = $('.progress-handle')[0];
const resizeHandle = $('.resize-handle')[0];
const uniquePlayers = new Set();

let isDragging = false;
let startX, startY,scrollLeft;
let startWidth, startHeight;
let isDragging1 = false;
let isResizing = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let m_Call = 0;
let msgData = [];
let currentIndex = msgData.length +1; 
export class MainUI {
    constructor(buyInUI) {
        this.playerInfo = {
            name: "Guest",
            seat: 0
        };

        this.levelInfo = {
            level: 0,
            duration: 0,
            nextSB: 0,
            nextBB: 0,
            ante: 0
        };

        this.tableInfo = {
            name: "Table",
            mode: "cash",
            smallBlind: 0,
            bigBlind: 0
        };

        this.buyInUI = buyInUI;
        this.prevLevel = 0;
        this.breakDuration = 60;
        this.interval = undefined;
        this.tournamentCancelTimeInterval = undefined;
        this.tournamentTimeInterval = undefined;
        this.h4htimerInterval = undefined;
        this.lvlInterval = undefined;
        this.optionAlwaysFold = false;
        this.optionActionAutoCheck = false;
        this.optionActionAutoCheckOrFold = false;
        this.optionFoldToAnyBet = false;
        this.optionCall = false;
        this.isTurn = false;
        this.isPlaying = false;
        this.insuranceAmount = 0;
        this.insuranceWinAmount = 0;
        this.playerAutoFoldCards = [];
        this.isOpenAutoFoldSetting = false;
        this.currentStreet = '';
        this.currentHandActions = [];
        this.currentPlayer = 0;
        // this.showAutoCheckOrFold = false;
        this.init();

        this.handHistory = {
            preflop: [],
            flop: [],
            turn: [],
            river: []
        };
        this.potSizes = {
            preflop: 0,
            flop: 0,
            turn: 0,
            river: 0
        };
    }

    init() {
        breakCountdownDiv.style.visibility = "hidden";
        hideLanguageOption();
        this.setActive(automaticActionsDiv, false);
        this.setDisplay(preFlopAutoFoldDiv, false);
        this.setElementsDisplay(leaveButtons, false);
        this.setElementsDisplay(backLobbyButtons, true);
        this.setActive(foldToAnyBetButtonDiv, false);
        this.setActive(sitInBtn, false);
        this.setActive(callButton, false);
        this.setActive(addTipsButtons, false);
        this.setActive(autoCheckOrFoldButton, false);
        this.setActive(autoCheckButton, false);
        this.setDisplay(AutoTip, false);
        this.setElementsDisplay(tournamentDivs, false);
        this.setDisplay(tournamentInfoDiv, false);
        this.setActive(tableNameDiv, false);
        this.setDisplay(shareHand, false);
        /*   this.setActive(tableSettingSpanDiv, false, 88); */
        this.setActive(meDiv, false);
        this.setDisplay(statsTabButton, false);
        this.setActive($(meDiv).find(".stars")[0], false);
        this.setActive(handResultDiv, false);
        this.setDisplay(autoFoldSetting, false);
        this.setElementsDisplay(multiTableButtons, false);
        this.setDisplay(shuffleVerificationButtonDiv.parentElement, false);
        this.setDisplay(showAsSUDCheckboxDiv.parentElement, false);

        sitInBtn.addEventListener('click', () => {
            this.onSitInClick();
        });
        prev_button.addEventListener('click', () => {
            if (currentIndex > 1) {
                currentIndex--;
                this.showHandHistory(currentIndex);
                progressHandle.style.left = `${((currentIndex -1) / (msgData.length )) * 100}%`;
            }
        });
        next_button.addEventListener('click', () => {
            if (currentIndex < msgData.length +1) {
                currentIndex++;
                this.showHandHistory(currentIndex);
                progressHandle.style.left = `${((currentIndex -1) / (msgData.length )) * 100}%`;
            }
        });
        progressHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDragging = true;isDragging1 = false;
            startX = e.clientX - progressHandle.offsetLeft;
            scrollLeft = progressBar.scrollLeft;
        });
        dragHandle.addEventListener('mousedown',(e)=>{
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging1 = true;
        });
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); 
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = draggableDiv.offsetWidth;
            startHeight = draggableDiv.offsetHeight;
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            initialX = currentX;
            initialY = currentY;
            isDragging1 = false;
            isResizing = false;
        });
        
        document.addEventListener('mousemove', (e) => {

            e.preventDefault();
            if (isDragging) {
            
                let x = e.clientX - startX;
                let progressWidth = progressBar.offsetWidth; 
                
                let percentScrolled = Math.max(0, Math.min(1, x / progressWidth));
                let newIndex = Math.round(percentScrolled * (msgData.length)) + 1; 
                // Ensure index stays within bounds
                if (newIndex < 1) newIndex = 1;
                if (newIndex >= msgData.length + 1) newIndex = msgData.length + 1;
                if (newIndex !== currentIndex) {
                    currentIndex = newIndex ;
                    this.showHandHistory(currentIndex);
                }
                
                progressHandle.style.left = `${((currentIndex -1) / (msgData.length)) * 100}%`;
            }
            if (isDragging1) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                draggableDiv.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
            if (isResizing) {
                let deltaX = e.clientX - startX;
                let deltaY = e.clientY - startY;
        
                let newWidthPx = startWidth + deltaX;
                let newHeightPx = startHeight + deltaY;
        
                // Convert px to vw/vh
                let newWidthVw = (newWidthPx / window.innerWidth) * 100;
                let newHeightVh = (newHeightPx / window.innerHeight) * 100;
                const rowHeight = newHeightVh / 6;
        
                draggableDiv.style.width = `${newWidthVw}vw`;
                draggableDiv.style.height = `${newHeightVh}vh`;
                draggableDiv.style.setProperty('--row-height', `${rowHeight}vh`);
                draggableDiv.style.setProperty('--parent-width', `${newWidthVw}vw`);
                draggableDiv.style.setProperty('--parent-height', `${newHeightVh}vh`);
                // const baseSize = Math.min(newWidth, newHeight) / 30;
                // const fontSize = Math.max(8, Math.min(baseSize, 16));
                // const imgSize = Math.max(8, Math.min(baseSize * 1.2, 14));
                // const marginBottom = Math.max(1, Math.min(baseSize * 0.012, 8));
                // const avatarSize = Math.max(25, Math.min(baseSize * 2, 50));
                // const progressWidth = Math.max(130, Math.min(baseSize * 2, 300));
                // const navigation = Math.max(200, Math.min(baseSize * 1.2, 400));
                // const cardWidth = Math.max(15, Math.min(baseSize * 1.2, 40));   // clamp between 15�40px
                // const cardHeight = cardWidth * 1.42;
                // const navButtons = draggableDiv.querySelectorAll('.nav-button');
                // const progressBar = draggableDiv.querySelectorAll('.progress-bar');
                // const nav = draggableDiv.querySelectorAll('.navigation');
                // const handCounter = draggableDiv.querySelectorAll('.hand-counter');
                // const activityHeader = draggableDiv.querySelectorAll('.activity-header');

                // // Dynamically calculate size (adjust clamp range as needed)
                // const navBtnSize = Math.max(10, Math.min(baseSize * 1.2, 50));

                // // Apply to buttons
                // navButtons.forEach(btn => {
                //     btn.style.width = `${navBtnSize}px`;
                //     btn.style.height = `${navBtnSize}px`;
                // });

                // // Apply to inner images (you can scale slightly smaller if needed)
                // // navButtonImgs.forEach(img => {
                // //     img.style.height = `${navBtnSize - 8}px`; // slight padding inside
                // // });
            
                // // Set base font
                // draggableDiv.style.fontSize = `${fontSize}px`;
            
                // // Update player balance font
                // const balances = draggableDiv.querySelectorAll('.player-balance');
                // balances.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                // });
                // nav.forEach(el => {
                //     el.style.maxWidth = `${navigation}px`;
                // });
                // const betAction = draggableDiv.querySelectorAll('.bet-action');
                // betAction.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                // });
                // handCounter.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                // });
                // activityHeader.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                // });
                // const betAmount = draggableDiv.querySelectorAll('.bet-amount');
                // betAmount.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                // });
                // const playerName = draggableDiv.querySelectorAll('.player-name');
                // playerName.forEach(el => {
                //     el.style.fontSize = `${fontSize}px`;
                //     el.style.marginBottom = `${marginBottom}px`;
                // });
                // progressBar.forEach(el => {
                //     el.style.width = `${progressWidth}px`;
                // });
            
                // // Update player balance img
                // const imgs = draggableDiv.querySelectorAll('.playerBalance img');
                // imgs.forEach(img => {
                //     img.style.width = `${imgSize}px`;
                //     img.style.height = `${imgSize}px`;
                // });
                // const avatars = draggableDiv.querySelectorAll('.player-avatar');
                // avatars.forEach(avatar => {
                //     avatar.style.width = `${avatarSize}px`;
                //     avatar.style.height = `${avatarSize}px`;
                // });

                // const cardImgs = draggableDiv.querySelectorAll('.cards img');
                // cardImgs.forEach(img => {
                //     img.style.width = `${cardWidth}px`;
                //     img.style.height = `${cardHeight}px`;
                // });

            }
        });

        for (const button of sitOutButtons)
            button.addEventListener('click', () => { if (this.isTurn) this.onSitOutClick(); });
        showCardBtn.addEventListener('click', () => {
            this.onShowCardClick();
        });

        for (const tropyDiv of tropyDivs)
            this.setActive(tropyDiv, false);

        for (const button of leaveButtons)
            button.addEventListener('click', () => { playerLeaveTable(); });

        for (const button of backLobbyButtons)
            button.addEventListener('click', playerLeave);

        for (const button of CloseModal)
            button.addEventListener('click', () => {
                $('#shareHandMessage').modal('hide');
                $('#successModal').modal('hide');
                $('#tournamentResultModal').modal('hide');
            });

        for (const button of preChatMsgOrEmoji) {
            button.addEventListener('click', (e) => {
                doChat({ msg: e.target.innerText });
            });
        }

        for (const button of menuBottomButtons) {
            button.addEventListener('click', this.closeMenu);
        }

        for (const button of addChipsButtons) {
            button.addEventListener('click', () => {
                updatePlayerInfo(() => {
                    this.buyInUI.showBuyIn(true);
                    this.buyInUI.setBuyInPanelInfo(1);
                }, 100);
            });
        }

        for (const button of settingsButtons) {
            button.addEventListener('click', () => {
                this.setActive(settingsMenu, true);
            });
        }

        shareHand.addEventListener('click', () => {
            onShareHand(
                (encryptText) => {
                    if (encryptText !== "") {
                        navigator.clipboard.writeText(shareHandHostAddress + `/?token=` + encryptText);
                        $('#shareHandMessage').modal('show');
                    }
                }
            )
        })

        addTipsButtons.addEventListener('click', () => {
            //this.setActive(tipButtonDiv, true);
        });

        autoFoldSetting.addEventListener('click', () => {
            $("#autoFoldFrame").attr("src", `${hostAddress}/autofolds?usertoken=${userToken}`);
            $("#autoFoldSettingModal").modal("show");
            this.isOpenAutoFoldSetting = true;
        });

        for (const button of TipsOptions) {
            button.addEventListener('click', () => {
                const TipAmount = button.attributes['value'].value;
                // this.setActive(tipButtonDiv, false);

                button.classList.add('active');
                // Change the image for the active button temporarily
                /*   button.querySelector('.tipImage').src = './images/tipclicked.png'; // Image during action
                  // Change text color for the active button
                  button.querySelector('.tip-text').style.color = '#E2D83E'; */

                // Simulate an action completion delay (e.g., AJAX call, processing, etc.)
                setTimeout(() => {
                    /*   // Change the image to the final state after the action is completed
                      button.querySelector('.tipImage').src = './images/tipafterclick.png'; // Replace with your final image URL
                      // Optionally, you can also keep the text color yellow or change it to something else
                      button.querySelector('.tip-text').style.color = '#323E67'; // Final text color (optional) */
                    button.classList.remove('active');
                }, 2000); // Adjust the delay time (in milliseconds) as needed
                ShowTipToDealer(round2(TipAmount));
            })
        }

        for (const waitForBBCheckbox of waitForBBCheckboxes) {
            waitForBBCheckbox.addEventListener('change', () => { waitForBB(waitForBBCheckbox.checked) });
        }
        for (const sitOutNextHandCheckbox of sitOutNextHandCheckboxes) {
            sitOutNextHandCheckbox.addEventListener('change', () => { sitOutNextHand(sitOutNextHandCheckbox.checked) });
        }

        for (const alwaysFoldCheckbox of alwaysFoldCheckboxes) {
            alwaysFoldCheckbox.addEventListener('change', () => {
                this.onOptionAlwaysFold(alwaysFoldCheckbox.checked);
                this.showSitIn(alwaysFoldCheckbox.checked)
            });
        }

        autoCheckCheckbox.addEventListener('change', () => {
            this.onOptionActionAutoCheck(autoCheckCheckbox.checked);
        });

        autoCheckOrFoldCheckbox.addEventListener('change', () => {
            this.onOptionActionAutoCheckOrFold(autoCheckOrFoldCheckbox.checked);
        });
        foldToAnyBetButtonCheckboxe.addEventListener('change', () => {
            this.onOptionFoldToAnyBet(foldToAnyBetButtonCheckboxe.checked);
        });
        callButtonCheckbox.addEventListener('change', () => {
            this.onOptionCall(callButtonCheckbox.checked);
        });

        tournamentInfoDiv.addEventListener('click', () => {
            $("#tournamentInfoModal").modal('show');
        });

        /*  openMenuButton.addEventListener('click', () => {
             $(mobileSideBar).addClass("active");
         });

         mobileSideBar.addEventListener('click', () => {
             $(mobileSideBar).removeClass("active");
         }); */

        // joinWaitingButton.addEventListener('click', () => {
        //     joinWaitingList();
        // })

        // waitListArrow.addEventListener('click', () => {
        //     if (waitListDropdown.style.display == 'none') {
        //         waitListDropdown.style.display = 'block';
        //     } else {
        //         waitListDropdown.style.display = 'none';
        //     }
        // })

        chatInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                doChat({ msg: e.target.value });
                e.target.value = "";
            }
        });

        chatSendIcon.addEventListener('click', () => {
            if (chatInput.value) {
                doChat({ msg: chatInput.value });
                chatInput.value = "";
            }
        });

        for (const button of multiTableButtons) {
            button.addEventListener('click', () => {
                setIsBeforeunload(undefined);
                window.open(hostAddress + "/frontUser/newhome", userToken);
            });
        }

        insuranceYesButton.addEventListener('click', () => {
            acceptInsurance(this.insuranceAmount, this.insuranceWinAmount);
            $('#insuranceModal').modal('hide');
        });

        insuranceNextTime.addEventListener('click', () => {
            $('#insuranceModal').modal('hide');
        });
        insuranceClose.addEventListener('click', () => {
            $('#insuranceModal').modal('hide');
        });
    }

    setTrophyInfo(position, number, playingPlayers) {
        for (const tropySpan of tropySpans) {
            tropySpan.innerHTML = `${position}<label>/${number}</label>`;
        }
        totalPlayingPlayersDiv.innerHTML = `${playingPlayers} Playing`;
        this.currentPlayer = playingPlayers;
    }

    setAverageAndBiggestStack(averageStack, biggestStack) {
        $(".averageStack").html(roundWithFormatAmount(averageStack));
        $(".biggestStack").html(roundWithFormatAmount(biggestStack));
    }

    showTrophyInfo(value) {
        for (const tropyDiv of tropyDivs)
            this.setActive(tropyDiv, value);
    }
    roundResult(roundResult){
        this.saveHandHistory();

        let players = roundResult.players
        winHistoryVPIP.innerText = roundWithFormatAmount(getMoneyValue(roundResult.vpip)); 
        for(let j=0; j < players.length; ++j ){
            const player = players[j];
            if(player.prize > 0 && player.winnerHistory[0].index == getPlayerSeat()){
                this.setwinnerHistory(player.winnerHistory);
            }
        }
    }
    setwinnerHistory(history){
        if(history){

            historyBox.innerHTML = '';
            for (let k = 0; k < history.length; k++) {
                let playercard = history[k].playercard;
                let tablecard = history[k].tablecard;
                let playerContainer = '';
                let tableContainer = '';
                if (typeof cards === "string") {
                    cards = cards.split(",").map(card => {
                        return card.replace(/^1([HDSC])$/, "A$1");
                    });
                }
                for (let i = 0; i < playercard.length; ++i) {
                    let card = playercard[i];
                    const cardImgFilePath = getCardImageFilePath(card);
                    var playerCardHtml = `<img src="${cardImgFilePath}" class="card-image">`
                        playerContainer += playerCardHtml;

                }
                for (let i = 0; i < tablecard.length; ++i) {
                    let card = tablecard[i];
                    const cardImgFilePath = getCardImageFilePath(card);
                    var tableCardHtml = `<img src="${cardImgFilePath}" class="card-image">`
                        tableContainer += tableCardHtml;

                }
                var winningHistoryData = 
                `<tr class="winnings-history-item">
                    <td class="info-label">${history[k].rank ? history[k].rank : 'HighCard'}</td>
                    <td class="card-stack">
                        <span class="playerCardContainer">${playerContainer}</span>
                        <span>${tableContainer}</span>
                    
                    </td>
                    <td class="winnings-details">
                        <span class="winnings-amount">+${roundWithFormatAmount(parseFloat(history[k].amount).toFixed(1))}</span>
                        <span class="arrow"><i class="fa-solid fa-angle-right"></i></span>
                    </td>
                </tr>`;
                historyBox.innerHTML += winningHistoryData;
            }
        }
    }
    showFoldToAnyBetCheckbox(value) {
        this.setElementsDisplay(alwaysFoldButtons, value);
    }

    showMultiTableButton(value) {
        this.setElementsDisplay(multiTableButtons, value);
    }

    onOptionAlwaysFold(value) {
        this.optionAlwaysFold = value;
        // this.showAutoCheckOptions(!value);
        // this.showAutoCheckOrFold = !value;
        this.doFoldToBet();
    }

    showAutoCheckOptions(value) {
        // if (this.optionAlwaysFold) {
        //     this.setActive(automaticActionsDiv, false);
        //     return;
        // }

        // if (automaticActionsDiv.style.visibility == "visible" && value) {
        //     return;
        // }

        // this.setActive(automaticActionsDiv, value);
        // this.resetAutoCheckOptions();
    }

    showFoldToAnyBetOption(value) {
        this.setActive(foldToAnyBetButtonDiv, value);
        
    }
    
    showautoCheckButton(value){
        this.setActive(autoCheckButton, value);
    }
    
    setCallButton(value, mainPlayerBet, totalMoney)
    {
        value ? this.setActive(callButton, true) : this.setActive(callButton, false);
        if(value){
            if(value > totalMoney)
                value = totalMoney;

            m_Call = value - mainPlayerBet;
            let span = callText.querySelector('span');
            const callbuttonText = tableSettings.mode == 'cash' ? getMoneyText(value - mainPlayerBet).outerHTML : roundWithFormatAmount(getMoneyValue(value - mainPlayerBet));
            if(span){

                let value1 = parseInt(span.textContent.trim());
                if(value1 < m_Call)
                    toggleCheckbox(callButtonCheckbox, false);
            }

            callText.innerHTML = callbuttonText;
        } 
    }
    
    setCheckFoldText(value) {
        $(autoCheckOrFoldButton).find('span')[0].innerHTML = value ? 'Fold' : 'Check/Fold';
        this.setActive(autoCheckOrFoldButton, round.state !== "PreFlop" );
    }
        setCheckFold(value) {
            this.setActive(autoCheckOrFoldButton, value);
        }
    resetAutoCheckButton(value){
        this.setActive(autoCheckOrFoldButton, value);
        this.setActive(autoCheckButton, value);
    }

    resetAutoCheckOptions() {
        toggleCheckbox(autoCheckCheckbox, false);
        this.onOptionActionAutoCheck(false);
        toggleCheckbox(autoCheckOrFoldCheckbox, false);
        this.onOptionActionAutoCheckOrFold(false);
        toggleCheckbox(callButtonCheckbox, false);
        this.onOptionCall(false);
    }

    onOptionActionAutoCheck(value) {
        this.optionActionAutoCheck = value;
        this.doAutoCheck();

        if (this.optionActionAutoCheck) {
            toggleCheckbox(autoCheckOrFoldCheckbox, false);
            this.onOptionActionAutoCheckOrFold(false);
            toggleCheckbox(foldToAnyBetButtonCheckboxe, false);
            this.onOptionFoldToAnyBet(false);
            toggleCheckbox(callButtonCheckbox, false);
            this.onOptionCall(false);
        }
    }

    onOptionActionAutoCheckOrFold(value) {
        this.optionActionAutoCheckOrFold = value;
        this.doAutoCheckOrFold();

        if (this.optionActionAutoCheckOrFold) {
            toggleCheckbox(autoCheckCheckbox, false);
            this.onOptionActionAutoCheck(false);
            toggleCheckbox(foldToAnyBetButtonCheckboxe, false);
            this.onOptionFoldToAnyBet(false);
            toggleCheckbox(callButtonCheckbox, false);
            this.onOptionCall(false);
        }
    }
    onOptionFoldToAnyBet(value) {
        this.optionFoldToAnyBet = value;

        if (this.optionFoldToAnyBet) {
            toggleCheckbox(autoCheckCheckbox, false);
            this.onOptionActionAutoCheck(false);
            toggleCheckbox(autoCheckOrFoldCheckbox, false);
            this.onOptionActionAutoCheckOrFold(false);
            toggleCheckbox(callButtonCheckbox, false);
            this.onOptionCall(false);
        }
    }
    onOptionCall(value) {
        this.optionCall = value;

        if (this.optionCall) {
            toggleCheckbox(autoCheckCheckbox, false);
            this.onOptionActionAutoCheck(false);
            toggleCheckbox(autoCheckOrFoldCheckbox, false);
            this.onOptionActionAutoCheckOrFold(false);
            toggleCheckbox(foldToAnyBetButtonCheckboxe, false);
            this.onOptionFoldToAnyBet(false);
        }
    }

    doFoldToBet() {

        const isfoldToAnyBet = (foldToAnyBetButtonCheckboxe.checked && !!getCurrentTurn().call);
        if ((!this.optionAlwaysFold && !isfoldToAnyBet) || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.onFoldClick();
        return true;
    }
    doCall() {

        const isCall = (callButtonCheckbox.checked && !!getCurrentTurn().call);
        if ((!isCall) || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;
        this.resetAutoCheckOptions();
        if (!getCurrentTurn().canCall) {
            // this.setActive(automaticActionsDiv, false);
            return false;
        }

        this.onBetClick(m_Call);
        return true;
    }

    doPreFlopAutoFold(autoFoldModeButtonCheckboxes, playerCards, activeSeats) {
        if (autoFoldModeButtonCheckboxes.checked != true || round.state != "PreFlop" || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        var autoFoldType = "";
        const activeSeatsCount = activeSeats.length;
        if (round.seatOfSmallBlind == getPlayerSeat())
            autoFoldType = "small_blind";
        else if (round.seatOfBigBlind == getPlayerSeat())
            autoFoldType = "big_blind";
        else if (activeSeatsCount >= 5) {
            const seatOfSmallBlind = round.seatOfSmallBlind;

            if (seatOfSmallBlind == undefined)
                return false;

            var palyer = getPlayerSeat();
            var playerPosition = 0;
            var next = activeSeats.indexOf(seatOfSmallBlind);
            for (let i = 0; i < activeSeatsCount; i++) {
                playerPosition++;
                if (activeSeats[next] == palyer)
                    break;

                if (activeSeats[next] == activeSeats[activeSeats.length - 1]) {
                    next = 0;
                } else {
                    next++;
                }
            }

            var autoFoldTypes = {};
            if (activeSeatsCount == 5) {
                autoFoldTypes = { "3": "early_position", "4": "middle_position", "5": "late_position" };
            } else if (activeSeatsCount == 6) {
                autoFoldTypes = { "3": "early_position", "4": "middle_position", "5": "middle_position", "6": "late_position" };
            } else if (activeSeatsCount == 7) {
                autoFoldTypes = { "3": "early_position", "4": "early_position", "5": "middle_position", "6": "late_position", "7": "late_position" };
            } else if (activeSeatsCount == 8) {
                autoFoldTypes = { "3": "early_position", "4": "early_position", "5": "middle_position", "6": "middle_position", "7": "late_position", "8": "late_position" };
            } else if (activeSeatsCount == 9) {
                autoFoldTypes = { "3": "early_position", "4": "early_position", "5": "middle_position", "6": "middle_position", "7": "middle_position", "8": "late_position", "9": "late_position" };
            }
            autoFoldType = autoFoldTypes[playerPosition];
        }

        if (autoFoldType == "")
            return false;

        const playerCardHandGroup = getPlayerCardHandGroup(playerCards);
        if (this.playerAutoFoldCards[autoFoldType] !== undefined) {
            if (this.playerAutoFoldCards[autoFoldType] !== undefined && this.playerAutoFoldCards[autoFoldType][playerCardHandGroup] == true) {
                this.onFoldClick();
                return true;
            }
        }

        return false;
    }

    doAutoCheck() {
        if (!this.optionActionAutoCheck || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.resetAutoCheckOptions();

        if (!getCurrentTurn().canCheck) {
            // this.setActive(automaticActionsDiv, false);
            return false;
        }

        // this.setActive(automaticActionsDiv, false);
        this.onBetClick(0);
        return true;
    }

    doAutoCheckOrFold() {
        if (!this.optionActionAutoCheckOrFold || getPlayerSeat() == -1 || getPlayerSeat() != getCurrentTurn().seat)
            return false;

        this.resetAutoCheckOptions();

        if (getCurrentTurn().canCheck) {
            this.onBetClick(0);
            // this.setActive(automaticActionsDiv, false);
        } else
            this.onFoldClick();
        return true;
    }

    onFoldClick() {
        turnAction("fold");
        this.setActive(actionUIDiv, false);
        this.setActive(betDivWrapper, false);
        this.setActive(raiseButton, false);
        this.setActive(automaticActionsDiv, false);
    }

    onBetClick(bet) {
        turnAction("bet", bet);
        this.setActive(actionUIDiv, false);
        this.setActive(betDivWrapper, false);
        this.setActive(raiseButton, false);
        this.setActive(automaticActionsDiv, false);
    }

    closeMenu() {
        const button = $(this);
        const div = button.closest('.menuDiv')[0];
        div.style.visibility = "hidden";
    }

    getTableMode() {
        return this.tableInfo.mode;
    }

    getPlayerSeat() {
        return this.playerInfo.seat;
    }

    setPlayerAutoFoldCards(autoFoldCard) {
        this.playerAutoFoldCards = autoFoldCard;
    }

    resetFoldToAnyBetOption() {
        toggleCheckbox(foldToAnyBetButtonCheckboxe, false);
    }

    setPlayerName(newPlayerInfo) {
        this.playerInfo.name = newPlayerInfo.name;
        $(meDiv).find("#myName")[0].innerText = this.playerInfo.name;
        this.setActive(meDiv, true);
        statsUsername.innerText = this.playerInfo.name;
    }
    setbuyin(amount){
        winHistoryBuyIn.innerText = roundWithFormatAmount(getMoneyValue(amount)); 
    }
    setPlayerDetail(newPlayerInfo) {
        if(tableSettings.mode == 'cash')
        winHistoryBuyIn.innerText = roundWithFormatAmount(getMoneyValue(newPlayerInfo.buyInAmount)); 

        winHistoryVPIP.innerText = roundWithFormatAmount(getMoneyValue(newPlayerInfo.vpip)); 
        statsAvatar.innerHTML = `<img src="${newPlayerInfo.avatar}" />`
        statsWallet.innerText = roundWithFormatAmount(newPlayerInfo.tableBalance)
        statsGlobal.innerText = roundWithFormatAmount(newPlayerInfo.globalBalance)
        statsFlag.innerHTML = `<img src="./images/flag/${countryData[newPlayerInfo.country ? newPlayerInfo.country : 'Greece'].toLowerCase()}.svg" />`

        $('.totalStatsType').text((newPlayerInfo.statsData.GameType).toUpperCase())
        $('.totalhand').text(newPlayerInfo.statsData.hand)
        $('.totalvpip').text(newPlayerInfo.statsData.vpip)
        $('.totalpfr').text(newPlayerInfo.statsData.pfr)
        $('.totalwin').text(newPlayerInfo.statsData.win)
        $('.totalcbet').text(newPlayerInfo.statsData.cbet)
        $('.total3bet').text(newPlayerInfo.statsData.threebet)
        $('.totalwt').text(newPlayerInfo.statsData.wt)
        $('.totalwsd').text(newPlayerInfo.statsData.wsd)
    }
    setProfit(profitAmount) {
        profit.innerText = roundWithFormatAmount(getMoneyValue(profitAmount)); 
        profit.style.color = profitAmount >= 0 ? 'green' : 'red';
    }
    setTableBalance(balance) {
        statsTable.innerHTML = tableSettings.mode == 'cash' ? getMoneyText(balance).outerHTML : roundWithFormatAmount(getMoneyValue(balance));
    }

    setHandResult(value, timeout = 0) {
        if (!value) {
            this.setActive(handResultDiv, false)
        } else {
            setTimeout(() => {
                this.setActive(handResultDiv, true)
                handResultDiv.innerText = value;
            }, timeout);

        }
    }

    setLevelInfo(level, duration, nextLevel, nextSB, nextBB, nextAnte, ante, sb, bb) {

        if (level == this.prevLevel)
            return;

        this.levelInfo.level = level;
        this.levelInfo.duration = Math.floor(duration);
        this.levelInfo.nextSB = nextSB;
        this.levelInfo.nextBB = nextBB;
        this.levelInfo.ante = ante;

        if (level != undefined) {
            const smallBlindText = roundWithFormatAmount(sb);
            $(tournamentLevelInfo).find(".smallBlind").html(smallBlindText);
            const bigBlindText = roundWithFormatAmount(bb);
            $(tournamentLevelInfo).find(".bigBlind").html(bigBlindText);
            $(tournamentLevelInfo).find(".ante").html(roundWithFormatAmount(ante));
            $(tournamentLevelInfo).find(".level").html(roundWithFormatAmount(level));
            this.setDisplay(levelInfoDiv, true);
        } else {
            this.setDisplay(levelInfoDiv, false);
            $(levelSpan).text("Break");
        }

        this.setElementsDisplay(tournamentDivs, true);
        /*  this.setActive(tableSettingSpanDiv, true); */
        if (nextBB != undefined && nextSB != undefined) {
            if (nextBB === 0 && nextSB === 0)
                nextLevelSpan.innerText = ``;
            else
                nextLevelSpan.innerHTML = `${roundWithFormatAmount(nextSB)}/${roundWithFormatAmount(nextBB)}, Ante ${roundWithFormatAmount(nextAnte)}`;
        } else {
            nextLevelSpan.innerText = "Break";
        }
        this.runLevelDurationTimer();
        this.prevLevel = level;
    }

    showLevel(value) {
        if (tableSettings.mode === "tournament")
            this.setActiveElements(anteSpan, value);
        this.setActiveElements(levelSpan, value);
        this.setActive(nextLevelSpan, value);
        this.setActive(levelTimer, value);
        this.setDisplay(statsTabButton, !value);

    }

    runLevelDurationTimer() {
        if (this.lvlInterval != undefined) return;
        this.lvlInterval = setInterval(() => {
            let hour = Math.floor(this.levelInfo.duration / 3600);
            let min = Math.floor((this.levelInfo.duration - hour * 60) / 60);
            let sec = this.levelInfo.duration - hour * 3600 - min * 60;
            levelTimer.innerText = hour + ":" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);

            if (this.levelInfo.duration === 0) {
                this.clearLevelDuration();
            }

            --this.levelInfo.duration;
        }, 1000);
    }

    clearLevelDuration() {
        clearInterval(this.lvlInterval);
        this.lvlInterval = undefined;
    }

    setTableName(name) {
        this.tableInfo.name = name;
        tableNameDiv.innerText = winHistoryTablename.innerText = name;
        this.setActive(tableNameDiv, true);
        currentStatsType.innerText = (tableSettings.gameType).toUpperCase();

    }
    setTournamentName(name, tournamentStructure) {
        for (const tournamentname of tournamentNameDiv)
            $(tournamentname).html(name);

        $('.tournamentStructure').text(tournamentStructure);
    }
    setCurrentStatsData(data){
        $('.currentVpip').text(data.vpip ? round2(data.vpip) : 0);
        $('.currentHand').text(data.hand ? round2(data.hand) : 0);
        $('.currentPfr').text(data.pfr ? round2(data.pfr) : 0);
        $('.currentWin').text(data.winRate ? round2(data.winRate) : 0);
        $('.currentCbet').text(data.cBet ? round2(data.cBet) : 0);
        $('.current3bet').text(data.threeBet ? round2(data.threeBet) : 0);
        $('.currentWsd').text(data.wsd ? round2(data.wsd) : 0);
        $('.currentWT').text(data.wt ? round2(data.wt) : 0);
    }
    setPrizeData(data){
        $('.prizePool').text(data.prizePoolValue ? round2(data.prizePoolValue) : 0);
        if(data.isSatellite == 0){
            if(data.prizePool.length > 0){
                data.prizePool.sort((a, b) => a.placePaid - b.placePaid);
                prizeBox.innerHTML = '';
                for (let i = 0; i < data.prizePool.length; ++i) {
                    var prizePoolData = `<tr>
                    <td>${data.prizePool[i].position} place</td>
                    <td>-</td>
                    <td class="prizeInfoPlace">${data.prizePool[i].result}</td>
                    </tr>`
                    
                    prizeBox.innerHTML += prizePoolData;
                }
                const lastPrize = data.prizePool[data.prizePool.length - 1];
                if (lastPrize.placePaid > this.currentPlayer && data.prizePool[this.currentPlayer - 1]) {
                    $('.nextPrize').text(`${data.prizePool[this.currentPlayer - 1].result} Place ${this.currentPlayer}`);
                } else {
                    $('.nextPrize').text(`${lastPrize.result} Place ${lastPrize.placePaid}`);
                }

           }
        } else {
           prizeBox.innerHTML += `<div>${data.ticket} Free Entries to ${data.winning_name}</div>`;
        }
    }

    setHandId(id) {
        handIdDiv.innerHTML = `Hand ID : <label>${roundWithFormatAmount(id)}</label>`;
        this.setActive(handIdDiv, true);
    }

    setHeader(isTournament) {
        this.setDisplay(cashGameInfo, !isTournament);
        this.setElementsDisplay(tournamentLevelInfo, isTournament);
        this.setDisplay(tournamentInfoDiv, isTournament);

        //  this.setDisplay(tournamentNameDiv, isTournament);
    }
    setLogHead(mode, bb, sb, handId, name){
        mode = mode.replace(/^./, c => c.toUpperCase());
        LogHead.innerHTML = `<div class="lodHeadText"><div>Nrpoker. ${mode}. </div><div>${name} </div><div>${roundWithFormatAmount(bb)}/${roundWithFormatAmount(sb)}. Hand ${roundWithFormatAmount(handId)}</div></div>`;
    }
    setSmallBlind(smallBlind) {
        this.tableInfo.smallBlind = smallBlind;
        const smallBlindText = roundWithFormatAmount(smallBlind);
        for (const sbspan of smallBlindSpan)
            sbspan.innerHTML = smallBlindText;

        sbSpan.innerText = smallBlindText
        /*  this.setActive(tableSettingSpanDiv, true); */
    }

    setAnte(ante) {
        this.tableInfo.ante = ante;
        const anteText = roundWithFormatAmount(ante);
        for (const antespan of anteSpan)
            antespan.innerHTML = anteText;

        this.setActiveElements(anteSpan, true);

    }

    setBigBlind(bigBlind) {
        this.tableInfo.bigBlind = bigBlind;
        const bigBlindText = roundWithFormatAmount(bigBlind);
        for (const bbspan of bigBlindSpan)
            bbspan.innerHTML = bigBlindText;
        
        bbSpan.innerHTML = bigBlindText;
        /*  this.setActive(tableSettingSpanDiv, true); */
    }
    setGameType(gameType) {
        for (const typeDiv of gameTypeDiv)
            typeDiv.innerText = gameType;
    }

    setCurrencyIcon() {
        const element = getcurrencyIcon();
        //currencyImage.innerHTML = element.outerHTML;
    }

    setShowDollarSign(value) {

    }

    showAddChips(value) {
        this.setElementsDisplay(addChipsButtons, value);
    }

    showShareHand(value) {
        this.setDisplay(shareHand, value);
    }

    showSitIn(value) {
        this.setActive(sitInBtn, value);
    }

    setTurnFlag(value) {
        this.isTurn = value;
    }

    onSitInClick() {
        if (tableSettings.mode === "tournament")
            this.setAlwaysFold(false);
        else
            sitIn();
    }

    onSitOutClick() {
        sitOut();
    }

    onShowCardClick() {
        showCards();
        removeMuckedFlag();
        this.showShowCardsButton(false);
        const playerCard = document.querySelector(".player_wrapper:nth-child(6).isPlayer .player-cards");
    
        if (playerCard) {
            playerCard.classList.add("show"); 
        }
    }

    showShowCardsButton(value) {
        showCardBtn.style.visibility = value ? "visible" : "hidden";
    }

    showSitOut(value) {
        this.setElementsDisplay(sitOutButtons, value);
    }

    showWaitForBB(value) {
        this.setElementsDisplay(waitForBBButtons, value);
    }

    showPreFlopAutoFold(value) {
        this.setDisplay(preFlopAutoFoldDiv, value);
    }

    showAutoFoldSetting(value) {
        this.setDisplay(autoFoldSetting, value);
    }

    setWaitForBB(value) {
        for (const waitForBBCheckbox of waitForBBCheckboxes) {
            toggleCheckbox(waitForBBCheckbox, value);
        }
    }

    setAlwaysFold(value) {
        this.showSitIn(value)
        this.optionAlwaysFold = value;
        for (const alwaysFoldCheckbox of alwaysFoldCheckboxes) {
            toggleCheckbox(alwaysFoldCheckbox, value, false);
        }
    }

    showLeaveGameButton(value) {
        this.setElementsDisplay(leaveButtons, value);
    }
    showTipDealer(value) {
        this.setActive(tipButtonDiv, value);
        this.setDisplay(AutoTip, value);
        //this.setActive(addTipsButtons, value);
    }

    showShuffleVerification(value) {
        this.setDisplay(shuffleVerificationButtonDiv.parentElement, value);
    }

    showUSDOption(value) {
        showAsSUDCheckboxDiv.parentElement.style.display = (value && defaultCurrency == "XRP") ? "flex" : "none";
    }

    showBackLobbyButton(value) {
        this.setElementsDisplay(backLobbyButtons, value);
    }

    showSitOutNextHand(value) {
        this.setElementsDisplay(sitOutNextHandButtons, value);
    }

    setSitOutNextHand(value) {
        for (const sitOutNextHandCheckbox of sitOutNextHandCheckboxes)
            toggleCheckbox(sitOutNextHandCheckbox, value);
    }

    showBreakTime(isBreak, breakDuration) {
        if (this.prevLevel == 0) return;
        if (!isBreak && this.interval != undefined) { this.clearBreakTime(); return; }
        if (!isBreak || this.interval != undefined) return;

        this.breakDuration = this.levelInfo.duration;
        breakCountdownDiv.style.visibility = "visible";
        breakCountdownDiv.style.display = "flex";
        $(breakCountdownDiv).find("div")[0].style.animationDuration = `${this.levelInfo.duration}s`;
        $(breakCountdownDiv).find("div")[0].style.animationName = "progressAnimation";
        this.interval = setInterval(() => {
            let min = Math.floor(this.breakDuration / 60);
            let sec = this.breakDuration - min * 60;
            $(breakCountdownDiv).find(".timer")[0].textContent = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
            --this.breakDuration;
            if (this.breakDuration === 0) {
                this.clearBreakTime();
            }
        }, 1000);
    }
    
    showTournamentCancelTime(res) {
        if (!res.status) {
            tournamentCancelTimeDiv.style.visibility = "hidden";
            tournamentCancelTimeDiv.style.display = "none";
            this.cleartournamentCancelTime();
            return true;
        }
        if (res.cancelWaitingTime > 0) {
            this.tournamentCancelTimeInterval = new customTimer();
            var duration = res.cancelWaitingTime;
            tournamentCancelTimeDiv.style.visibility = "visible";
            tournamentCancelTimeDiv.style.display = "flex";
            $(tournamentCancelTimeDiv).find("div")[0].style.animationDuration = `${duration}s`;
            $(tournamentCancelTimeDiv).find("div")[0].style.animationName = "progressAnimation";
            this.tournamentCancelTimeInterval.descendingTimer(duration, (time) => {
                $(tournamentCancelTimeDiv).find(".timer")[0].textContent = `${time.minutes} : ${time.seconds}`;

                if (time.minutes == "0" && time.seconds == "0") {
                    this.cleartournamentCancelTime();
                    this.showDoubleLoginMsg(getMessage('cancelTournament'));
                }
            });
        }
    }

    cleartournamentCancelTime() {
        tournamentCancelTimeDiv.style.visibility = "hidden";
        tournamentCancelTimeDiv.style.display = "none";
        if (this.tournamentCancelTimeInterval !== undefined) {
            this.tournamentCancelTimeInterval.stopTimer();
            this.tournamentCancelTimeInterval = undefined;
        }

    }

    clearBreakTime() {
        breakCountdownDiv.style.visibility = "hidden";
        breakCountdownDiv.style.display = "none";
        clearInterval(this.interval);
        this.breakDuration = 0;
        this.interval = undefined;
    }

    setActiveElements(elements, value) {
        if(elements && elements.length > 0){

            for (const element of elements)
                element.style.visibility = (value == false || userMode === 1) ? "hidden" : "visible";
        }
    }

    setElementsDisplay(elements, value) {
        for (const element of elements)
            element.style.display = (value == false || userMode === 1) ? "none" : "block";
    }

    setDisplay(element, value) {
        element.style.display = (value == false) ? "none" : "block";
    }

    setActive(element, value) {
        element.style.visibility = (value == false || userMode === 1) ? "hidden" : "visible";
    }

    setWaitList(players) {
        // this.setActive(joinWaitingButton, true);

        // waitListCount.innerText = players.length;
        // waitList.innerHTML = '';

        // const div = document.createElement('div');
        // div.innerText = 'user'
        // waitList.append(div);

        // for (const player of players) {
        // let userDiv;

        // if (player === this.playerInfo.name) {
        // userDiv = document.createElement('button');
        // joinWaitingButton.setAttribute('disabled', '');
        // } else {
        //  userDiv = document.createElement('div');
        // userDiv.className = "innerUser";
        // }

        // userDiv.innerHTML = player;

        // waitList.append(userDiv);
        // }
    }

    // showWaitList(value) {
    //     if (value) {
    //         waitListDiv.style.display = 'flex';
    //     } else {
    //         waitListDiv.style.display = 'none';
    //     }
    // }

    setPlayStatus(value) {
        this.isPlaying = value;

        this.showLogButton(value);
        this.showChatButton(value);
    }

    showLogButton(value) {
        logButton.style.display = value ? "block" : "none";
    }

    showChatButton(value) {
        chatButton.style.display = value ? "flex" : "none";
    }

    addLog(logData) {
        const action = this.parseLogMessage(logData);
        
        if(action){
            if (action.isNewRound) {
               
                    this.handHistory = {
                        preflop: [],
                        flop: [],
                        turn: [],
                        river: []
                    };
                    this.currentStreet = 'preflop';
                    return;
                
            }
            if(this.currentStreet){

                this.handHistory[this.currentStreet].push({
                    ...action,
                });
                if (currentIndex == msgData.length + 1 || msgData.length == 0) {
                    this.displayHandHistory(this.handHistory);
                    progressHandle.style.left = `${((currentIndex -1) / (msgData.length )) * 100}%`;
                }
            }
        }
    }

    addChat(data) {
        var html = '';

        const time = new Date().toLocaleString([], { hour: 'numeric', minute: 'numeric', hour12: true });
        if (getPlayerSeat() === data.seat) {
            html = `<div class="self-message-box">
                <img src="${myInfo.avatar}" alt="">
                <div class="message self">
                    <div class="username-time">
                        <span class="username">Your Message</span>
                        <span class="timestamp">${data.time}</span>
                    </div>
                    <div class="msg-text">${data.msg}</div>
                </div>
            </div>`;
        } else {
            html = `<div class="message">
                    <div class="username-time">
                        <span class="username">${data.playerName}</span>
                        <span class="timestamp">${data.time}</span>
                    </div>
                    <div class="msg-text">${data.msg}</div>

            </div>`;
        }
        chatDiv.innerHTML = chatDiv.innerHTML + html;


        chatDiv.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });

        const badge = $(chatButton).find(".badge")[0];
        if (!chatContainerDiv.classList.contains("openChatBox")) {
            badge.style.visibility = "visible";
            badge.innerText = (Number(badge.innerText) || 0) + 1;
        } else {
            badge.style.visibility = "hidden";
        }

    }

    showTournamentTime(timeDuration) {
        if (timeDuration > 0 && this.tournamentTimeInterval === undefined) {
            this.tournamentTimeInterval = new customTimer();
            this.tournamentTimeInterval.descendingTimer(timeDuration, (time) => {
                this.setActive(tournamentTimers, true);
                /* this.setActive(tableSettingSpanDiv, false); */
                this.showLevel(false);
                tournamentTimers.querySelector('.minutes').innerText = ('0' + time.minutes).slice(-2);
                tournamentTimers.querySelector('.seconds').innerText = ('0' + time.seconds).slice(-2);
                if (time.minutes == "0" && time.seconds == "0") {
                    this.setActive(tournamentTimers, false);
                }
            });
        }
    }

    showInsurance(data) {
        if (data.status == true) {
            var insuranceData = data.data;
            this.insuranceAmount = insuranceData.insurancePrice;
            this.insuranceWinAmount = insuranceData.allInPrice;

            const insurancePriceText = getMoneyText(insuranceData.insurancePrice);
            insurancePrice.innerHTML = insurancePriceText.outerHTML;
            for (const price of allInPrice) {
                let allInPriceText = getMoneyText(insuranceData.allInPrice);
                price.innerHTML = allInPriceText.outerHTML;
            }
            $('.your-hand-result').text(insuranceData.percentage.toFixed(2) + ' %');
            $('.opp-hand-result').text(insuranceData.opPercentage.toFixed(2) + ' %');

            $('.table-cards').html('');
            $('.your-cards').html('');
            $('.opp-cards').html('');
            let tableCardsCount = 0;
            for (let i = tableCardsCount; i < insuranceData.tableCards.length; ++i) {
                const cardFilePath = getCardImageFilePath(insuranceData.tableCards[i]);
                tableCardsCount = tableCardsCount + 1;
                const tableCard = `<img src="${cardFilePath}" class="img_1" style="width: -webkit-fill-available"/>`;

                $('.table-cards').append(tableCard)
            }
            let yourCardsCount = 0
            for (let i = yourCardsCount; i < insuranceData.cards.length; ++i) {
                const cardFilePath = getCardImageFilePath(insuranceData.cards[i]);
                yourCardsCount = yourCardsCount + 1;
                const yourCard = `<img src="${cardFilePath}" class="img_2" style="width: -webkit-fill-available"/>`;

                $('.your-cards').append(yourCard)
            }
            let opCardsCount = 0
            for (let i = opCardsCount; i < insuranceData.opCards.length; ++i) {
                const cardFilePath = getCardImageFilePath(insuranceData.opCards[i]);
                opCardsCount = opCardsCount + 1;
                const oppCard = `<img src="${cardFilePath}" class="img_3" style="width: -webkit-fill-available"/>`;

                $('.opp-cards').append(oppCard)
            }
            $('#insuranceModal').modal('show');
        } else {
            $('#insuranceModal').modal('hide');
            this.insuranceAmount = 0;
            this.insuranceWinAmount = 0;
        }

    }

    clearH4HTimer() {
        if (this.h4htimerInterval !== undefined) {
            clearInterval(this.h4htimerInterval);
            this.h4htimerInterval = undefined;
            $('#h4hMessagegModal').modal('hide');
        }
    }

    showH4HMessage(status, msg) {
        if (!status) {
            this.clearH4HTimer();
            return;
        }
        let secondsPassed = 0;
        this.clearH4HTimer();
        const timerDisplay = $("#h4hMessagegModal").find('.timer')[0];
        timerDisplay.textContent = `00:00`;
        this.h4htimerInterval = setInterval(() => {
            secondsPassed++;
            const minutes = String(Math.floor(secondsPassed / 60)).padStart(2, '0');
            const seconds = String(secondsPassed % 60).padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
        $('.h4h-message')[0].innerHTML = msg;
        $('#h4hMessagegModal').modal('show');
    }

    showMessage(msg, data = null) {
        if (data != null) {
            if (data.type == "RejoinInterval") {
                var Interval_time = Math.round(data.RestOfTime / 1000);
                let interval = undefined;

                if (Interval_time == 61) {
                    msg = "There is mandatory " + (Interval_time - 1) + " seconds delay if you want to rejoin this game";
                    $('.error-message')[0].innerHTML = msg;
                } else {
                    interval = setInterval(() => {
                        Interval_time--;
                        if (Interval_time > 0) {
                            msg = "There is mandatory " + Interval_time + " seconds delay if you want to rejoin this game";
                            $('.error-message')[0].innerHTML = msg;
                        } else {
                            $('#msgModal').modal('hide');
                        }
                    }, 1000);
                }

                $("#msgModal").on('hide.bs.modal', function() {
                    if (!!interval)
                        clearInterval(interval);
                    Interval_time = 1000;
                });
            }
        }

        $('#msgModal #myModalLabel')[0].innerText = (data !== null && data.labelText !== undefined) ? data.labelText : "Error Message";
        $('.error-message')[0].innerHTML = msg;
        $('#msgModal').modal('show');
    }

    showDoubleLoginMsg(msg) {
        setDetectedDoubleBrowser(true);

        $('.error-message')[0].innerHTML = msg;
        $('#msgModal #myModalLabel')[0].innerText = "Message"
        $('#msgModal button')[1].innerText = "Close Browser"

        $('#msgModal').modal('show');

        $("#msgModal").on('hide.bs.modal', function() {
            disConnectSocket();
            window.close();
        });
    }

    showTournamentResult(hasWin, prize, rank, isRegister, register_amount, id, tournament_id) {

        if (!hasWin) {
            $('.tournament-prize')[0].style.visibility = 'hidden';
        }

        var place = "th";
        if (/^[1]$/.test(rank))
            place = 'st';
        else if (/^[2]$/.test(rank))
            place = 'nd';
        else if (/^[3]$/.test(rank))
            place = 'rd';

        $('#tournamentRank')[0].innerText = `${rank} ${place} place`;
        const currency = (defaultCurrency === "USDC") ? "USDC" : "XRP";
        $('#tournamentPrize')[0].innerText = prize;
        $(rebuy_tournament).find('span')[0].innerText = `${register_amount} ${currency}`;
        $('.tournament-rebuy')[0].style.display = (isRegister) ? 'block' : 'none';

        rebuy_tournament.addEventListener('click', () => {
            $(".loader").show();
            registerTournament(tournament_id, id);
        });

        $('#tournamentResultModal').modal('show');

        $("#tournamentResultModal").on('hide.bs.modal', function() {
            //alert('The modal is about to be hidden.');
            window.close();
        });


    }

    parseLogMessage(log) {
        const action = {
            playerName: '',
            action: '',
            amount: '',
            balance: '',
            position: '',
            cards: [],
            isNewRound: false,
            avatar: '' 
        };

        if (log.isNewRound) {
            action.isNewRound = true;
            return action;
        }
        if(log.log){
            
            const showCardsMatch = log.log.match(/^(.*?)\s+shows\s+([\w\d]+),([\w\d]+)/);
            if (showCardsMatch) {
                const playerName = showCardsMatch[1];

                if (uniquePlayers.has(playerName)) {
                    return null; 
                }
            
                uniquePlayers.add(playerName);
                action.playerName = playerName;
                action.action = "Shows";
                action.amount = log.rank;
                action.avatar = log.avatar;
                action.cards = [showCardsMatch[2], showCardsMatch[3]];
                return action;
            }
            const winMatch = log.log.match(/(\w+)\s+Won\s+([\d.]+),\s+With:\s+\[([^\]]+)\]\s+(.+)/);

            if (winMatch) { 
                action.playerName = winMatch[1];
                action.action = "Won";
                action.amount = parseFloat(winMatch[2]);
                action.avatar = log.avatar;
                // action.balance = log.Balance;
                return action; 
            }
            const anteMatch = log.log.match(/ante\s*:\s*(\d+)/);
            if (anteMatch && anteMatch[1] !== "0") { 
                action.action = "All Ante";
                action.amount = parseFloat(anteMatch[1]);
                return action; 
            }

        }
        // const bettingMatch = log.log.match(/(\w+):(\w+)\s*(\d+)?/);
        if (log.action) {
            const actionType = log.action
                const validActions = ["SB","BB","call", "bet", "raise", "fold", "check", "allin"];
                if (actionType === "SB" || actionType === "BB") {
                    action.position = `<div class="player-tag-bb">${log.action}</div>`;
                } else {
                    action.position = '';
                }
                if (validActions.includes(actionType)) {
                    if(log.amount)[
                        this.updatePotSizes(this.currentStreet, log.amount)
                    ]
                    action.playerName = log.name;
                    action.action = log.action;
                    action.amount = log.amount || '';
                    action.balance = log.action == 'fold' ? '' : log.Balance || '';
                    action.avatar = log.avatar;
                    // action.position = this.getPlayerPosition(bettingMatch[1]);
                    return action;  
                }
        }
        const streetMatch = log.log.match(/(\w+): \[(.*?)\], (\d+) players/);
        if (streetMatch) {
            this.currentStreet = streetMatch[1].toLowerCase(); 
            if(this.currentStreet == 'showdown') {
                this.currentStreet = 'river';
            }
            if(this.currentStreet != 'preflop'){

                action.playerName = 'Dealer';
                action.action = streetMatch[1];
                action.cards = streetMatch[2].split(',');
                return action;
            }
        }
        // return action;
    }

    displayHandHistory(handHistory) {
        const logDiv = $('.logData')[0];
        logDiv.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'header';

        table.innerHTML = `
            <thead>
                <tr>
                    <td>
                        <div class="header-title">Pre-Flop</div>
                        <div class="header-value">${this.potSizes.preflop}</div>
                    </td>
                    <td>
                        <div class="header-title">Flop</div>
                        <div class="header-value">${this.potSizes.flop}</div>
                    </td>
                    <td>
                        <div class="header-title">Turn</div>
                        <div class="header-value">${this.potSizes.turn}</div>
                    </td>
                    <td>
                        <div class="header-title">River</div>
                        <div class="header-value">${this.potSizes.river}</div>
                    </td>
                </tr>
            </thead>
        `;

        const tbody = document.createElement('tbody');
        tbody.className = 'poker-table';
        const row = document.createElement('tr');

        ['preflop', 'flop', 'turn', 'river'].forEach(street => {
            const td = document.createElement('td');
            td.className = 'scroll_td';
            const scrollContent = document.createElement('div');
            scrollContent.className = 'scroll-content';
            handHistory[street].forEach(action => {
                const playerWrapper = document.createElement('div');
                playerWrapper.className = 'player-wrapper';
                let dealerCardsHTML = '';
                    if(action.cards.length > 0){

                        for (let i = 0; i < action.cards.length; ++i) {
                            const card = action.cards[i].toLowerCase();
                            if(card){
                                
                                const cardImgFilePath = getCardImageFilePath(card);
                                dealerCardsHTML += `<div class="content dealer-card" 
                                value=${card}>
                                <img class="" src="${cardImgFilePath}" style="height: 40px; width: 27px;"/>
                                </div>`;
                            }
                        }
                    }

                playerWrapper.innerHTML = `
                    <div class="player-avatar-wrapper">
                        ${action.position}
                        <div class="player-avatar">
                           ${action.avatar ? `<img src="${action.avatar}" alt="userAvatar">` : `<img src="./images/avtar.png" alt="Babar888">` }
                        </div>
                        <div class="playerBalance">
                            ${action.balance ? `<img src="./images/ChipsIcon.png" alt="userAvatar"> <div class="player-balance">${action.balance}</div>` : ``}
                        </div>
                    </div>
                    <div class="player-content">
                        <div class="player-detail">
                            <div class="player-name">${action.playerName}</div>
                            
                        </div>
                        <div class="player-container">
                            <div class="player-action">
                                <span class="bet-action">${action.action}</span>
                                ${action.amount ? `<span class="bet-action" style="">:</span><span class="bet-amount"> ${action.amount}</span>` : ''}
                            </div>
                            <div class="DealerCards ${dealerCardsHTML ? '' : 'empty'}" style="width: fit-content;display: grid;grid-template-columns: repeat(3, 27px);gap: 5px; margin-top:5px;">
                                ${dealerCardsHTML}
                            </div>
                        </div>
                    </div>
                `;

                scrollContent.appendChild(playerWrapper);
            });
            td.appendChild(scrollContent);
            row.appendChild(td);
        });

        tbody.appendChild(row);
        table.appendChild(tbody);
        logDiv.appendChild(table);
       
    }

    updatePotSizes(street, amount) {
        this.potSizes[street] = amount;
    }
    saveHandHistory() {
            msgData.push(JSON.parse(JSON.stringify(this.handHistory))); 
            if(currentIndex == msgData.length ){
                $('.hand-counter').html(`${msgData.length + 1} / <span class="totalLogs">${msgData.length + 1}</span>`);
                currentIndex = msgData.length + 1;  
                // this.displayHandHistory(this.handHistory);
            } else {
                $('.totalLogs').text(msgData.length + 1);
            }
            // this.showHandHistory(currentIndex);
            uniquePlayers.clear();
            return true;
    }
    showHandHistory(index) {
        if (index > 0 && index < msgData.length +2) {
            $('.hand-counter').html(`${index} / <span class="totalLogs">${msgData.length +1}</span>`);
            if(index == msgData.length +1){
                this.displayHandHistory(this.handHistory)
            } else {
                this.displayHandHistory(msgData[index-1]);
            }
        }
    }
}