
// $(document).ready(function() {
//     setLanguage(lang);
// });

$(".translate").click(function() {
    var selectedLang = $(this).attr("id");
    var langElements = $(".lang");

    fetch(`../Language/${selectedLang}.json`)
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        $(".lang").each(function(index, element) {
            var key = $(this).attr("key");
            $(this).text(jsonData[key]);
        });
        if (selectedLang === 'hebrew') {
            $('body').attr('dir', 'rtl');
            // langElements.css('text-align', 'right');
        } else {
            $('body').attr('dir', 'ltr');
            langElements.css('text-align', 'left');
        }
    })
    .catch(function(error) {
        console.log('Error fetching JSON: ' + error);
    });
});