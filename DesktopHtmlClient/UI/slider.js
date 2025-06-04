import { getMoneyText, getMoneyValue, round2 } from "./money-display";
import { actionUI } from "./game-ui";

const sliderClass = ".slider";
const thumbClass = ".thumb";
const displayClass = ".valueDisplay";
const sliders = $(sliderClass);
const displays = $(displayClass);
const betInput = $("#betDivWrapper input")[0];

let mouseDown = false;
window.addEventListener('mousedown', () => mouseDown = true);
window.addEventListener('mouseup', () => mouseDown = false);
window.addEventListener('touchstart', () => mouseDown = true);
window.addEventListener('touchend', () => mouseDown = false);

for (const slider of sliders) {
    slider.max = 100;
    slider.min = 0;
    slider.value = 0;
    slider.addEventListener('mousemove', event => slide(slider, event));
    slider.addEventListener('touchmove', event => slide(slider, event));
    slider.addEventListener('mousedown', event => {
        mouseDown = true;
        slide(slider, event);
    });
    slider.addEventListener('change', () => {
        updateDisplay(slider);
    });
}

function offsetofElement(elem) {
    if (!elem) elem = this;

    var x = elem.offsetLeft;
    var y = elem.offsetTop;

    while (elem = elem.offsetParent) {
        x += elem.offsetLeft;
        y += elem.offsetTop;
    }

    return { left: x, top: y };
}

function slide(slider, event) {
    if (!mouseDown)
        return;
    if (event.changedTouches) {
        const offset = offsetofElement(slider);
        const touch = event.changedTouches[0];
        event.offsetX = touch.clientX - offset.left + window.scrollX;
        event.offsetY = touch.clientY - offset.top + window.screenY;
    }
    const vertical = slider.offsetHeight > slider.offsetWidth;
    
    const thumb = $(slider).find(thumbClass)[0];
    let precent = 100 *
        (vertical ? (event.offsetY / slider.offsetHeight) : (event.offsetX / slider.offsetWidth));

    precent = Math.max(0, Math.min(100, precent));
    thumb.style[vertical ? "top" : "left"] = `${precent - (vertical ? 5 : 0)}%`;
    const min = parseFloat(slider.min || 0);
    const max = parseFloat(slider.max || 100);

    let part = precent / 100;
    if (vertical) part = 1 - part;

    slider.value = parseFloat((min + (max - min) * part).toFixed(2));
    if (slider.classList.contains('buyinSlider')) {
        slider.style.background = `linear-gradient(to right, #91CAFE 0%, #6D8CAE ${precent - (vertical ? 5 : 0)}%, #15163B ${precent}%)`;
      } else if (slider.classList.contains('betSlider')) {
        slider.style.background = `linear-gradient(to right, #288140 0%, #288140 ${precent - (vertical ? 5 : 0)}%, #15163B ${precent}%)`;
      }
    setSliderValue(slider, slider.value);
    actionUI.m_Raise = slider.value - actionUI.m_CurrentBet;
    // slider.dispatchEvent(new Event('change', { value: slider.value }));
}

function updateDisplay(slider) {
    for (const display of displays) {
        if ($(display).hasClass(slider.id)){
            const amountText = getMoneyText(slider.value);
            display.innerHTML = $(display).hasClass("moneyDisplay") ?
            amountText.outerHTML :
            getMoneyValue(slider.value);
        }
    }

    betInput.value = getMoneyValue(round2(slider.value - actionUI.m_CurrentBet));
}

export function setSliderValue(slider, value, condition = false) {
    const min = parseFloat(slider.min || 0);
    const max = parseFloat(slider.max || 100);
    const clampedValue = Math.min(max, Math.max(min, value));
    slider.value = clampedValue;
    
    const vertical = slider.offsetHeight > slider.offsetWidth;
    const thumb = $(slider).find(thumbClass)[0];
    const range = max - min;
    let part = clampedValue - min;
    part /= range;
    if (vertical)
        part = 1 - part;
    const precent = 100 * part;
    thumb.style[vertical ? "top" : "left"] = `${precent}%`;

    if (slider.classList.contains('buyinSlider')) {
        slider.style.background = `linear-gradient(to right, #91CAFE 0%, #6D8CAE ${precent - (vertical ? 5 : 0)}%, #15163B ${precent}%)`;
      } else if (slider.classList.contains('betSlider')) {
        slider.style.background = `linear-gradient(to right, #288140 0%, #288140 ${precent - (vertical ? 5 : 0)}%, #15163B ${precent}%)`;
      }
    if(!condition)
    slider.dispatchEvent(new Event('change', { value: clampedValue }));
}

export function setSliderMin(slider, min) {
    slider.min = min;
    if (slider.value < min)
        setSliderValue(slider, min);
    else
        setSliderValue(slider, slider.value);
}

export function setSliderMax(slider, max) {
    slider.max = max;
    if (slider.value > max)
        setSliderValue(slider, max);
    else
        setSliderValue(slider, slider.value);
}