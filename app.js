/*
 *
 *
 *
 */
const sourceURL = "http://griffon.tk:3030/tp/sparql";
let countryToISO = {};
const mapRequest = `
PREFIX n1: <http://beer.beer/data#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT (SAMPLE(?country) AS ?NAME) (COUNT(?beer) as ?nbbeer)
WHERE {
  ?beer 		a 		n1:beer.
  ?brewer   n1:brew ?beer;
            n1:locate ?adress.
  ?adress	  n1:country ?country.
}
GROUP BY ?country`;

const topBrewerQuery = `
PREFIX n1: <http://beer.beer/data#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT (SAMPLE(?name) AS ?NAME) (COUNT(?beer) as ?nbbeer)
WHERE {
  ?beer		  a 		n1:beer.
  ?brewer   n1:brew ?beer;
            rdfs:label ?name;
            n1:locate ?adress.
}
GROUP BY ?name
ORDER BY DESC(?nbbeer)
LIMIT 10
`;

/*
 * Send query to server
 * @param {query} string - Sparql Query
 * @param {process} function - Function to apply when success 
 */
function applyQuery(query, callback) {
  let queryUrl =
    sourceURL + "?query=" + encodeURIComponent(query) + "&format=json";
  $.ajax({
    dataType: "jsonp",
    url: queryUrl,
    success: data => {
      callback(data);
    },
    error: err => {
      console.log("Error occured" + error);
    }
  });
}

/*
 * Compute dico to transform Country to ISO.
 */
function computeCountryToISO() {
  let countries = Datamap.prototype.worldTopo.objects.world.geometries;
  for (let country in countries) {
    countryToISO[countries[country].properties.name] =
      countries[country].properties.iso;
  }
}

/*
 * Process data to map
 * @param {map} object - Datamap Object
 * @param {data} JSON - Sparql query
 */
function mapProcess(map, data) {
  let arrayJSON = [];
  for (let rowIdx in data.results.bindings) {
    let jsonTemp = {};
    jsonTemp["name"] = data.results.bindings[rowIdx].NAME["value"];
    jsonTemp["country"] = data.results.bindings[rowIdx].NAME["value"];
    jsonTemp["centered"] =
      countryToISO[data.results.bindings[rowIdx].NAME["value"]];
    jsonTemp["radius"] =
      2 * Math.log(parseFloat(data.results.bindings[rowIdx].nbbeer["value"]));
    jsonTemp["fillKey"] = "RUS";
    arrayJSON.push(jsonTemp);
  }
  map.bubbles(arrayJSON, {
    popupTemplate: function(geo, data) {
      return (
        '<div class="hoverinfo">' +
        data.country +
        "</br>Nombre de bières:" +
        Math.exp(data.radius / 2) +
        ""
      );
    }
  });
}

/*
 * Add a div for top brewer
 * @param {window} div -- jQuery div
 * @param {number} int -- Number medal
 * @param {text} string -- Description medal
 */
function addBrewer(window, number, text) {
  let div =
    `
  <div class="stats_1">
    <div class="full-circle">
      <span class="text-medal">
        ` +
    String(number) +
    `
      </span>
    </div>
    <div class="full-text">
    ` +
    String(text) +
    `
    </div>
  </div>`;
  window.append(div);
}

function topBrewer(window, data) {
  for (let rowIdx in data.results.bindings) {
    addBrewer(
      window,
      data.results.bindings[rowIdx].nbbeer["value"],
      data.results.bindings[rowIdx].NAME["value"]
    );
  }
}

// ======================================= //

document.getElementById("test").onclick = function() {
  sendQuery();
};

document.getElementById("go").onclick = function() {
  const url = "http://griffon.tk:3030/tp/sparql";
  var prefix = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1:
    <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;
  let query = buildQuery();
  getSparqlData(prefix + query, url, "brewer");
};

function getBrewer(brewer) {
  const url = "http://griffon.tk:3030/tp/sparql";

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
  const query = `
    SELECT DISTINCT ?beer ?name ?alcohol_degree ?SRM ?style ?brewer
    WHERE { ?beer a n1:beer .
            ?beer rdfs:label ?name .
            ?beer n1:SRM ?SRM .
            ?beer n1:alc_vol ?alcohol_degree .
            ?beer n1:style ?style .
            ?brewer a n1:brewer .
    }
    LIMIT 20`;
  // var val = $('#alcohol').slider("option", "value");
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
        table.append(getTableRow(headerVars, bindings[rowIdx], cpt, button));
        cpt++;
      }
      if (button == "brewer") {
        $(".seeBrewer").click(function() {
          getBrewer($(this).val());
        });
      }
    },
    error: function(error) {
      console.log("Error occured" + error);
    }
  });
}

function getTableHeaders(headerVars) {
  let trHeaders = "<tr><th></th>";
  for (let i in headerVars) {
    trHeaders += "<th>" + headerVars[i] + "</th>";
  }
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

// When document is ready
$(function() {
  // ============ /\ TOP /\ ================= //

  applyQuery(topBrewerQuery, data => topBrewer($("#top_beer"), data));
  a = 0;
  //applyQuery(topBrewerQuery, data => (a = data));

  // ============ /\ MAP /\ ================= //

  // TODO : put this at the begining
  let basic = new Datamap({
    element: document.getElementById("chart_div"),
    geographyConfig: {
      popupOnHover: false,
      highlightOnHover: false
    },
    fills: {
      defaultFill: "#ABDDA4",
      RUS: "orange"
    }
  });

  computeCountryToISO();
  applyQuery(mapRequest, data => mapProcess(basic, data));

  //nico part

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
    slide: function(event, ui) {
      $("#alcohol").val("°" + ui.values[0] + " - °" + ui.values[1]);
    }
  });
  $("#alcohol").val(
    "°" +
      $("#slider-range-alc").slider("values", 0) +
      " - °" +
      $("#slider-range-alc").slider("values", 1)
  );

  $("#slider-range-ibu").slider({
    range: true,
    min: 0,
    max: 93,
    values: [0, 93],
    slide: function(event, ui) {
      $("#ibu").val(ui.values[0] + " - " + ui.values[1] + " IBT");
    }
  });
  $("#ibu").val(
    $("#slider-range-ibu").slider("values", 0) +
      " - " +
      $("#slider-range-ibu").slider("values", 1) +
      " IBT"
  );

  $("#slider-range-srm").slider({
    range: true,
    min: 0,
    max: 47,
    values: [0, 47],
    slide: function(event, ui) {
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

  const url = "http://griffon.tk:3030/tp/query";
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
let sendQuery = function() {
  let query =
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5";

  let url = "http://griffon.tk:3030/tp/sparql";

  let queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
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
};
