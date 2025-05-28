import requests
from typing import List, Optional
import re
from flask import Blueprint, Response, jsonify, request
import numpy as np
from numpy import datetime64, timedelta64
import json

import threading
import time
import datetime
from functools import cache
import sys

timeline_blueprint = Blueprint("timeline", __name__)

# URL endpoint for querying Wikidata using SPARQL
sparql_endpoint = "https://query.wikidata.org/sparql"

# URL endpoint for querying Wikimedia's page view API
pageview_endpoint = "https://wikimedia.org/api/rest_v1/metrics/pageviews/"
pageview_url = (
    pageview_endpoint
    + "per-article/en.wikipedia/all-access/all-agents/{}/daily/{}0101/{}1230"
)

USER_AGENT = "University of St Andrews CS Paleontology Project"

cached_instances = ["Q23038290"]
# Set the Max Rank for normalising popularity rank in the ranking function.
MAX_RANK = 10000000

try:
    with open("wikidata_cache.json", "r") as file:
        wikidata_cache = json.load(file)
except:
    wikidata_cache = {}
try:
    with open("wikipedia_views_cache.json", "r") as file:
        wikipedia_views_cache = json.load(file)
except:
    wikipedia_views_cache = {}

missing_cache = {}


def get_wikidata_query_results(query: str) -> dict:
    """Executes and retrieves the results of a given Wikidata query.

    Args:
        query: The query string

    Returns:
        A dictionary containing the data of the entries returned, if anything was returned, otherwise
        None
    """
    params = {"query": query, "format": "json"}
    result = requests.get(sparql_endpoint, params=params)

    if result:
        result_json = result.json()
    else:
        return None

    if result_json["results"]["bindings"]:
        return result_json
    else:
        return None


def get_entries_in_time_period(
    instance_of: str, start_time: str, end_time: str
) -> dict:
    """Retrieves entries of a given instance within the provided time range.

    Args:
        instance_of: The identifier of the data item of which the entry must be an instance of,
         eg. Q23038290 for "fossil taxon"
        start_time: The start time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-100000000-01-01T00:00:00Z"
        end_time: The end time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-50000000-01-01T00:00:00Z"

    Returns:
        A dictionary containing the data of the entries returned, if anything was returned, otherwise
        None
    """
    # Construct query
    query = f"""SELECT ?id ?label ?startTime ?endTime ?rankLabel (SAMPLE(?parentLabel) as ?firstParentLabel) (SAMPLE(?imgURL) as ?firstImgURL)
                WHERE {{ 
                    ?item wdt:P31 wd:{instance_of} ;
                        rdfs:label ?label ;
                        wdt:P580 ?startTime .
                    OPTIONAL {{
                        ?item wdt:P105 ?rank .
                        ?rank rdfs:label ?rankLabel .
                        FILTER(lang(?rankLabel) = "en")
                    }} .
                    OPTIONAL {{
                        ?item wdt:P171 ?parent .
                        ?parent rdfs:label ?parentLabel .
                        FILTER(lang(?parentLabel) = "en")
                    }} .  
                    OPTIONAL {{?item wdt:P582 ?endTime}} .
                    OPTIONAL {{?item wdt:P18 ?imgURL}} .
                FILTER(lang(?label) = "en")
                FILTER(?startTime < "{end_time}"^^xsd:dateTime && (!bound(?endTime) || ?endTime > "{start_time}"^^xsd:dateTime)) 
                BIND(STRAFTER(STR(?item), STR(wd:)) AS ?id)
                }} GROUP BY ?id ?label ?startTime ?endTime ?rankLabel"""

    # Execute and return results of query
    return get_wikidata_query_results(query)


def get_identifier_data(identifier: str) -> dict:
    """Retrieves time range data of a Wikidata instance with a given identifier.

    Args:
        identifier: The identifier of the instance, eg. Q14332 for "Tyrannosaurus"

    Returns:
        A dictionary containing the data of the instance, if it exists, otherwise None
    """
    # Construct query
    query = f"""SELECT ?label ?startTime ?endTime (SAMPLE(?imgURL) as ?firstImgURL)
                WHERE {{ 
                    BIND(wd:{identifier} as ?item)
                    ?item rdfs:label ?label ;
                        wdt:P580 ?startTime .
                    OPTIONAL {{?item wdt:P582 ?endTime}} .
                    OPTIONAL {{?item wdt:P18 ?imgURL}} .
                FILTER(lang(?label) = "en")
                }} GROUP BY ?label ?startTime ?endTime"""

    # Execute and return results of query
    return get_wikidata_query_results(query)


