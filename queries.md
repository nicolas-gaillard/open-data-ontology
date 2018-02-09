# BESOIN DE GERER LE CAS OU LA REQUETE NE RETOURNE PAS DE VALEUR --> CASSE ACTUELLEMENT LA TABLE

### Schéma RDF --> Nico
https://github.com/Rathachai/d3rdf/blob/master/README.md

### Bières sur une map (nombre de bières avec des ronds)
```
SELECT ?country ?style ?city ?gps ?state
  WHERE {
    ?beer 		a 		n1:beer;
				n1:style ?style.
  	?brewer   	n1:brew ?beer;
             	n1:locate ?adress.
  	?adress	n1:country ?country;
           	n1:city		?city;
            n1:gps		?gps;
            n1:state	?state.
  }
```
### Bière par pays pazr style
```
 PREFIX n1: <http://beer.beer/data#>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT ?country ?style
  WHERE {
    ?beer 		a 		n1:beer;
				n1:style ?style.
  	?brewer   	n1:brew ?beer;
             	n1:locate ?adress.
  	?adress	n1:country ?country.
  }

```
### Classification des bières par couleur, group by

Cette requete pour récupérer les couleurs différentes.
```sparql
PREFIX n1: <http://beer.beer/data#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT ?color
WHERE {
  ?beer		a 		n1:beer;
          n1:SRM	?color;
          rdfs:label ?name .
}
GROUP BY ?color
```

On affiche les couleurs disponibles, lors du clique sur une des couleurs,
   on affiche alors les bières de cette couleur.

   TODO: ajouter le nombre de bières par couleur. (COUNT)

### Nombre de bières d’une catégorie par pays d’origine, count
TODO: rajouter une categorie.
   ```sparql
 PREFIX n1: <http://beer.beer/data#>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT (SAMPLE(?country) AS ?NAME) (COUNT(?beer) as ?nbbeer)
  WHERE {
    ?beer 		a 		n1:beer.
    ?brewer   n1:brew ?beer;
              n1:locate ?adress.
     ?adress	n1:country ?country.
  }
GROUP BY ?country
```

### Les plus gros producteurs de bières différentes, max
```
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
```

### Alcool moyen des bières par pays --> moy, group by
```
 PREFIX n1: <http://beer.beer/data#>
 PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>


SELECT (SAMPLE(?country) AS ?NAME) (AVG(?vol) as ?alcvol)
  WHERE {
    ?beer 		a 		n1:beer;
            	n1:alc_vol	?vol.
    ?brewer   	n1:brew ?beer;
              	n1:locate ?adress.
     ?adress	n1:country ?country.
  }
GROUP BY ?country
ORDER BY DESC(?alcvol)
```

### Formulaire pour faire des query plus poussées sur les bières --> Format web
  - Style --> to much values
  - Category --> done
  - Brewer --> partially done
  - Alcohol by volume (slider) --> done
  - International Bitterness Units (slider) --> done
  - Standard Reference method (slider) --> done
  - Country --> done
  - 'Go' button --> done
  ```
  ```

### Quelques statistiques


#### Bière la plus forte
  ```
PREFIX n1: <http://beer.beer/data#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT (MAX(?alc_vol_43) AS ?maximum_94)
  WHERE { ?beer_22 a n1:beer .
    ?beer_22 rdfs:label ?name .
      ?beer_22 n1:alc_vol ?alc_vol_43 . }
      ```

#### Les 20 bières les plus fortes
      ```
      PREFIX n1: <http://beer.beer/data#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT DISTINCT ?beer_66 ?alc_vol_87 ?name
      WHERE { ?beer_66 a n1:beer .
        ?beer_66 rdfs:label ?name.
          ?beer_66 n1:alc_vol ?alc_vol_87 . }
ORDER BY DESC(?alc_vol_87)
  LIMIT 20
  ```

#### Les 20 bières les moins fortes
  ```
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX n1: <http://beer.beer/data#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT DISTINCT ?beer_216 ?alc_vol_237 ?name
  WHERE { ?beer_216 a n1:beer .
    ?beer_216 rdfs:label ?name .
      ?beer_216 n1:alc_vol ?alc_vol_237 .
      FILTER (?alc_vol_237 > "0.0"^^xsd:double) }
ORDER BY ASC(?alc_vol_237)
  LIMIT 20
  ```

#### Test query
  ```
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  SELECT DISTINCT ?brewer ?name ?website ?brew ?address 
  WHERE { ?brewer a n1:brewer .
    ?brewer rdfs:label ?name .
      ?b a n1:beer .
      ?b rdfs:label ?brew.
      ?brewer n1:locate ?address .
      OPTIONAL { ?brewer  n1:websute  ?website }
  }
LIMIT 20
```

```
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX n1: <http://beer.beer/data#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT DISTINCT ?brewer ?name ?website ?address 
WHERE { ?brewer a n1:brewer .
  ?brewer rdfs:label ?name .
    ?brewer n1:locate ?address .
    OPTIONAL { ?brewer  n1:website  ?website }
}
LIMIT 200
```
