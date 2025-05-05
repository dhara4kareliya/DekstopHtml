const translates = $(".translate");
var selectedLanguage = "english";
var selectedLanguageData = [];
var msgResponse = [];
var messageData = [];
(async() => {
    msgResponse = await fetch(`./languages/msg.json`);
    messageData = await msgResponse.json();

})();


for (let i = 0; i < translates.length; i++) {
    const translate = translates[i];
    translate.addEventListener("click", () => changeLanguage(translate.getAttribute("id")))
}


export async function changeLanguage(translate) {
    if (selectedLanguage == translate)
        return true;

    selectedLanguage = translate;
    await getLanguageData();
    updateLanguage();
}
export function hideLanguageOption() {
    var parentUrl = (window.location != window.parent.location) ?
        document.referrer :
        document.location.href;

    if (parentUrl.match(`t=([^&]+)`))
        return true;

    for (const element of translates)
        element.style.visibility = "hidden";
}

export function getMessage(msg) {
    return messageData[msg] || `Unknown error occurred.`;
}

function updateLanguage() {
    const langDiv = $(".lang");
    for (let i = 0; i < langDiv.length; i++) {
        const element = langDiv[i];
        var key = element.getAttribute("key");
        element.innerHTML = selectedLanguageData[key];
        if (element.getAttribute("placeholder"))
            element.setAttribute("placeholder", selectedLanguageData[key]);
    }
    const body = $("body");
    var elementWithTextAlign = body.find("*").filter(function() {
        return $(this).css('text-align') === 'left';
    });

    if (selectedLanguage === 'hebrew') {
        body.attr('dir', 'rtl');
        body.find(".btn-section").css({
            "margin-right": "145px",
            "width": "101px"
        })
        body.find(".btn-section .l-btn").css({
            "height: ": "38px !important",
            "width": "72px",
            "order": "-1"
        })
        elementWithTextAlign.css('text-align', 'right');
    } else {
        body.attr('dir', 'ltr');
        var elementWithTextAlign = $("body").find("*").filter(function() {
            return $(this).css('text-align') === 'right'; // Change 'left' to the specific value you are looking for
        });
        elementWithTextAlign.css('text-align', 'left');
    }
}

async function getLanguageData() {
    const response = await fetch(`./languages/${selectedLanguage}.json`);
    
    selectedLanguageData = await response.json();
}

export async function changeSelectedLanguage() {
    
    if (selectedLanguageData.length !== 0) {
        if ($('#successModal .successMessage')[0].innerText === 'Thank You') {
            $('#successModal .successMessage')[0].innerHTML = selectedLanguageData['thankYou'];
        } else if ($('#successModal .successMessage')[0].innerText !== 'Thank You') {
            $('#successModal .successMessage')[0].innerHTML = selectedLanguageData['thankYou1'];
        }
    } else {
        return;
    }
}