def get_start_time_diff_for_entry(start_time: str, entry: dict) -> datetime64:
    """Gets the difference in time between a given time and an entry's start time.

    Args:
        start_time: The given time, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-100000000-01-01T00:00:00Z"
        entry: A dictionary containing the data of the entry, which must include a "start_time"
         key

    Returns:
        The difference in time
    """
    # Get the start time of the entry.
    entry_start_time = entry["startTime"]
    # Calculate the time difference between the start times.
    start_time_diff = abs(datetime64(start_time) - datetime64(entry_start_time))

    return start_time_diff


def split_time_range(start_time: str, end_time: str, n: int) -> datetime64:
    """Splits a time range into n parts.

    Args:
        start_time: The start time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-100000000-01-01T00:00:00Z"
        end_time: The end time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-50000000-01-01T00:00:00Z"
        n: The number of parts to split the time range into

    Returns:
        A List of datetime64 objects representing the start times of each part
    """
    time_range_duration = datetime64(end_time) - datetime64(start_time)
    time_part_interval = time_range_duration / n
    result = []

    for i in range(n):
        time_part = datetime64(start_time) + (i * time_part_interval)
        result.append(time_part)

    return result

def format_data(data, rank=None, instance_of:str = 'unknown', include_id:bool = True) -> List[dict]:
    """Cleans the data fetched by sparql query.

    Args:
        data: the raw data that need to be formatted.
        rank: the rank of the taxons that will be returned. If set to None,
         all taxons will be returned.
        instance_of: the identifier of the data item of which the entries in the data are an instance of,
         eg. Q23038290 for "fossil taxon"
        include_id: whether the data being passed in includes each entry's
         Wikidata Q-identifier

    Returns:
        A list of dictionary objects representing the formatted data.
    """
    # Maps a taxon's labels to its data for easy retrieval based on label
    labels_to_taxon_data = {}


    # Store results that will be returned
    results = []
    missing = []

    # First pass 
    for i in data['results']['bindings']:
        has_missing = False
        element = {}

        label = i["label"]["value"]

        if include_id:
            element["id"] = i["id"]["value"]

        element["label"] = label
        element["startTime"] = i["startTime"]["value"]


        # Handle issues of missing rank label, parent label, endtime and image URL
        if 'rankLabel' in i:
            element['rankLabel'] = i['rankLabel']['value'] 
        else:
            element["rankLabel"] = None
        rankLabel = element["rankLabel"]

        if "firstParentLabel" in i:
            element["firstParentLabel"] = i["firstParentLabel"]["value"]
        else:
            element["firstParentLabel"] = None
        firstParentLabel = element["firstParentLabel"]

        if "endTime" in i:
            element["endTime"] = i["endTime"]["value"]
        else:
            element['endTime'] = None
            has_missing = True

        if "firstImgURL" in i:
            element["imgURL"] = i["firstImgURL"]["value"]
        else:
            element['imgURL'] = None
            has_missing = True

        if instance_of not in missing_cache:
            missing_cache[instance_of] = []
        missing_cache[instance_of].append(element)
        
        # If element has no rank, return in result anyway since there's a chance
        # it's of the requested rank
        if not rank or ('rankLabel' in element and element['rankLabel'] == rank) or 'rankLabel' not in element:
            if has_missing:
                missing.append(element)
            else:
                results.append(element)
    for i in missing:       
        results.append(i)
    return results


