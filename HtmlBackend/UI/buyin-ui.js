import { playerBuyChips } from "../socket-client";

const buyInDiv = $("#buy_in_div")[0];
const buyInInput = $("#buyInInput")[0];
const buyInButton = $("#buyInButton")[0];
const buyInRange = $("#buyInRange")[0];

export class BuyInUI {
 constructor() {
  buyInButton.addEventListener('click', () => {
     playerBuyChips(+buyInInput.value);
  });
 }

 setTableName(name) {

 }

 setBlinds(sb, bb) {

 }

 setBuyInRange(minBuyIn, maxBuyIn) {
    buyInInput.min = minBuyIn;
    buyInInput.max = maxBuyIn;
    buyInRange.textContent = `minBuyIn: ${minBuyIn} / maxBuyIn: ${maxBuyIn}`;
    buyInInput.value = minBuyIn;
 }

 setCash(cash) {

 }

 setMoney(money) {
  
 }

 showBuyIn(visible) {
  buyInDiv.style.visibility = (visible == false) ? "hidden" : "visible";
 }
}