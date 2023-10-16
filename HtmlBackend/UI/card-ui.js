import { tableSubscribe } from "../services/table-server";
import { getCardsCanvas, getPlayerWrappersCount } from "./player-ui";

const fourColorsCheckbox = $("#fourColorsCheckbox")[0];
fourColorsCheckbox.addEventListener('change', () => {
    setFourColors(fourColorsCheckbox.checked);
});
let fourColors = false;

const cardImages = [];

const cardsImageProperties = {
    cardWidth: 102,
    cardHeight: 142
}

const mainCardsCanvas = $("#main-cards-canvas")[0];
const mainCardsCanvasContext = mainCardsCanvas.getContext("2d");

function setup () {
    setupCardImages();
    mainCardsCanvas.width = cardsImageProperties.cardWidth * 5;
    mainCardsCanvas.height = cardsImageProperties.cardHeight;
    for (let i = 0; i < getPlayerWrappersCount(); i++) {
        const canvas = getCardsCanvas(i);
        if (!canvas)
            continue;
        canvas.width = cardsImageProperties.cardWidth * 4;
        canvas.height = cardsImageProperties.cardHeight;
    }
}

function setupCardImages () {
    const suites = ["s", "c", "d", "h"];
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const addImage = (suit, value) => {
        const image = new Image();
        let name = value + suit;
        cardImages[name.toLowerCase()] = image;
        if (fourColors && (suit == "c" || suit == "d")) 
                name += "1";
        image.src = `./images/png/102x142/${name}.png`;
    };
    for (const suit of suites) {
        for (const value of values) {
            addImage(suit, value);
        }
    }
}

function getCardImage (cardName) {
    let name = cardName.toUpperCase();
    name = name.replace("T","10");
    return cardImages[name.toLowerCase()];
}

function drawCard (cardName, position, canvas) {
    if (cardName == "?")
        return;
    if (typeof canvas == "number")
        canvas = getCardsCanvas(canvas);
    const context = canvas ? canvas.getContext("2d") : mainCardsCanvasContext;
    const dx = position * cardsImageProperties.cardWidth;
    context.drawImage(getCardImage(cardName),
        dx, 0, cardsImageProperties.cardWidth, cardsImageProperties.cardHeight);
}

function drawCards (cards, canvas) {
    clearCanvas(canvas);
    if (!cards)
        return;
    for (let i = 0; i < cards.length; i++) 
        drawCard(cards[i], i, canvas);
}

function clearCanvas (canvas) {
    if (typeof canvas == "number")
        canvas = getCardsCanvas(canvas);
    const context = canvas ? canvas.getContext("2d") : mainCardsCanvasContext;
    if (!canvas)
        canvas = mainCardsCanvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function setFourColors (value) {
    fourColors = value;
    setupCardImages();
}

/**
 * Shows cards of the table an all players.
 * @param {TableStatus} status 
 */
function drawTableCards (status) {
    drawCards(status.cards);
    for (let i = 0; i < status.seats.length; i++) {
        const seat = status.seats[i];
        if (seat && seat.state != "Empty" && seat.cards)
            drawCards(seat.cards, i);
    }
}

setup();

tableSubscribe("onTableStatus", drawTableCards);

window.drawCard = drawCard;
window.clearCanvas = clearCanvas;
window.setFourColors = setFourColors;
export default {
    setup,
    setFourColors
}