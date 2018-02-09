document.getElementById("test").onclick = function () {
  sendQuery();
};

document.getElementById("go").onclick = function () {
  const url = "http://localhost:3030/open-beer/sparql";
  var prefix = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1:
    <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;
  let query = buildQuery();
  getSparqlData(prefix + query, url, "brewer");
};

function getLimit() {
  const limit = document.getElementById('nb-results').value;
  return 'LIMIT ' + limit;
}

function getFilter(alc, srm) {
  const alcMin = $('#slider-range-alc').slider("values", "0");
  const alcMax = $('#slider-range-alc').slider("values", "1");
  const srmMin = $('#slider-range-srm').slider("values", "0");
  const srmMax = $('#slider-range-srm').slider("values", "1");

  filter = 'FILTER(' + alc + ' >= "' + alcMin + '"\^\^xsd:double)';
  filter += ' FILTER(' + alc + ' < "' + alcMax + '"\^\^xsd:double)';
  filter += ' FILTER(' + srm + ' >= "' + srmMin + '"\^\^xsd:double)';
  filter += ' FILTER(' + srm + ' < "' + srmMax + '"\^\^xsd:double)';

  console.log(filter);

  return filter;
}

function getBrewer(brewer) {
  const url = "http://localhost:3030/open-beer/sparql";

  let brewId = brewer.split("#")[1];
  let query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX n1: <http://beer.beer/data#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT DISTINCT ?brewer ?name ?website ?address
    WHERE { ?brewer a n1:brewer .
            ?brewer rdfs:label ?name .
        ?brewer n1:locate ?address .
        OPTIONAL { ?brewer  n1:website  ?website }
    FILTER (?brewer = n1:${brewId})
    }`;
  getSparqlData(query, url, "null");
}

function buildQuery() {
  const limit = getLimit();
  const filter = getFilter('?alcohol_degree', '?SRM');

  const query = `
    SELECT DISTINCT ?beer ?name ?alcohol_degree ?SRM ?style ?brewer
    WHERE { ?beer a n1:beer .
            ?beer rdfs:label ?name .
            ?beer n1:SRM ?SRM .
            ?beer n1:alc_vol ?alcohol_degree .
            ?beer n1:style ?style .
            ?brewer a n1:brewer .
            ${filter}
          }
    ${limit}`;
  return query;
}

function getSparqlData(query, url, button) {
  let table = $("#results");
  table.text(" ");

  let queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
  $.ajax({
    dataType: "jsonp",
    url: queryUrl,
    success: data => {
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
        table.append(getTableRow(headerVars, bindings[rowIdx], cpt, button));
        cpt++;
      }
      if (button == "brewer") {
        $(".seeBrewer").click(function () {
          getBrewer($(this).val());
        });
      }
    },
    error: function (error) {
      console.log("Error occured" + error);
    }
  });
}

function getTableHeaders(headerVars) {
  let trHeaders = "<tr><th></th>";
  for (let i in headerVars) {
    trHeaders += "<th>" + headerVars[i] + "</th>";
  }
  trHeaders += "<th>details</th>"
  trHeaders += "</tr>";
  return trHeaders;
}

function getTableRow(headerVars, rowData, cpt, button) {
  var tr = "<tr><td>" + cpt + "</td>";
  for (var i in headerVars) {
    tr += getTableCell(headerVars[i], rowData);
  }

  if (button == "brewer") {
    tr +=
      "<td><button value='" +
      rowData[headerVars[headerVars.length - 1]]["value"] +
      "' class='seeBrewer'>See brewer</button></td> </tr>";
    // } else if (button == address) {
    //     tr += "<td><button value='" + rowData[headerVars[0]]["value"] + "' class='seeMovieGenre'>Voir films</button></td> </tr>";
  } else {
    tr += "</tr>";
  }
  // tr += "</tr>";
  return tr;
}

function getTableCell(fieldName, rowData) {
  var td = "<td>";
  var fieldData = rowData[fieldName];
  if (fieldData == null) td += "";
  else if (fieldData["value"].indexOf("#") !== -1)
    td += fieldData["value"].split("#")[1];
  else td += fieldData["value"];
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
  $("#alcohol").val(
    "°" +
    $("#slider-range-alc").slider("values", 0) +
    " - °" +
    $("#slider-range-alc").slider("values", 1)
  );

  // $("#slider-range-ibu").slider({
  //   range: true,
  //   min: 0,
  //   max: 93,
  //   values: [0, 93],
  //   slide: function (event, ui) {
  //     $("#ibu").val(ui.values[0] + " - " + ui.values[1] + " IBT");
  //   }
  // });
  // $("#ibu").val(
  //   $("#slider-range-ibu").slider("values", 0) +
  //   " - " +
  //   $("#slider-range-ibu").slider("values", 1) +
  //   " IBT"
  // );

  $("#slider-range-srm").slider({
    range: true,
    min: 0,
    max: 50,
    values: [0, 47],
    slide: function (event, ui) {
      $("#srm").val(ui.values[0] + " - " + ui.values[1] + " SRM");
    }
  });
  $("#srm").val(
    $("#slider-range-srm").slider("values", 0) +
    " - " +
    $("#slider-range-srm").slider("values", 1) +
    " SRM"
  );
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
/*
 * function sendQuery(url, query) {
  var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
  $.ajax({
    dataType: "jsonp", //jsonp
    url: queryUrl,
    success: function(data) {
      console.log(data);
    },
    error: function(error) {
      console.log(error);
    }
  });
}
*/

/* function testQuery() {
  const testQuery =
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5";

  const url = "http://localhost:3030/open-beer/query";
  let http = new XMLHttpRequest();

  http.open(
    "GET",
    url + "?query=" + encodeURIComponent(testQuery) + "&format=json",
    true
  );
  http.onreadystatechange = () => {
    if (http.readyState == 4 && http.status == 200) {
      console.log(http.responseText);

      let test = JSON.parse(http.responseText);
      console.log(test);
    }
  };
  http.send();
}*/

// url / query
let sendQuery = function () {
  let query =
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5";

  let url = "http://localhost:3030/open-beer/sparql";

  let queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
  $.ajax({
    dataType: "jsonp", //jsonp
    url: queryUrl,

    success: function (data) {
      console.log(data);
    },
    error: function (error) {
      console.log(error);
    }
  });
};