document.getElementById('test').onclick = function () {
    query()
};

function testQuery() {
    alert('Query');
}

function query() {
    var testQuery = 'PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 WHERE { ?beer_1 a n1:beer . } LIMIT 5';

    var url = "http://localhost:3030/open-beer/query";

    var params = "testQuery";
    var http = new XMLHttpRequest();

    http.open("GET", url + '?query=' + encodeURIComponent(testQuery), true);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send();
}