# todo write test
def fix_missing(n:int = 100):
    """
    Function which runs in an independent thread; fixes missing
    entries in the cache.
    Args:
        n: seconds between running routine
           n = 0 runs once and returns 0
    Returns:
        none    if n != 0(should never return for n != 0)
        0       if n = 0
    """
    while True:
        time.sleep(n)
        print("TIMELINE BACKEND fix_missing: Start")
        for instance_of in missing_cache:
            for entry in missing_cache[instance_of]:
                label = entry["label"]
                rankLabel = entry["rankLabel"]
                firstParentLabel = entry["firstParentLabel"]

                if entry['endTime'] is None or entry['imgURL'] is None:
                    # If we have data on the taxon's parent/ancestor, use it to get missing values
                    for i in missing_cache[instance_of]:
                        if i['label'] == firstParentLabel:
                            # Only search for ancestor's value if still missing
                            if entry["endTime"] is None and "endTime" in i:
                                entry["endTime"] = i["endTime"]
                            if entry["imgURL"] is None and "imgURL" in i:
                                entry["imgURL"] = i["imgURL"]
                for i in range(len(wikidata_cache[instance_of])):
                    if wikidata_cache[instance_of][i]["label"] == label:
                        wikidata_cache[instance_of][i] = entry

        print("TIMELINE BACKEND fix_missing: End")
        if n == 0:
            return 0

def ranking(start_time: str, end_time: str, n: int, data: List[dict], reverse_popularity:bool = False, popularity_weight: float = 0.5) -> List[dict]:
    """Function that goes through data on taxons, evenly divides the given time range into n points, and for each 
    finds the best match based on the taxon's popularity and the proximity of its start time to the time corresponding to the
    point.

    Args:
        start_time: The start time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-100000000-01-01T00:00:00Z"
        end_time: The end time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-50000000-01-01T00:00:00Z"
        n: The number of parts to split the time range into
        data: A List of dictionary objects containing the data on taxons
        reverse_popularity: If the popularity rank is reversed (return the least popular entry within a time range) or not 
        popularity_weight: The weight assigned to popularity in the ranking (default is 0.5).

    Returns:
        A list of dictionary objects representing the entries that are most popular or least popular within a given range.
    """
    # Result list containing entries.
    result = []

    # Calculate the whole time range for later calculation.
    time_range = datetime64(end_time) - datetime64(start_time)

    # Divides the time period into n points and gets the start time of each point
    time_points = split_time_range(start_time, end_time, n)
    
    # Loop through all the time points.
    for point in time_points:
        # The best popularity rank so far for this time point; for non-reversed condition
        max_popularity_rank = 0

        # Set the best entry as the first entry in the data set as default, updated later.
        best_entry = data[0]
        # Loop through each entry in the data set.
        for entry in data:
            # Calculate the time difference between the time point and the start time of a species.
            temp_diff = get_start_time_diff_for_entry(point, entry)

            # Get the popularity rank.
            popularity_rank = get_wikipedia_rank(entry)

            # Normalize the time difference so it can be used for calculation.
            normalized_time_diff = 1 - abs(temp_diff / time_range)

            # Normalize the popularity rank to be in a comparable scale to time difference.
            normalized_popularity_rank = 1 / popularity_rank 

            # Condition that returns the least popular entries.
            if reverse_popularity:
                # Combine time difference and popularity with the specified weighting; for reverse popularity, popularity
                # has a negative effect on the rank, so more popular items have a worse rank
                combined_rank = ((1 - popularity_weight) * normalized_time_diff) - (popularity_weight * normalized_popularity_rank)
            # Condition that returns the most popular entries.
            else:
                # Combine time difference and popularity with the specified weighting.
                combined_rank = ((1 - popularity_weight) * normalized_time_diff) + (popularity_weight * normalized_popularity_rank)

            # Get the entry with the largest combined rank for current time point.
            if combined_rank > max_popularity_rank:
                # Update the best entry.
                best_entry = entry
                # Update the max popularity rank for further comparison.
                max_popularity_rank = combined_rank

        # Add the best entry into the result list.    
        result.append(best_entry)
    
        # Remove the entry from the data to avoid returning duplicates.
        data.remove(best_entry)

    return result


