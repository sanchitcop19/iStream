if (typeof EXT_NAME_CONTENT_SCRIPT_LOADED == "undefined") {
    platform = "Showtime";
    var EXT_NAME_CONTENT_SCRIPT_LOADED = true;

    var extension = {};

    //---------------------------------------------------------------------------------------------------------------------
    extension.initialize = function() {
        console.log("Initializing extension content script");

        // On document ready
        $(document).ready(function() {
            // Load CSS
            var path = chrome.extension.getURL("css/content.css");
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", path);
            document.getElementsByTagName("head")[0].appendChild(link);
        }); // End of document.ready

        // End of initialize
    };

    //---------------------------------------------------------------------------------------------------------------------
    // Start the extension content script
    extension.initialize();

    async function fetchAsync(url) {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }

    const getHuluLinks = function() {
        return [...document.getElementsByTagName("a")].filter(x => x.id.includes("title"));
    };

    const getShowtimeLinks = function() {
        return [...document.getElementsByTagName("span")].filter(x => x.className == "name");
    };

    let getTitles = function() {
        if (platform == "Hulu") {
            return getHuluLinks().map(x => x.text);
        } else if (platform == "Showtime") {
            return getShowtimeLinks().map(x => x.innerText);
        }
    };

    const APIKEY = "b365e774";

    let getImdbRating = async function(title) {
        let imdbRating = "";

        let query =
            "https://www.omdbapi.com/?s=" + title.replace(" ", "+") + "&" + "apikey=" + APIKEY;

        let result = await fetchAsync(query);

        if (!result["Search"]) {
            return "";
        }

        let imdbID = result["Search"][0]["imdbID"];

        query = "https://www.omdbapi.com/?i=" + imdbID + "&" + "apikey=" + APIKEY;
        result = await fetchAsync(query);

        if (result["Response"] === "True") {
            imdbRating = result["imdbRating"];
        }

        return imdbRating;
    };

    let addFontAwesome = function() {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "https://kit.fontawesome.com/d66392e131.js";
        s.crossOrigin = "anonymous";
        document.head.appendChild(s);
    };

    let createRatingDiv = function(imdbRating) {
        let topValue = "";
        if (platform == "Hulu") {
            topValue = "-2.5";
        } else if (platform == "Showtime") {
            topValue = "0";
        }
        imdbRating.style = "position:relative;right:-80%;top:" + topValue + "em";

        const imdbIcon = document.createElement("i");
        imdbIcon.className = "fab fa-imdb";
        imdbIcon.style = "margin:0.2em;position:relative;right:-80%;top:" + topValue + "em;";

        const ratingDiv = document.createElement("div");
        ratingDiv.className = "rating-div";

        ratingDiv.appendChild(imdbIcon);
        ratingDiv.appendChild(imdbRating);

        return ratingDiv;
    };

    let addCSS = function() {
        var s = document.createElement("style");
        s.type = "text/javascript";
        s.src = "https://kit.fontawesome.com/d66392e131.js";
        s.crossOrigin = "anonymous";
        document.head.appendChild(s);
    };

    let execute = async function() {
        addFontAwesome();
        const titles = getTitles();
        console.log(titles);

        for (let i = 0; i < titles.length; ++i) {
            try {
                const rating = await getImdbRating(titles[i]);
                console.log("got rating");
                const imdbRating = document.createElement("span");
                imdbRating.innerHTML = rating;
                const ratingDiv = createRatingDiv(imdbRating);
                if (platform == "Hulu") {
                    getHuluLinks()[i].parentElement.appendChild(ratingDiv);
                } else if (platform == "Showtime") {
                    getShowtimeLinks()[i].parentElement.appendChild(ratingDiv);
                }
            } catch (exception) {
                console.error(exception);
            }
        }
    };

    window.onload = execute;
}
