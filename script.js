
//Function to get search query.
function search() {
    $("#search-btn").click(function(e){
         e.preventDefault();
         userInput = $("input").val().trim();
         getWeather(userInput);
     })
 }
 