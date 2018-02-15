// document.getElementById("test").onclick = function () {
//   sendQuery();
// };

document.getElementById("go").onclick = function () {
  const url = "http://localhost:3030/open-beer/sparql";
/*
 *
 *
 *
 */
const sourceURL = "http://fuseki.prod.griffon.one/tp/sparql";
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

const beerCategory = `
PREFIX n1: <http://beer.beer/data#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT (SAMPLE(?category) AS ?NAME) (COUNT(?beer) as ?cbeer)
  WHERE {
    ?beer 		a 		n1:beer;
              n1:style	?category.
    ?brewer		n1:brew		?beer;
              n1:locate	?adress.
    ?adress		n1:country	?country.
  FILTER(?country = "United States").
  }
GROUP BY ?category
ORDER BY DESC(?cbeer)
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
      console.log("Error occured" + err);
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

function generateCategorySerie(variable, data) {
  let arraySerie = [];
  for (let rowIdx in data.results.bindings) {
    let value = parseInt(data.results.bindings[rowIdx].cbeer["value"]);
    if (value >= 20) {
      arraySerie.push([
        data.results.bindings[rowIdx].NAME["value"].substring(28),
        value
      ]);
    }
  }
  addBarChart(arraySerie);
}

function addBarChart(arraySerie) {
  console.log(arraySerie);
  Highcharts.chart("usa_beer_category", {
    chart: {
      type: "column"
    },
    title: {
      text: "Bière par catégorie"
    },
    subtitle: {
      text: "États-Unis d'Amérique"
    },
    xAxis: {
      type: "category",
      labels: {
        rotation: -45,
        style: {
          fontSize: "13px",
          fontFamily: "Verdana, sans-serif"
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Nombre de bières"
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: "Nombre de bières: <b>{point.y:.1f}</b>"
    },
    series: [
      {
        name: "Population",
        data: arraySerie,
        dataLabels: {
          enabled: true,
          rotation: -90,
          color: "#FFFFFF",
          align: "right",
          format: "{point.y:.1f}", // one decimal
          y: 10, // 10 pixels down from the top
          style: {
            fontSize: "13px",
            fontFamily: "Verdana, sans-serif"
          }
        }
      }
    ]
  });
}
// ======================================= //
// Hum, @nico, c'est pas bô ! :p
//
document.getElementById("test").onclick = function() {
  sendQuery();
};

document.getElementById("go").onclick = function() {
  const url = "http://fuseki.prod.griffon.one/tp/sparql";

  
  var prefix = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1:
    <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`;
  let query = buildQuery();
  getSparqlData(prefix + query, url, "brewer");
};

function getLimit() {
  const limit = document.getElementById('nb-results').value;
  return 'LIMIT ' + limit;
}

function getFilter(alc, srm, q_country, q_category, q_brewer) {
  const alcMin   = $('#slider-range-alc').slider("values", "0");
  const alcMax   = $('#slider-range-alc').slider("values", "1");
  const srmMin   = $('#slider-range-srm').slider("values", "0");
  const srmMax   = $('#slider-range-srm').slider("values", "1");
  const category = $("#category").val();
  const brewer   = $("#brewers").val();
  const country  = $("#country").val();

  filter = 'FILTER(' + alc + ' >= "' + alcMin + '"\^\^xsd:double)';
  filter += '\nFILTER(' + alc + ' < "' + alcMax + '"\^\^xsd:double)';
  filter += '\nFILTER(' + srm + ' >= "' + srmMin + '"\^\^xsd:double)';
  filter += '\nFILTER(' + srm + ' < "' + srmMax + '"\^\^xsd:double)';

  if (category.length != 0) {
    filter += '\nFILTER(' + q_category + ' = ' + category + ')';
  }

  if (brewer.length != 0) {
    filter += '\nFILTER(' + q_brewer + ' = "' + brewer + '")';
  }

  if (country.length != 0) {
    filter += '\nFILTER(' + q_country + ' = "' + country + '")';
  }

  console.log(filter);

  return filter;
}

// Query when you click on 'See address'
// -------------------------------------
function getBrewerAddress(address) {
  const url = "http://localhost:3030/open-beer/sparql";

  let addressId = address.split("#")[1];

  let query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX n1: <http://beer.beer/data#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT DISTINCT ?address ?city ?state ?country ?gps
    WHERE {
      ?address a n1:address ;
              n1:city ?city ;
              n1:state ?state ;
              n1:country ?country ;
              n1:gps ?gps.
      OPTIONAL { ?address  n1:gps  ?gps }
      FILTER (?address = n1:${addressId})
    }`;

  // console.log(query);

  getSparqlData(query, url, 'null');
}

// Query when you click on 'See brewer'
// ------------------------------------
function getBrewer(brewer) {
  const url = "http://fuseki.prod.griffon.one/tp/sparql";

  let brewId = brewer.split("#")[1];
  let query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX n1: <http://beer.beer/data#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT DISTINCT ?brewer ?name ?website ?address
    WHERE {
        ?brewer a n1:brewer .
        ?brewer rdfs:label ?name .
        ?brewer n1:locate ?address .
        OPTIONAL { ?brewer  n1:website  ?website }
        FILTER (?brewer = n1:${brewId})
    }`;
  getSparqlData(query, url, "address");
}