def validate_request_time_range(request_args):
    """Validates a request by time range by checking it has the required parameters and the
    parameters match the required format.

    Args:
        request_args: The request arguments

    Returns:
        If the request is valid, a tuple containing True as the first item and
        request parameters as the remaining items; else, a tuple containing
        False as the first item and an error message as the second item
    """
    # Check request has required parameters
    start_time = request_args.get("startTime")
    if start_time is None:
        return False, "ERROR: MISSING DATA: startTime"

    end_time = request_args.get("endTime")
    if end_time is None:
        return False, "ERROR: MISSING DATA: endTime"

    rank = request_args.get("rank")
    if rank == "none" or rank is None:
        rank = None

    n = request_args.get("n")
    if n is None:
        return False, "ERROR: MISSING DATA: n"
    
    reverse_popularity = request_args.get("reversePopularity")
    if reverse_popularity is None:
        reverse_popularity = None

    # Validate type of n
    try:
        n = int(n)
    except ValueError:
        return False, "ERROR: n NOT AN INTEGER"

    if n < 1:
        return False, "ERROR: n MUST BE AT LEAST 1"

    # Validate reverse_popularity value
    if reverse_popularity == "false" or reverse_popularity is None:
        reverse_popularity = False
    elif reverse_popularity == "true":
        reverse_popularity = True
    else:
        return False, "ERROR: reverse_popularity NOT A BOOLEAN"

    # Validate format of parameters
    iso_regex = re.compile("[-+][0-9]+-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z")

    if not iso_regex.match(start_time):
        return False, "ERROR: startTime NOT IN EXPECTED ISO 8601 FORMAT"

    if not iso_regex.match(end_time):
        return False, "ERROR: endTime NOT IN EXPECTED ISO 8601 FORMAT"

    # Return extracted parameters
    return True, start_time, end_time, rank, n, reverse_popularity

def validate_request_identifier(request_args):
    """Validates a request by identifier by checking it has the required parameters and the
    parameters match the required format.

    Args:
        request_args: The request arguments

    Returns:
        If the request is valid, a tuple containing True as the first item and
        request parameters as the remaining items; else, a tuple containing
        False as the first item and an error message as the second item
    """
    # Check request has required parameters
    identifier = request_args.get("identifier")
    if identifier is None:
        return False, "ERROR: MISSING DATA: identifier"

    # Validate format of parameters
    iso_regex = re.compile("Q[0-9]+")

    if not iso_regex.match(identifier):
        return False, "ERROR: identifier NOT IN EXPECTED WIKIDATA IDENTIFIER FORMAT"

    # Return extracted parameters
    return True, identifier


@timeline_blueprint.route("/")
def index() -> Response:
    """Simple status page for the index of the timeline route"""
    page = """
    Running :: status : ok!
    Use <current_url>/req to make a request
    """
    return page


@cache
def get_ranked_request_data(
    instance_of: str, start_time: str, end_time: str, rank: str, n: int, reverse_popularity:bool
) -> List[dict]:
    """Gets entries of a given instance within a given time range and ranks them before returning them.

    Args:
        instance_of: The identifier of the data item of which the entry must be an instance of,
         eg. Q23038290 for "fossil taxon"
        start_time: The start time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-100000000-01-01T00:00:00Z"
        end_time: The end time of the time range, given in the format Wikidata uses which mostly
         follows ISO 8601, eg. "-50000000-01-01T00:00:00Z"
        rank: The taxonomic rank of the entries to be returned, eg. "genus"
        n: The number of entries to return
        reverse_popularity: If the popularity rank is reversed (return the least popular entry within a time range) or not 

    Returns:
        A list of dictionary objects representing the entries that are most popular or least popular within a given range.
    """
    entries = get_data_from_cache(instance_of, start_time, end_time, rank)

    if entries is None:
        return None
    else:
        return ranking(start_time, end_time, n, entries, reverse_popularity, 0.95)

@cache
def get_request_identifier_data(identifier: str) -> dict:
    entry = get_identifier_data(identifier)

    if entry is None:
        return None
    else:
        return format_data(entry, None, include_id=False)

