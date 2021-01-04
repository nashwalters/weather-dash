$(document).ready(function(){
    init();
    search();
    cityListHistory();
    getHistory();
    clearHistoryAll();    
});

//function to load last search on reload.
function init() {
citySearch = localStorage.getItem("citySearch");
    citySearch = JSON.parse(citySearch);
    if (citySearch === null) {
        citySearch = [];
    } else {
        lastcity = citySearch.pop();
        getWeather(lastcity); 
    }
}       

//Function to get search query.
function search() {
   $("#search-btn").click(function(e){
        e.preventDefault();
        userInput = $("input").val().trim();
        getWeather(userInput);
    })
}

// Function to get weather info.
function getWeather(userCity) {
    $("#results").empty(); 
    $("#forecast-results").empty()
    var apiKey = "c8453a9e45b63926b5f3d0a5756bd773";
    var qUrl = "https://api.openweathermap.org/data/2.5/weather?q=" +userCity+ "&appid=" + apiKey;
    //Ajax call for general weather info.
    $.ajax({
        url: qUrl,
        method: "GET"
    }).then(function(response) {
        createBtn();
        var currentDate = moment().format('dddd, MMM DD');    
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        var tempC = (response.main.temp - 273);
        var iconCode = response.weather[0].icon;
        var kmh = (response.wind.speed)*(60*60)/1000
        var mph = (response.wind.speed)/0.44704
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        
    //Append results to the results div.
    $("#results").removeClass('hide'); 
    $("#results").append("<h3 class='style'>" + currentDate+ "</h3><br>",
                        "<h2>" + response.name + "</h2>",
                        "<img src='http://openweathermap.org/img/w/" + iconCode + ".png' class='current-icon' alt= 'weather icon' height='75' width ='75'>",
                        "<b> (" + response.weather[0].description +")</b><br>",
                        "<p> Temperature: <button id='cel'class='blue'>" + "°C" + "</button><button id='far'>" + "°F" + "</button></p>",
                        "<h4>"+ Math.round(tempC) + "</h4>",
                        "<p> Wind Speed: <big>" +(Math.round(kmh)) +" </big><em>Km/h</em></p>",
                        "<p> Humidity: " + response.main.humidity + " %" + "</p>",)
    //click event to go between celsius and fahrenheit
    $("#far").click(function(){ 
        $("#cel").removeClass('blue')
        $("h4").empty(Math.round(tempC))
        $("h4").append(Math.round(tempF))
        $("big").empty(Math.round(kmh))
        $("big").append(Math.round(mph))
        $("em").empty(" Km/h")
        $("em").append(" MPH")
        $("#far").addClass('blue')
    })
    $("#cel").click(function(){ 
        $("#far").removeClass('blue')
        $("h4").empty(Math.round(tempF))
        $("h4").append(Math.round(tempC))
        $("big").empty(Math.round(mph))
        $("big").append(Math.round(kmh))
        $("em").empty(" MPH")
        $("em").append(" Km/h")
        $("#cel").addClass('blue')
    })
    
        var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +"&lon=" + lon+ "&exclude=hourly,minutely&appid=" +apiKey;
         //ajax call for forecast and uv data.  
        $.ajax({
            url: forecastUrl,
            method: "GET"
            }).then(function (response) {
            
            //UV Index information.
            var uv = response.current.uvi;
            $("#results").append("<p>" + "UV Index: <button class='index'>" + Math.round(uv) + "</button>" +" <span></span></p>");
            if(uv <= 2){
                $(".index").addClass('green');
                $("span").text(" (Low)");
            } else if (uv > 2 && uv <= 5){
                $(".index").addClass('yellow'); 
                $("span").text(" (Moderate)");
            } else if (uv > 5  && uv <= 7){
                $(".index").addClass('orange'); 
                $("span").text(" (High)");
            } else if (uv > 7 && uv <= 10) {
                $(".index").addClass('red'); 
                $("span").text(" (Very high)");
            } else {
                $(".index").addClass('purple'); 
                $("span").text(" (Extreme)"); 
            }

            $("#forecast-info").text("5 Day Forecast:");
            //For loop to diplay the array of information in daily forecast.
            for (var i = 1; i < 6; i++) {
                forecastDate=  moment.utc(response.daily[i].dt * 1000).format(" MMM DD");  // format Unix date
                forecast = $("<div>")
                forecast.addClass("forecast-card card-body rounded-lg border-dark bg-info text-light")
                $("#forecast-results").prepend(forecast)
                
                forecast.append("<p>"+forecastDate +"</p>",
                                "<img src='http://openweathermap.org/img/w/" + response.daily[i].weather[0].icon + ".png' class='forecast-icon' alt=Current weather icon/>",
                                "<p>Temp: " + Math.round(response.daily[i].temp.day-273) + " °C</p>",
                                "<p>Temp: " + Math.round((response.daily[i].temp.night-273.15)*1.80 +32) + " °F</p>",
                                "<p>Hum: " + response.daily[i].humidity + "%</p",)
                
            }   
        })
    })
}

var citySearch = [];
//function to create button with the search results text/
function createBtn() {
    if ($("#city").val() != "") {
        var cityName = $("#city").val().toUpperCase();
       $("#delete-btn").removeClass("hide")
        // add searched city to city search array        
        citySearch.push(cityName);
        localStorage.setItem("citySearch", JSON.stringify(citySearch)); 
        $("#city").val("");  
        renderBtn();
    }
}

//function to render buttons.
function renderBtn() {
    $("#cities-view").text("");
    for (var i = 0; i < citySearch.length; i++) {
        var city = citySearch[i]

        var button =$("<button class='submit btn-dis'>");
        button.text(city)
        button.attr("data-index", i);

        $("#cities-view").prepend(button)
    } 
}

//Function to call api from cities in search history
function getHistory(){
    $(document).on("click", ".submit", function (event) {
        var buttonText = $(this).text();
        getWeather(buttonText);
    });
}
    
//function to list search history on page reload.
    function cityListHistory() {
    citySearch = localStorage.getItem("citySearch");
    citySearch = JSON.parse(citySearch);
    if (citySearch === null) {
        citySearch = [];
    }
    renderBtn();
        $("#delete-btn").removeClass("hide") 
};

//Function to clear all search history.
function clearHistoryAll(){
    $('#delete-btn').click(function(){
        $("#cities-view").empty();
        citySearch = [];
        localStorage.setItem("citySearch", JSON.stringify(citySearch)); 
        $("#delete-btn").addClass("hide");
        cityListHistory();
    })
}