function buildQuery() {
  const limit = getLimit();
  const filter = getFilter('?alcohol_degree', '?SRM', '?country', '?category', '?brewer_name');

  const query = `
  SELECT DISTINCT ?beer ?name ?alcohol_degree ?SRM ?style ?brewer
  WHERE {
    ?beer a n1:beer .
    ?beer rdfs:label ?name .
    ?beer n1:SRM ?SRM .
    ?beer n1:alc_vol ?alcohol_degree .
    ?beer n1:style ?style .

    ?brewer a n1:brewer .
    ?brewer n1:brew ?beer .
    ?brewer rdfs:label ?brewer_name .

    ?brewer n1:locate ?address .
    ?address a n1:address .
    ?address n1:country ?country .

    ?category a n1:category.
    ?style rdfs:subClassOf ?category .
    ${filter}
  }
  ${limit}`;

  return query;
}

// Set of functions which build the table
// --------------------------------------
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
      var trHeaders = getTableHeaders(headerVars, button);
      table.append(trHeaders);
      // grab the actual results from the data.
      var bindings = data.results.bindings;
      let cpt = 1;
      // for each result, make a table row and add it to the table.
      for (let rowIdx in bindings) {
        table.append(getTableRow(headerVars, bindings[rowIdx], cpt, button));
        cpt++;
      }
      if (button == "brewer") {
        $(".seeBrewer").click(function () {
          getBrewer($(this).val());
        });
      }
      if (button == "address") {
        $(".seeAddress").click(function () {
          getBrewerAddress($(this).val());
        });
      }
    },
    error: function (error) {
      console.log("Error occured" + error);
    }
  });
}

function getTableHeaders(headerVars, button) {
  let trHeaders = "<tr><th></th>";
  for (let i in headerVars) {
    trHeaders += "<th>" + headerVars[i] + "</th>";
  }
  if (button != 'null') {
    trHeaders += "<th>details</th>"
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

  } else if (button == 'address') {
    tr += "<td><button value='" +
    rowData[headerVars[headerVars.length - 1]]["value"] +
    "' class='seeAddress'>See address</button></td> </tr>";
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

// Send a query and get result with callback
// -----------------------------------------
let sendQuery = function (query, callback) {
  let url = "http://localhost:3030/open-beer/sparql";

  let queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
  $.ajax({
    dataType: "jsonp", //jsonp
    url: queryUrl,

    success: function (data) {
      callback(null, data);
    },
    error: function (error) {
      callback(error, null);
    }
  });
};

// Dynamically create input's option
// ---------------------------------
function buildCategorySelect() {
  const query = `
    PREFIX n1: <http://beer.beer/data#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?category
    WHERE {
      ?beer a n1:beer ;
            n1:style ?style .
      ?category a n1:category.
      ?style rdfs:subClassOf ?category .
    }`;

  // FILTER (?category = n1:category_north_american_ale)

  const data = sendQuery(query, function (err, data) {
    if (err) {
      console.error(err);
    }
   // console.log(data);

    const select = $("#category");

    //  FILTER (?category = n1:category_north_american_ale)
    const bindings = data.results.bindings;

    for (row in bindings) {
      const category = bindings[row].category.value.split("#")[1];
      // console.log('n1:' + category)
      // console.log(category.split('category_')[1].replace(/_/g, ' '));

      select.append($("<option/>").attr("value", 'n1:' + category).text(category.split('category_')[1].replace(/_/g, ' ')));
    }
  });
}

function buildBrewerSelect() {
  const query = `
  PREFIX n1: <http://beer.beer/data#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT DISTINCT ?name
  WHERE {
    ?brewer	a n1:brewer;
            rdfs:label ?name.
  }`

  const data = sendQuery(query, function (err, data) {
    if (err) {
      console.error(err);
    }
    //console.log(data);

    const select = $("#brewers");
    const bindings = data.results.bindings;

    for (row in bindings) {
      select.append($("<option/>").attr("value", bindings[row].name.value).text(bindings[row].name.value));
    }
  });
}

function buildCountrySelect() {
  const query = `
    PREFIX n1: <http://beer.beer/data#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?pays
    WHERE {
      ?beer		a 		n1:beer.
      ?brewer	n1:brew ?beer;
            n1:locate ?adress.
      ?adress	n1:country ?pays.
    }`;

  const data = sendQuery(query, function (err, data) {
    if (err) {
      console.error(err);
    }
    //console.log(data);

    const select = $("#country");
    const bindings = data.results.bindings;

    for (row in bindings) {
      select.append($("<option/>").attr("value", bindings[row].pays.value).text(bindings[row].pays.value));
      // console.log(bindings[row].pays.value);
    }
  });
}

// JQuery
// ------
$(function () {

  buildCountrySelect();
  buildBrewerSelect();
  buildCategorySelect()

  computeCountryToISO();
  // ============ /\ BAR /\ ================= //
  let customSerie = [];
  applyQuery(beerCategory, data => generateCategorySerie(customSerie, data));
  // ============ /\ TOP /\ ================= //

  applyQuery(topBrewerQuery, data => topBrewer($("#top_beer"), data));

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
    max: 40,
    values: [0, 40],
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
    values: [0, 50],
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

// url / query
let sendQuery = function() {
  let query =
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> SELECT DISTINCT ?beer_1 ?label_22 WHERE { ?beer_1 a n1:beer . ?beer_1 rdfs:label ?label_22 . } LIMIT 5";

  let url = "http://fuseki.prod.griffon.one/tp/sparql";

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