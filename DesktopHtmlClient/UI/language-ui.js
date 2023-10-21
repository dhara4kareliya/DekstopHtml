
// $(document).ready(function() {
//     setLanguage(lang);
// });

$(".translate").click(function() {
    var selectedLang = $(this).attr("id");

    fetch(`../Language/${selectedLang}.json`)
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        $(".lang").each(function(index, element) {
            var key = $(this).attr("key");
            console.log("Key:", key);
        $(this).attr("placeholder", jsonData[key]);
        console.log("Placeholder:", $(this).attr("placeholder"));
                $(this).text(jsonData[key]);
        });
        var elementWithTextAlign = $("body").find("*").filter(function() {
            return $(this).css('text-align') === 'left'; 
        });
        if (selectedLang === 'hebrew') {
            $('body').attr('dir', 'rtl');
            $("body").find(".btn-section").css({
                "margin-right": "145px",
                "width": "101px"
            })
            $("body").find(".btn-section .l-btn").css({
                "height: ": "38px !important",
                "width":"72px",
                "order": "-1"
            })
            elementWithTextAlign.css('text-align', 'right');
        } else {
            $('body').attr('dir', 'ltr');
            var elementWithTextAlign = $("body").find("*").filter(function() {
                return $(this).css('text-align') === 'right'; // Change 'left' to the specific value you are looking for
            });
            elementWithTextAlign.css('text-align', 'left');
        }
    })
    .catch(function(error) {
        console.log('Error fetching JSON: ' + error);
    });
});