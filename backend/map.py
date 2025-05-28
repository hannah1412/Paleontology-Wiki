import requests
from flask import Blueprint, Response, jsonify, request
from cache import cache

# URL to make wikidata requests, using SQL queries
wikidata_sparsql = "https://query.wikidata.org/bigdata/namespace/wdq/sparql"

# Blueprint for this sub app
map_blueprint = Blueprint("map", __name__)


# Default request
@map_blueprint.route("/", methods=["GET"])
def map():
    return "MAP"


@map_blueprint.route("/countryfossils", methods=["GET"])
@cache.cached(timeout=600, query_string=True)
def countryData() -> Response:
    """
    API endpoint to query Wikidata for all fossils in a country.

    :returns:
        A JSON response with all fossils discovered in a country.
    """

    # Argument supplied to request is the Q id of the country
    country = request.args.get("country")

    # Only makes request if argument supplied
    if country:
        # Builds query to get fossils, subclasses of fossils and fossil taxons found in a discovery location in a specific country
        sparqlQuery = f"""SELECT DISTINCT ?fossil ?fossilLabel ?discoveryLocation ?discoveryLocationLabel  ?description
                            (MIN(DISTINCT ?coordinate ) AS ?coordinates) (MIN(DISTINCT ?img ) AS ?image) 
                            WHERE {{ 
                            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} 
                            {{    
                                SELECT DISTINCT ?fossil ?discoveryLocation ?coordinate ?description ?img WHERE {{ 
                                    {{ 
                                        ?fossil p:P31 ?subclassFossil;
                                        schema:description ?description. 
                                        ?subclassFossil (ps:P31/(wdt:P279*)) wd:Q40614. 
                                        ?fossil wdt:P189 ?discoveryLocation. # Location of discovery 
                                        ?discoveryLocation wdt:P17 wd:{country}. # Location of discovery has "Country" property  
                                        ?discoveryLocation wdt:P625 ?coordinate. #coordinate location
                                        OPTIONAL {{ ?fossil wdt:P18 ?img }} 
                                        FILTER(lang(?description) = "en") 
                                    }} 
                                        UNION 
                                    {{ 
                                        ?fossil p:P31 ?fossilTaxon;
                                        
                                        schema:description ?description.  
                                        ?fossilTaxon (ps:P31) wd:Q23038290. 
                                        ?fossil wdt:P189 ?discoveryLocation. # Location of discovery 
                                        ?discoveryLocation wdt:P17 wd:{country}. # Location of discovery has "Country" property 
                                        ?discoveryLocation wdt:P625 ?coordinate. #coordinate location
                                        OPTIONAL {{ ?fossil wdt:P18 ?img }} # Fossil image
                                        FILTER(lang(?description) = "en") 
                                    }} 
                                }} 
                            }} 
                        }} GROUP BY ?fossil ?fossilLabel ?discoveryLocation ?discoveryLocationLabel ?image ?description #Prevents duplicate records with different coordinates """

        # Builds parameters to make request to wikidata
        params = {"query": sparqlQuery, "format": "json"}

        # Sends request to wikidata to make the query
        wikidataResp = requests.get(wikidata_sparsql, params=params)

        if not wikidataResp:
            return Response("Failed to get wiki data response", status=400)

        # Extracts the query results from wiki data response
        results = wikidataResp.json().get("results").get("bindings")

        return jsonify(results)

    else:
        # No country argument supplied in request to api
        return Response("country argument empty", status=400)


@map_blueprint.route("/countries", methods=["GET"])
@cache.cached(timeout=600, query_string=True)
def countries() -> Response:
    """
    API endpoint to query Wikidata for all sovereign states (countries)

    :returns:
        A JSON response with all sovereign states in the world
    """

    # Builds query to get countries in the world
    sparqlQuery = """SELECT ?country ?countryPosition ?countryName ?flagImage
                     WHERE
                    {
                     ?country wdt:P31 wd:Q3624078;
                     wdt:P625 ?countryPosition;
                     wdt:P41 ?flagImage;
                     rdfs:label ?countryName;
                     FILTER(lang(?countryName) = "en")
                    }"""

    # Builds parameters to make request to wikidata
    params = {"query": sparqlQuery, "format": "json"}

    # Sends request to wikidata to make the query
    wikidataResp = requests.get(wikidata_sparsql, params=params)

    if not wikidataResp:
        return Response("Failed to get wiki data response", status=400)

    # Extracts the query results from wiki data response
    results = wikidataResp.json().get("results").get("bindings")

    # Sends the query results in json format
    return jsonify(results)


