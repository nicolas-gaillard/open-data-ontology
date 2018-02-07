document.getElementById('test').onclick = function () {
    sendQuery()
};

function buildJson() {};

function query() {
    var testQuery = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5';

    var url = "http://localhost:3030/open-beer/query";

    var params = testQuery;
    var http = new XMLHttpRequest();

    http.open("GET", url + '?query=' + encodeURIComponent(testQuery) + '&format=json', true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);

            test = JSON.parse(http.responseText);
            console.log(test)
        }
    }
    http.send();
}

// url / query
var sendQuery = function () {
    var query = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5';

    var url = 'http://localhost:3030/open-beer/sparql';

    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        dataType: 'jsonp', //jsonp
        url: queryUrl,
        // success: function (result) {
        //     console.log("Done");
        //     console.log(typeof result);
        //     console.log(typeof JSON.parse(result.results));
        //     console.log(JSON.parse(result.results));
        //     $("#divResult").html(result);
        //     test = JSON.parse(JSON.stringify(result.results))
        //     console.log(test);
        //     console.log(typeof test)
        // },
        success: function (data) {
            console.log(data)
            // console.log(typeof data.results.bindings)
            // console.log(data.results.bindings)

            // data.results.bindings.forEach(function (element) {
            //     console.log(element);
            // });

            // for (var k in data) {
            //     if (k === "head") {
            //         console.log(k, data[k]);
            //         for (var l in data[k]) {
            //             console.log(l);
            //             console.log(data[k][l][0]);
            //         }
            //     }
            // }

        },
        error: function (error) {
            console.log(error);
        }
    });
}