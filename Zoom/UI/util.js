export function indexOfElementInSelector (element, selector) {
    const elements = $(element.parentNode).find(selector)
    for (let i = 0; i < elements.length; i++) {
        if (elements[i] === element)
            return i;
    }
    return -1;
}

export function indexOfElementInSelector_1 (element, selector) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i] === element)
            return i;
    }
    return -1;
}