def get_data_from_cache(instance_of: str, start_time: str, end_time: str, rank:str) -> List[dict]:
    """Fetch data from WikiData cache"""
    x = []
    if instance_of in wikidata_cache:
        for i in wikidata_cache[instance_of]:
            if "startTime" in i and "endTime" in i and "rankLabel" in i:
                if i["rankLabel"] == rank or rank == None:
                    if datetime64(i["startTime"]) < datetime64(end_time) and datetime64(
                        i["endTime"]
                    ) > datetime64(start_time):
                        x.append(i)
        return x
    else:
        print("TIMELINE BACKEND Cache not yet formed OR {} not in cache".format(instance_of))
        return []


def get_wikipedia_rank(entry: dict) -> int:
    """Get PageView rank of an entry"""
    if entry['label'] in wikipedia_views_cache:
        # more views ~ better rank
        # avoid division by zero
        # todo cache
        return int(MAX_RANK / (wikipedia_views_cache[entry["label"]] + 1))
    else:
        return MAX_RANK
   
def get_start_time(entry:dict) -> int:
    """Get start time from WikiData entry"""
    return datetime64(entry['startTime']).astype(int)

def get_ranked_cache_data(instance_of: str, start_time: str, end_time: str, rank:str, n: int, reverse_popularity:bool) -> List[dict]:
    """Get cache data ranked by Wikipedia PageView rank"""
    x = get_data_from_cache(instance_of, start_time, end_time, rank)
    return sorted(x, key=get_wikipedia_rank, reverse=reverse_popularity)

@timeline_blueprint.route("/req/date", methods=['GET'])
def request_by_date() -> Response:
    """API route: take the request data from the frontend and return a
    response, for requests by time range"""
    schema = """
        REQUEST DATA BY TIME

        POST /req/date?startTime={startTime}&endTime={endTime}&n={n}&rank={rank}&reverse_popularity={reverse_popularity}


            {startTime}:  start time of data  ISO 8601 STRING,
            {endTime}:    end time of data    ISO 8601 STRING,
            {n}:          number of items to return
                                              INTEGER,
            {rank}:       the rank of the taxons that will be returned; if set to None,
                            taxons of all ranks will be returned
                                              STRING,
            {reverse_popularity}: whether popularity score should be inverted
                                              BOOLEAN

        EXAMPLE:
        
        /req/date?startTime=-100000000-01-01T00:00:00Z&endTime=-50000000-01-01T00:00:00Z&n=100&rank=none&reverse_popularity=false

        RETURNS

        JSON DATA OF VALUES IN FORMAT:

        [
            {
                'id':           STRING,
                'label':        STRING,
                'startTime':    ISO 8601 STRING, 
                'endTime':      ISO 8601 STRING,
                'imgURL':       URL STRING or NULL,
                'rankLabel':    STRING,
                'parentLabel':  STRING
            },
            .... 
        ]

        RESPONSE CODES:
            200     OK
            400     BAD REQUEST
    """

    t1 = time.time()

    no_req_err = "<pre>\nNO REQUEST HAS BEEN MADE\n\n\n" + schema + "\n\n\n\n\n"

    # Validate input
    validation_result = validate_request_time_range(request.args)
    validation_pass = validation_result[0]

    if validation_pass is False:
        error_cause = validation_result[1]
        return no_req_err + error_cause, 400

    ignored, start_time, end_time, rank, n, reverse_popularity = validation_result

    try:
        req_data = get_ranked_request_data("Q23038290", start_time, end_time, rank, n, reverse_popularity)
    except:
        # Fallback to preexisting cache data if error occurs while fetching and processing Wikidata results
        print("TIMELINE BACKEND Fallback to preexisting cache")
        req_data = get_ranked_cache_data("Q23038290", start_time, end_time, rank, n, reverse_popularity)

    t2 = time.time()
    # print("Response time:", t2 - t1)

    if req_data is None:
        return no_req_err + "ERROR: NOTHING RETURNED BY WIKIDATA QUERY", 400

    # Return first n results, returns full arr if len(req_data) > n
    return sorted(req_data[0:n], key=get_start_time)


