import os
from random import shuffle
from typing import Optional

from flask import Blueprint, Response, jsonify, request
from neo4j import GraphDatabase

article_blueprint = Blueprint("article", __name__)

featured_ids: list[str] | None = None

URI = f"bolt://{os.environ['G24_ADDRESS_INTERNAL']}:{os.environ['G24_DB_BOLT']}"
# URI = f"bolt://sg2-pipeline:{os.environ['BATCHPIPE_DB_BOLT']}"
AUTH = ("neo4j", os.environ["G24_DB_PASSWORD"])
neo4j_driver = GraphDatabase.driver(URI, auth=AUTH)


@article_blueprint.after_request
def add_header(response):
    """
    Adds headers to the response to allow cross origin requests
    """
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


LORUM_IPSUM = " ".join(
    """
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
    cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
    est laborum.
""".split()
)

PLACEHOLDER_IMAGE = (
    "https://images.unsplash.com/photo-1554727225-ee66ff0a1bc5?q=80&w=2594"
)
PLACEHOLDER_IMAGE_ALTTEXT = "dino party"


@article_blueprint.route("description", methods=["GET"])
def get_description() -> Response:
    """
    GET /article/description: get article description for an entity.

    Parameters:
        id:       (required) The wikidata QID of the desired entitity.

    Returns:
        A JSON object:

            {
              label:            (required) the label of the entity.
              shortDescription: (optional) a short (~ one sentence) description of the entity.
              description:      (optional) a long text description of the entity.
                  approximately corresponds to new formatted text in the wikipedia article as i (dm319) have seen fit to format.
            }

    Errors:
        Status 404: there is no entity with id `id`.

    Example Query:

        /article/description?id=Q14332
    """

    wikidata_id: Optional[str] = request.args.get("id")
    if not wikidata_id:
        return Response("ID argument is empty", status=400)

    records, _, _ = neo4j_driver.execute_query(
        """
    MATCH (n:Entity {id:$id})
    RETURN n.label as label,
           n.shortDescription as shortDescription,
           n.wikipediaWikiText as description,
       """,
        id=wikidata_id,
    )

    # all returned results
    # should have one or zero elements only due to uniqueness constraint on id in the db
    data = [record.data() for record in records]

    if len(data) == 0:
        return Response("No entity with given ID", status=404)

    return jsonify(data)


@article_blueprint.route("content", methods=["GET"])
def get_article_data() -> Response:
    """
    GET /article/content: get article content for an entity.

    Parameters:
        id:       (required) The wikidata QID of the entity.

    Returns:
        A JSON object:

            {
              label:            (required) the label of the entity.
              shortDescription: (optional) a short (~ one sentence) description of the entity.
              description:      (optional) a long text description of the entity.
                  approximately corresponds to all the text in the wikipedia article
                  before the first section heading.
              body:             (optional) the body text of the entities article.
              wikipediaLink:    (optional) a link to the English Wikipedia article associated with this entity.
              googleLink:       (optional) a link to the Google search associated with this entity.
            }

    Errors:
        Status 404: there is no entity with id `id`.

    Example Query:

        /article/content?id=Q14332
    """

    wikidata_id: Optional[str] = request.args.get("id")
    if not wikidata_id:
        return Response("ID argument is empty", status=400)

    records, _, _ = neo4j_driver.execute_query(
        """
    MATCH (n:Entity {id:$id})
    RETURN n.label as label,
           n.shortDescription as shortDescription,
           n.wikipediaDescription as description,
           n.body as body,
           n.wikipediaUrl as wikipediaLink
       """,
        id=wikidata_id,
    )

    # all returned results
    # should have one or zero elements only due to uniqueness constraint on id in the db
    data = [record.data() for record in records]

    if len(data) == 0:
        return Response("No entity with given ID", status=404)


    return jsonify(data[0])


@article_blueprint.route("images", methods=["GET"])
def get_images() -> Response:
    """
    GET /article/images: get images for an entity by wikidata id.

    Parameters:
        id:       (required) The wikidata QID of the entity.
        n:        (optional) The number of images to return. Defaults to 1.

    Returns:
        An array of JSON objects:

              [image]    images related to the entity. This will return n,
                         or the total number of images for the entity, whichever is fewer.

            image := {url: <url_to_image>, altText: <str>}

    Errors:
        Status 404: there is no entity with id `id`.

    Example Query:

        /article/images?id=Q14332&n=2
    """

    # this used to be part of /article/content, but getting the right images out of the db is a bit of a complex query,
    # so doing things this way will simplify things somewhat.

    # Get the WikiData ID
    wikidata_id: Optional[str] = request.args.get("id")

    # Check if the WikiData ID is empty
    if not wikidata_id:
        return Response("ID argument is empty", status=400)

    if request.args.get("n"):
        try:
            n: int = int(request.args.get("n"))
        except ValueError:
            return Response("n is not a number", status=400)
    else:
        n = 1

    if n <= 0:
        n = 1

    records, _, _ = neo4j_driver.execute_query(
        """
        MATCH (node:Entity {id:$wikidata_id})
        MATCH (node)<-[r:imageOf]-(img:Image)
        RETURN img.src as url, img.altText as altText ORDER BY r.rank ASC
        LIMIT $total
        """,
        total=n,
        wikidata_id=wikidata_id,
    )

    images = []
    for record in records:
        images.append(record.data())

    return jsonify(images)


@article_blueprint.route("featured", methods=["GET"])
def get_featured() -> Response:
    """
    GET /article/featured: get n random featured articles.

    Parameters:
        n:        (optional) The number of articles to return. Defaults to 1.

    Returns:
        [{
          id: the QID of the article,
          label: the name of the entity.
          shortDescription?: a short (~ one sentence) description of the entity.
        }]
    """

    if request.args.get("n"):
        try:
            n: int = int(request.args.get("n"))
        except ValueError:
            return Response("n is not a number", status=400)
    else:
        n = 1

    if n <= 0:
        n = 1

    global featured_ids

    # only get featured article idsonce
    if featured_ids is None:
        records, summary, keys = neo4j_driver.execute_query(
            """
            MATCH (n:Entity)
            WHERE n.wikipediaUrl IS NOT NULL AND (n)<-[:imageOf]-()
            RETURN n.id as id
            ORDER BY n.pageRank DESC
            LIMIT 20
            """,
        )

        featured_ids = [record.get('id') for record in records]

    shuffle(featured_ids)
    featured_now = featured_ids[:3]

    records, summary, keys = neo4j_driver.execute_query(
        """
        UNWIND $ids as id
        MATCH (n:Entity {id:id})
        RETURN n.id as id,
           n.shortDescription as shortDescription,
           n.label as label
        """,
        ids=featured_now,
    )

    return [record.data() for record in records]
