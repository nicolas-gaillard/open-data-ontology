document.getElementById('test').onclick = function () {
    sendQuery()
};

document.getElementById("go").onclick = function () {
    var url = 'http://localhost:3030/open-beer/sparql';
    var prefix = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'
    query = buildQuery();

    // console.log(query);
    getSparqlData(prefix + query, url)
};

function buildQuery() {
    query = `
    SELECT DISTINCT ?beer ?name ?alc ?srm ?style ?b_name
    WHERE { ?beer a n1:beer .
            ?beer rdfs:label ?name .
            ?beer n1:SRM ?srm .
            ?beer n1:alc_vol ?alc .
            ?beer n1:style ?style .
            ?brewer a n1:brewer .
            ?brewer rdfs:label ?b_name .
    }
    LIMIT 20`;
    // var val = $('#alcohol').slider("option", "value");
    return query;
}

function getSparqlData(query, url) {
    var table = $("#results");
    table.text(" ");

    console.log(query);
    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";

    $.ajax({
        dataType: "jsonp",
        url: queryUrl,
        success: function (data) {

            console.log(data);

            // get the table element
            var table = $("#results");
            table.text();

            // get the sparql variables from the 'head' of the data.
            var headerVars = data.head.vars;

            // using the vars, make some table headers and add them to the table;
            var trHeaders = getTableHeaders(headerVars);
            table.append(trHeaders);

            // grab the actual results from the data.
            var bindings = data.results.bindings;

            cpt = 1;
            // for each result, make a table row and add it to the table.
            for (rowIdx in bindings) {
                table.append(getTableRow(headerVars, bindings[rowIdx], cpt));
                cpt++;
            }
        },
        error: function (error) {
            console.log("Error occured" + error);
        }
    });
};

function getTableHeaders(headerVars) {
    var trHeaders = "<tr><th></th>";
    for (var i in headerVars) {
        trHeaders += "<th>" + headerVars[i] + "</th>";
    }
    trHeaders += "</tr>";
    return trHeaders;
}

function getTableRow(headerVars, rowData, cpt) {
    var tr = "<tr><td>" + cpt + "</td>";
    for (var i in headerVars) {
        tr += getTableCell(headerVars[i], rowData);
    }

    // if (button == brewer) {
    //     tr += "<td><button value='" + rowData[headerVars[headerVars.length - 1]]["value"] + "' class='seeBrewer'>See brewer</button></td> </tr>";
    // } else if (button == address) {
    //     tr += "<td><button value='" + rowData[headerVars[0]]["value"] + "' class='seeMovieGenre'>Voir films</button></td> </tr>";
    // } else {
    //     tr += "</tr>";
    // }
    tr += "</tr>";
    return tr;
}

function getTableCell(fieldName, rowData) {
    var td = "<td>";
    var fieldData = rowData[fieldName];
    td += fieldData["value"];
    td += "</td>";
    return td;
}

// JQuery
// ------

$(function () {
    $("#country").selectmenu();

    $("#brewers").selectmenu();

    $("#category").selectmenu();
    // .selectmenu("menuWidget")
    // .addClass("overflow");

    $("#slider-range-alc").slider({
        range: true,
        min: 0,
        max: 100,
        values: [0, 100],
        slide: function (event, ui) {
            $("#alcohol").val("°" + ui.values[0] + " - °" + ui.values[1]);
        }
    });
    $("#alcohol").val("°" + $("#slider-range-alc").slider("values", 0) +
        " - °" + $("#slider-range-alc").slider("values", 1));

    $("#slider-range-ibu").slider({
        range: true,
        min: 0,
        max: 93,
        values: [0, 93],
        slide: function (event, ui) {
            $("#ibu").val(ui.values[0] + " - " + ui.values[1] + " IBT");
        }
    });
    $("#ibu").val($("#slider-range-ibu").slider("values", 0) +
        " - " + $("#slider-range-ibu").slider("values", 1) + " IBT");

    $("#slider-range-srm").slider({
        range: true,
        min: 0,
        max: 47,
        values: [0, 47],
        slide: function (event, ui) {
            $("#srm").val(ui.values[0] + " - " + ui.values[1] + " SRM");
        }
    });
    $("#srm").val($("#slider-range-srm").slider("values", 0) +
        " - " + $("#slider-range-srm").slider("values", 1) + " SRM");
});

// -----------------------------------------------------------------------------
function sendQuery(url, query) {
    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        dataType: 'jsonp', //jsonp
        url: queryUrl,
        success: function (data) {
            console.log(data)
        },
        error: function (error) {
            console.log(error);
        }
    });
}

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

        success: function (data) {
            console.log(data)
        },
        error: function (error) {
            console.log(error);
        }
    });
}