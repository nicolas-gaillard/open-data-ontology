document.getElementById('test').onclick = function () {
    sendQuery()
};

function testQuery() {
    alert('Query');
}

function query() {
    var testQuery = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5';

    var url = "http://localhost:3030/open-beer/query";

    var params = "testQuery";
    var http = new XMLHttpRequest();

    http.open("GET", url + '?query=' + encodeURIComponent(testQuery) + '&format=json', true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            //JSONObject myObject = new JSONObject(http.responseText);
            console.log(http.responseText);
        }
    }
    http.send();
}

// url / query
var sendQuery = function () {
    var query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5';

    var url = "http://localhost:3030/open-beer/sparql";

    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        dataType: "json", //jsonp
        url: queryUrl,
        success: function (result) {
            // console.log("Done");
            console.log(result);
            // $("#divResult").html(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
}