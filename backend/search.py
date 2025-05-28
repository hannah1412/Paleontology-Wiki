from typing import Optional

from flask import Blueprint, Response, jsonify, request, current_app
from neo4j import GraphDatabase
import os
from lucene_query_transformers import process_query


search_blueprint = Blueprint("search", __name__)

URI = f"bolt://{os.environ['G24_ADDRESS_INTERNAL']}:{os.environ['G24_DB_BOLT']}"
AUTH = ("neo4j", os.environ["G24_DB_PASSWORD"])
neo4j_driver = GraphDatabase.driver(URI, auth=AUTH)


@search_blueprint.after_request
def after_request(response: Response):
    """
    Adds headers to the response to allow cross origin requests
    """
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


@search_blueprint.route("", methods=["GET"])
def search() -> Response:
    """
    GET /search: search wikidata entities.

    Parameters:
      q:      (required) The query string.
      total:  (optional) The number of results to return.
                         Defaults to 50.
      fuzzy:  (optional) true/false. Perform fuzzy or exact search?
                         Defaults to true.

    Returns:
        A JSON array of search results:

        [{
           id: the Wikidata QID of the entity.
           label: the name of the entity.
           short_description: (optional)
           image: (optional) a featured image for the entity
             { url: string
               altText?: string
             }
        }]

        Results are ordered by relevance.

    Errors:
        Status 400: the query string is empty or the total is
                    invalid.

    Example Query:

        /search?q=trex&total=10

    """

    # Get the search term from the query parameters
    search_query: Optional[str] = request.args.get("q")
    total_param: Optional[str] = request.args.get("total")
    fuzzy_param: Optional[str] = request.args.get("fuzzy")

    if total_param:
        total = int(total_param)
    else:
        total = 50

    if not search_query:
        return Response("Search term is empty", status=400)

    if total <= 0:
        return Response("Total must be greater than 0", status=400)

    fuzzy = True
    if fuzzy_param and fuzzy_param.lower() == "false":
        fuzzy = False

    search_query = process_query(search_query, fuzzy=fuzzy)
    current_app.logger.debug(f"search query: {search_query}")

    records, _, _ = neo4j_driver.execute_query(
        """
        CALL db.index.fulltext.queryNodes("search",$search_term) YIELD node, score         
        CALL {                 
                WITH node                 
                OPTIONAL MATCH (node)<-[r:imageOf]-(img:Image)                 
                RETURN img ORDER BY r.rank ASC LIMIT 1          
        }         
        WITH node, img,score
        RETURN node.label AS label, node.id AS id, 
               node.shortDescription AS shortDescription, 
               coalesce(img.src,"") AS image_url, 
               coalesce(img.altText,"") AS alt_text         
        ORDER BY score DESC
        LIMIT $total
        """,
        search_term=search_query,
        total=total,
    )

    results = []
    for record in records:
        result = {
            "id": record["id"],
            "label": record["label"],
            "shortDescription": record["shortDescription"],
        }

        image = dict()
        image_url = record.get("image_url")
        image_alt_text = record.get("alt_text")

        if image_url and image_url != "":
            image["url"] = image_url

        if image_alt_text and image_alt_text != "":
            image["altText"] = image_alt_text

        if len(image) > 0:
            result["image"] = image

        results.append(result)

    return jsonify(results)