# Requests background information on a country
@map_blueprint.route("/countryinfo", methods=["GET"])
@cache.cached(timeout=600, query_string=True)
def countryInfo() -> Response:
    """
    API endpoint to query Wikidata for additional information about a country

    :returns:
        A JSON response with information about a country
    """

    # Argument supplied to request is the Q id of the country
    country = request.args.get("country")

    # Only makes request if argument supplied
    if country:
        # Builds query to get information about a country
        sparqlQuery = f"""SELECT ?description ?continentLabel ?capitalLabel ?population ?currencyLabel ?area ?coordinates ?flagImage  
                        WHERE {{ 
                                ?country wdt:P31 wd:Q6256; # Instance of "country" 
                                wdt:P17 wd:{country}; # "country" property
                                wdt:P30 ?continent; 
                                wdt:P36 ?capital; 
                                wdt:P1082 ?population;
                                wdt:P625 ?coordinates; 
                                wdt:P38 ?currency; 
                                wdt:P2046 ?area; 
                                wdt:P41 ?flagImage; 
                                SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
                                wd:{country} schema:description ?description. 
                                FILTER(lang(?description) = "en") 
                              }}
                                
                              
                                  """

        # Builds parameters to make request to wikidata
        params = {"query": sparqlQuery, "format": "json"}

        # Sends request to wikidata to make the query
        wikidataResp = requests.get(wikidata_sparsql, params=params)

        if not wikidataResp:
            return Response("Failed to get wiki data response", status=400)

        # Extracts the query results from wiki data response
        results = wikidataResp.json().get("results").get("bindings")

        return jsonify(results)

    else:
        # No country argument supplied in request to api
        return Response("country argument empty", status=400)


@map_blueprint.route("/locationinfo", methods=["GET"])
@cache.cached(timeout=600, query_string=True)
def locationInfo() -> Response:
    """
    API endpoint to query Wikidata for the descripiton of a discovery location

    :returns:
        A JSON response with the desciprition of a discovery location
    """

    # Argument supplied to request is the Q id of the location
    location = request.args.get("location")

    # Only makes request if argument supplied
    if location:
        # Builds query to get description of a location
        sparqlQuery = f"""SELECT ?description 
                        WHERE {{ 
                                wd:{location} schema:description ?description. 
                                FILTER(lang(?description) = "en")
                        }}  """

        # Builds parameters to make request to wikidata
        params = {"query": sparqlQuery, "format": "json"}

        # Sends request to wikidata to make the query
        wikidataResp = requests.get(wikidata_sparsql, params=params)

        if not wikidataResp:
            return Response("Failed to get wiki data response", status=400)

        # Extracts the query results from wiki data response
        results = wikidataResp.json().get("results").get("bindings")

        return jsonify(results)

    else:
        # No location argument supplied in request to api
        return Response("location argument empty", status=400)


@map_blueprint.route("/fossilLocation", methods=["GET"])
@cache.cached(timeout=600, query_string=True)
def fossilLocation() -> Response:
    """
    API endpoint to query Wikidata for the discovery locations of a fossil

    :returns:
        A JSON response with all the discovery locations of a fossil
    """

    # Argument supplied to request is the Q id of the fossil
    fossil = request.args.get("fossil")

    # Only makes request if argument supplied
    if fossil:
        # Builds query to get all locations a fossil was discovered
        sparqlQuery = f"""SELECT ?discoveryLocation ?country ?continent ?discoveryLocationLabel ?countryLabel ?continentLabel (MIN(DISTINCT ?coordinate ) AS ?coordinates)
                        WHERE{{
                            wd:{fossil} wdt:P189 ?discoveryLocation.
                            ?discoveryLocation wdt:P17 ?country.
                            ?discoveryLocation wdt:P625 ?coordinate.
                            ?country wdt:P30 ?continent
                            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
                        }} GROUP BY ?discoveryLocation ?country ?continent ?discoveryLocationLabel ?countryLabel ?continentLabel"""

        # Builds parameters to make request to wikidata
        params = {"query": sparqlQuery, "format": "json"}

        # Sends request to wikidata to make the query
        wikidataResp = requests.get(wikidata_sparsql, params=params)

        if not wikidataResp:
            return Response("Failed to get wiki data response", status=400)

        # Extracts the query results from wiki data response
        results = wikidataResp.json().get("results").get("bindings")

        return jsonify(results)

    else:
        # No location argument supplied in request to api
        return Response("location argument empty", status=400)


@map_blueprint.after_request
def allows_cross_origin_request(response):
    """
    Updates the headers of all responses to allow Cross Origin Requests

    :type response: Response
    :param response: Response being sent to frontend

    :returns:
    The original response with the updated heade
    """

    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
