# BESOIN DE GERER LE CAS OU LA REQUETE NE RETOURNE PAS DE VALEUR --> CASSE ACTUELLEMENT LA TABLE

### Schéma RDF --> Nico
https://github.com/Rathachai/d3rdf/blob/master/README.md

### Bières sur une map (nombre de bières avec des ronds)
```
```

### Classification des bières par couleur, group by
```
```

### Nombre de bières d’une catégorie par pays d’origine, count
```
```

### Les plus gros producteurs de bières différentes, max
```
```

### Alcool moyen des bières par pays --> moy, group by
```
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