@timeline_blueprint.route("/req/id", methods=["GET"])
def request_by_identifier() -> Response:
    """API route: take the request data from the frontend and return a
    response, for requests by ID"""
    schema = """
        REQUEST DATA BY IDENTIFIER

        POST /req/id?identifier={identifier}


            {identifier}:  Wikidata identifier of item  STRING,

        EXAMPLE:
        
        /req/id?identifier=Q14332

        RETURNS

        JSON DATA OF VALUES IN FORMAT:

        [
            {
                'label':        STRING,
                'startTime':    ISO 8601 STRING, 
                'endTime':      ISO 8601 STRING,
                'imgURL':       URL STRING or NULL
            },
            .... 
        ]

        RESPONSE CODES:
            200     OK
            400     BAD REQUEST
    """

    no_req_err = "<pre>\nNO REQUEST HAS BEEN MADE\n\n\n" + schema + "\n\n\n\n\n"

    # Validate input
    validation_result = validate_request_identifier(request.args)
    validation_pass = validation_result[0]

    if validation_pass is False:
        error_cause = validation_result[1]
        return no_req_err + error_cause, 400

    ignored, identifier = validation_result

    req_data = get_request_identifier_data(identifier)

    if req_data is None:
        return no_req_err + "ERROR: NOTHING RETURNED BY WIKIDATA QUERY", 400

    return req_data


@timeline_blueprint.after_request
def allows_cross_origin_request(response):
    """Allows cross-origin requests by modifying the response header. Original code
    taken from backend/map.py.

    Args:
        response: The response

    Returns:
        The response with the header modified
    """
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def wikidata(n: int):
    """
    Function which runs in an independent thread;
        fetches WikiData data every n seconds.
    Args:
        n: seconds between running routine
           n = 0 runs once and returns 0
    Returns:
        none    if n != 0(should never return for n != 0)
        0       if n = 0
    """
    while True:
        print("TIMELINE BACKEND wikidata cache load: Start")

        # currently using min and max date ranges, potentially TODO,
        # replace with just fetching all entries
        MIN_DATE = "-540000000-01-01T00:00:00Z"
        MAX_DATE = "0-01-01T00:00:00Z"

        for i in cached_instances:
            print("TIMELINE BACKEND wikidata cache load: {}".format(i))
            entries = get_entries_in_time_period(i, MIN_DATE, MAX_DATE)

            if entries is not None:
                wikidata_cache[i] = format_data(
                        entries,
                        None,
                        i
                        )
        print("TIMELINE BACKEND wikidata cache load: End")
        with open("wikidata_cache.json", "w") as file:
            json.dump(wikidata_cache, file)
        print("TIMELINE BACKEND wikipedia cache load: End")
        if n == 0:
            return 0
        time.sleep(n)

def wikipedia(n:int):
    """
    Function which runs in an independent thread;
        fetches Wikipedia PageView API data every n seconds.
    Args:
        n: seconds between running routine
           n = 0 runs once and returns 0
    Returns:
        none    if n != 0(should never return for n != 0)
        0       if n = 0
    """
    while True:
        print("TIMELINE BACKEND wikipedia cache load: Start")
        q = 0
        for i in wikidata_cache:
            for j in wikidata_cache[i]:
                # rate limiting
                if j["label"] not in wikipedia_views_cache and q < 100:
                    q += 1
                    d = datetime.datetime.now()
                    x = pageview_url.format(
                        j["label"].replace(" ", "_"), d.year, d.year  # Wikipedia format
                    )
                    data = requests.get(x, headers={"User-Agent": USER_AGENT})
                    status_code = data.status_code
                    if status_code == 200:
                        data = data.json()["items"]
                        s = 0
                        for m in data:
                            s += m["views"]
                        wikipedia_views_cache[j["label"]] = s
                    elif status_code == 404:
                        # 404 implies the page does not exist
                        wikipedia_views_cache[j["label"]] = 1
                    else:
                        pass
        with open("wikipedia_views_cache.json", "w") as file:
            json.dump(wikipedia_views_cache, file)
        print("TIMELINE BACKEND wikipedia cache load: End")
        if n == 0:
            return 0
        time.sleep(n)


# Threads with refresh seconds
t1 = threading.Thread(target=wikidata, args=(10000,))
t3 = threading.Thread(target=wikipedia, args=(100,))
t4 = threading.Thread(target=fix_missing, args=(100,))

if "pytest" not in sys.modules:
    t1.start()
    t3.start()
    t4.start()
