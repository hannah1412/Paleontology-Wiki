"""
Tasks for populating the database from Wikidata.
"""

__all__ = ["CheckpointAllDataInDB", "EraseDB"]

import json
import logging
import os
import re
import time
from typing import Dict, List

import luigi
import mwparserfromhell
import pandoc
import pywikibot
import pywikibot.textlib
import requests
from bs4 import BeautifulSoup as bs
from neo4j import GraphDatabase
from pywikibot.pagegenerators import PreloadingGenerator
from pywikibot.textlib import Content, extract_sections

from batchpipe import NEO4J_AUTH, NEO4J_URI
from batchpipe.wikitools import (
    pages_from_qids_generator,
    preloading_with_templates_generator,
)

SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"

# number of wikipedia images to download
IMAGE_LIMIT = 5


# see https://neo4j.com/docs/apoc/current/overview/apoc.periodic/apoc.periodic.iterate/
# our data is ~120,000 nodes.
# smaller batches prevents locks.
ADD_TRANSCATION_SIZE = 1000

# how many retries on a deadlock
RETRIES = 10

# how many wikipedia pages to preload per batch
WIKI_PRELOAD_GROUP_SIZE = 100


class CheckpointAllDataInDB(luigi.WrapperTask):
    def requires(self):  # type: ignore
        return (
            AddWikipediaURLSToDB(),
            AddWikidataImagesToDB(),
            AddWikidataDescriptionsToDB(),
            AddWikipediaDescriptionsToDB(),
            AddWikipediaImagesToDB(),
            AddWikipediaWikiTextToDB(),
            AddFilteredWikipediaWikiTextToDB(),
        )


class EraseDB(luigi.Task):
    """
    Erase the database, ready for new data to be placed there.
    """

    def run(self):
        logger = logging.getLogger("luigi-interface")
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger.info("Removing all indices and constraints...")
            driver.execute_query("CALL apoc.schema.assert({}, {})")
            logger.info("Done!")

            logger.info("Removing all nodes...")
            driver.execute_query("MATCH (n) DETACH DELETE n")
            logger.info("Done!")

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("erase-db.checkpoint")


class DownloadWikidataIdsLabels(luigi.Task):
    """
    Query Wikidata for entities that are instances of fossil taxon Q23038290 and write the results to a json file.
    """

    def run(self):
        """
        Queries Wikidata for entities that are instances of fossil taxon Q23038290
        """
        query = """SELECT ?qid ?label WHERE {
          ?qid wdt:P31 wd:Q23038290;
            rdfs:label ?label.
          FILTER((LANG(?label)) = "en")
        }
 """

        params = {"query": query, "format": "json", "timeout": "60"}

        result = requests.get(SPARQL_ENDPOINT, params=params)
        if result.status_code != 200:
            raise Exception(
                f"Query failed to run by returning code of {result.status_code}. {result.text}"
            )
        data = result.json()

        with self.output().open("w") as f:
            f.write(json.dumps(data["results"]["bindings"]))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikidata-ids.json")


class DownloadWikidataDescriptions(luigi.Task):
    """
    Get descriptions for entities from Wikidata.
    """

    def run(self):
        """
        Queries Wikidata for descriptions of all qids found in DownloadWikidataJson
        """

        query = """SELECT ?qid ?description WHERE {
        ?qid wdt:P31 wd:Q23038290;
            schema:description ?description.
        FILTER((LANG(?description)) = "en")
    }
        """
        params = {"query": query, "format": "json"}
        result = requests.get(SPARQL_ENDPOINT, params=params)
        if result.status_code != 200:
            raise Exception(
                f"Query failed to run by returning code of {result.status_code}. {result.text}"
            )
        data = result.json()
        with self.output().open("w") as f:
            f.write(json.dumps(data["results"]["bindings"]))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikidata-descriptions.json")


class DownloadWikidataImages(luigi.Task):
    """
    Get photos for entities from Wikidata.
    """

    def run(self):
        """
        Queries Wikidata for photos of all qids found in DownloadWikidataJson
        """
        query = """SELECT ?qid (SAMPLE(?photo1) AS ?photo1) (SAMPLE(?photo2) AS ?photo2) (SAMPLE(?photo3) AS ?photo3) WHERE {
    ?qid wdt:P31 wd:Q23038290.
    OPTIONAL {{ ?qid wdt:P18 ?photo1. }}
    BIND(IF(BOUND(?photo1), ?photo1, "NA") AS ?photo1)
    OPTIONAL {
        ?qid wdt:P18 ?photo2.
        FILTER(?photo1 != ?photo2)
    }
    BIND(IF(BOUND(?photo2), ?photo2, "NA") AS ?photo2)
    OPTIONAL {
        ?qid wdt:P18 ?photo3.
        FILTER(?photo1 != ?photo3)
        FILTER(?photo2 != ?photo3)
    }
    BIND(IF(BOUND(?photo3), ?photo3, "NA") AS ?photo3)
}
GROUP BY ?qid
"""
        params = {"query": query, "format": "json"}
        result = requests.get(SPARQL_ENDPOINT, params=params)
        if result.status_code != 200:
            raise Exception(
                f"Query failed to run by returning code of {result.status_code}. {result.text}"
            )
        data = result.json()

        with self.output().open("w") as f:
            f.write(json.dumps(data["results"]["bindings"]))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikidata-images.json")


class DownloadWikipediaURLS(luigi.Task):
    # add --DownloadWikipediaURLS-wikipedia-url-limit XX to your run of batchpipe
    # to limit number of wikipedia urls in the database for testing
    wikipedia_url_limit = luigi.parameter.OptionalIntParameter(default=-1)
    """
    Get wikipedia article URLs for entities from Wikidata.
    """

    def run(self):
        """
        Queries Wikidata for articles of all qids found in DownloadWikidataJson
        """
        query = """SELECT ?qid ?article WHERE {
        ?qid wdt:P31 wd:Q23038290.
    ?article schema:about ?qid;
        schema:inLanguage "en".
    FILTER((SUBSTR(STR(?article), 1 , 25 )) = "https://en.wikipedia.org/")
}"""
        params = {"query": query, "format": "json"}
        result = requests.get(SPARQL_ENDPOINT, params=params)
        if result.status_code != 200:
            raise Exception(
                f"Query failed to run by returning code of {result.status_code}. {result.text}"
            )
        data = result.json()["results"]["bindings"]

        if self.wikipedia_url_limit > 0:  # type: ignore
            data = data[: self.wikipedia_url_limit]
        with self.output().open("w") as f:
            f.write(json.dumps(data))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikipedia-articles.json")


class DownloadWikipediaDescriptions(luigi.Task):
    """
    Get Wikipedia descriptions for entities from Wikipedia.
    """

    def requires(self):  # type: ignore
        return AddWikipediaURLSToDB()

    def run(self):
        """
        Queries Wikipedia for descriptions of all pages in the neo4j database
        """
        logger = logging.getLogger("luigi-interface")
        start_time = time.time()
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            records, _, _ = driver.execute_query(
                """
                MATCH (a:Entity)
                WHERE a.wikipediaUrl IS NOT NULL
                RETURN a.id as id
                """
            )
            qids = [record.get("id") for record in records]

        total_pages: int = len(qids)
        current_page: int = 0
        descriptions = []

        # PreloadingGenerator fetches page content in bulk batches.
        # This saves time over querying each pages content one at a time!
        # as recommended in https://doc.wikimedia.org/pywikibot/master/faq.html
        site = pywikibot.Site("en", "wikipedia")
        pages = preloading_with_templates_generator(
            pages_from_qids_generator(site, qids),
            quiet=True,
            groupsize=WIKI_PRELOAD_GROUP_SIZE,
        )

        for page in pages:
            try:
                current_page += 1

                # TODO: maybe read this from the database instead of pywikibot
                # - kieran's got a pr with all this stuff refactored.

                # for example: download full text to db once using pywikibot,
                # then use the text from our db instead of pywikibot in all
                # wikipedia processing jobs.
                content: Content = extract_sections(page.get(), site=site)
                description: str = content.header
                description = pywikibot.textlib.removeCategoryLinksAndSeparator(
                    description, site=site
                )
                description = pandoc.write(
                    pandoc.read(description, format="mediawiki"), format="plain"
                )

                url = page.full_url()
                descriptions.append({"description": description, "url": url})

                if current_page % 100 == 0:
                    pages_percent = current_page * 100 // total_pages
                    logger.info(
                        f"DownloadWikipediaDescriptions: {current_page} / {total_pages} pages ({pages_percent}%)"
                    )
                    self.set_status_message(  # type: ignore
                        f"Processed {current_page} / {total_pages} pages"
                    )
                    self.set_progress_percentage(pages_percent)  # type: ignore

            except pywikibot.exceptions.Error as e:
                logger.warning(
                    f"Error while getting Wikipedia description for page {page}: {e}"
                )

        logger.info(f"DownloadWikipediaDescriptions: took {time.time() - start_time}s")
        # logger.debug(f"DownloadWikipediaDescriptions: look like {descriptions[0:5]}")
        with self.output().open("w") as f:
            f.write(json.dumps(descriptions))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikipedia-descriptions.json")


def get_caption_from_image_title(image_title: str) -> str | None:
    """
    Get the caption for an image from its title.
    """
    media_wiki_api = "https://commons.wikimedia.org/w/api.php"
    id_request = requests.get(
        media_wiki_api,
        params={
            "action": "query",
            "format": "json",
            "prop": "info",
            "titles": image_title,
        },
    )
    id_data = id_request.json()
    # Return None if the image is not found
    if "missing" in id_data["query"]["pages"].values():
        return None
    image_id = id_data["query"]["pages"].popitem()[0]
    image_id = f"M{image_id}"
    caption_request = requests.get(
        media_wiki_api,
        params={
            "action": "wbgetentities",
            "format": "json",
            "ids": image_id,
        },
    )
    caption_data = caption_request.json()
    # Return None if no entity with the image id is found
    if "entities" not in caption_data:
        return None
    if image_id not in caption_data["entities"]:
        return None
    if "labels" not in caption_data["entities"][image_id]:
        return None
    if "en" not in caption_data["entities"][image_id]["labels"]:
        return None
    return caption_data["entities"][image_id]["labels"]["en"]["value"]


class DownloadWikipediaImages(luigi.Task):
    """
    Get Wikipedia images for entities from Wikipedia.
    """

    def requires(self):  # type:ignore
        return AddWikipediaURLSToDB()

    def run(self):
        """
        Queries Wikipedia for images of all pages in the neo4j database
        """
        logger = logging.getLogger("luigi-interface")
        start_time = time.time()
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            records, _, _ = driver.execute_query(
                """
                MATCH (a:Entity)
                WHERE a.wikipediaUrl IS NOT NULL
                RETURN a.id as qid
                """
            )
            qids = [record.get("qid") for record in records]

        total_pages: int = len(qids)
        current_page: int = 0
        images = []

        site = pywikibot.Site("en", "wikipedia")
        pages = PreloadingGenerator(
            pages_from_qids_generator(site, qids),
            quiet=True,
            groupsize=WIKI_PRELOAD_GROUP_SIZE,
        )

        for page in pages:
            try:
                current_page += 1
                imgs_for_page: List[Dict[str, str | int]] = []
                if page.exists():
                    page_image = page.page_image()
                    url = page.full_url()
                    if page_image:
                        page_image_url = page_image.get_file_url()
                        page_image_title = page_image.title()
                        caption = get_caption_from_image_title(page_image_title)

                        imgs_for_page.append(
                            {
                                "image_url": page_image_url,
                                "rank": 0,
                                "alt_text": caption if caption else "",
                            }
                        )
                    for i, img in enumerate(page.imagelinks(total=IMAGE_LIMIT)):
                        caption = get_caption_from_image_title(img.title())
                        imgs_for_page.append(
                            {
                                "image_url": img.get_file_url(),
                                "rank": i + 1,
                                "alt_text": caption if caption else "",
                            }
                        )

                    imgs_for_page = [
                        image
                        for i, image in enumerate(imgs_for_page)
                        if i < IMAGE_LIMIT and image["image_url"]
                    ]

                    images.append({"url": url, "images": imgs_for_page})

                if current_page % 10 == 0:
                    pages_percent = current_page * 100 // total_pages
                    logger.info(
                        f"DownloadWikipediaImages: {current_page} / {total_pages} pages ({pages_percent}%)"
                    )
                    self.set_progress_percentage(pages_percent)  # type:ignore
                    self.set_status_message(  # type:ignore
                        f"Processed {current_page} / {total_pages} pages"
                    )

            except pywikibot.exceptions.Error as e:
                logger.warn(f"DownloadWikipediaImages: {type(e).__name__} {e}", e)
                continue
            except ValueError as e:
                logger.warn(f"DownloadWikipediaImages: {type(e).__name__} {e}", e)
                continue
            except TypeError as e:
                logger.warn(f"DownloadWikipediaImages: {type(e).__name__} {e}", e)
                continue

        logger.info(f"DownloadWikipediaImages: took {time.time() - start_time}s")
        with self.output().open("w") as f:
            f.write(json.dumps(images))

    def output(self):  # type:ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikipedia-images.json")


class DownloadWikipediaWikiText(luigi.Task):
    """
    Get Wikipedia wikitext for entities from Wikipedia.
    """

    def requires(self):  # type:ignore
        return AddWikipediaURLSToDB()

    def run(self):
        """
        Queries Wikipedia for wikitext of all pages in the neo4j database
        """
        logger = logging.getLogger("luigi-interface")
        start_time = time.time()
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            records, _, _ = driver.execute_query(
                """
                MATCH (a:Entity)
                WHERE a.wikipediaUrl IS NOT NULL
                RETURN a.id as qid
                """
            )
            qids = [record.get("qid") for record in records]

        total_pages: int = len(qids)
        current_page: int = 0
        wiki_texts = []

        site = pywikibot.Site("en", "wikipedia")
        pages = preloading_with_templates_generator(
            pages_from_qids_generator(site, qids),
            quiet=True,
            groupsize=WIKI_PRELOAD_GROUP_SIZE,
        )
        for page in pages:
            try:
                current_page += 1
                if page.exists():
                    wiki_text = page.get()
                    url = page.full_url()
                    wiki_texts.append({"url": url, "wiki_text": wiki_text})

                if current_page % 100 == 0:
                    pages_percent = current_page * 100 // total_pages
                    logger.info(
                        f"DownloadWikipediaWikiText: {current_page} / {total_pages} pages ({pages_percent}%)"
                    )
                    self.set_status_message(
                        f"Processed {current_page} / {total_pages} pages"
                    )  # type:ignore
                    self.set_progress_percentage(pages_percent)  # type:ignore

            except pywikibot.exceptions.Error as e:
                logger.warn(f"DownloadWikipediaImages: {type(e).__name__} {e}", e)
                continue

        logger.info(f"DownloadWikipediaWikiText: took {time.time() - start_time}s")
        with self.output().open("w") as f:
            f.write(json.dumps(wiki_texts))

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("wikipedia-wiki-text.json")


class GetWikiTextAsPlainText(luigi.Task):
    """
    Use wiki text from DownloadWikipediaWikiText along with pandoc to get plain text.
    """

    def requires(self):  # type: ignore
        return [DownloadWikipediaWikiText()]

    def run(self):
        logger = logging.getLogger("luigi-interface")
        with self.input()[0].open("r") as f:
            wiki_texts = json.load(f)
            total = len(wiki_texts)
        for i, wiki_text in enumerate(wiki_texts):
            try:
                wiki_text["plain_text"] = pandoc.write(
                    pandoc.read(wiki_text["wiki_text"], format="mediawiki"),
                    format="plain",
                )
                if i % 100 == 0:
                    pages_percent = i * 100 // total
                    logger.info(
                        f"GetWikiTextAsPlainText: {i} / {total} pages ({pages_percent}%)"
                    )
                    self.set_status_message(  # type: ignore
                        f"Processed {i} / {total} pages"
                    )
                    self.set_progress_percentage(pages_percent)  # type: ignore
            except Exception as e:
                logger.warn(f"GetWikiTextAsPlainText: {type(e).__name__} {e}", e)

        with self.output().open("w") as f:
            f.write(json.dumps(wiki_texts))

    def output(self):  # type: ignore
        return luigi.LocalTarget("wikipedia-plain-text.json")


class InitDB(luigi.Task):
    """
    Imports the data from the json file into Neo4j.
    """

    def requires(self):  # type: ignore
        """
        Returns the requirements for this task
        """
        return EraseDB(), DownloadWikidataIdsLabels()

    def run(self):
        """
        Import the data from the JSON files into Neo4j.
        """

        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding ids and labels to DB.")
            driver.execute_query(
                """
            CALL apoc.periodic.iterate(
                "CALL apoc.load.json($ids_path) YIELD value RETURN value",
                'WHERE value.label is not null
                    WITH replace(value.qid.value,"http://www.wikidata.org/entity/","") AS id,
                         value.label.value AS label
                    CREATE (a:Entity {id: id,label: label})',
                    {batchSize: $batch_size, retries:$retries, parallel:true, params: {ids_path:$ids_path}}
                )
            """,
                ids_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            logger.info("Added ids and labels to DB.")

        self.output().open("w").close()

    def output(self):  # type: ignore
        """
        Returns the output for this task
        """
        return luigi.LocalTarget("initdb.checkpoint")


class AddWikidataDescriptionsToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikidataDescriptions()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikidata descriptions to DB.")
            start_time = time.time()

            driver.execute_query(
                """
            CALL apoc.periodic.iterate("CALL apoc.load.json($descriptions_path) YIELD value RETURN value",
                'WHERE value.description is not null
                 WITH value.description.value AS description,
                     replace(value.qid.value,"http://www.wikidata.org/entity/","") AS id
                 MATCH (a:Entity {id:id})
                 SET a.shortDescription = description',
                {batchSize: $batch_size, retries:$retries, parallel:true,params: {descriptions_path:$descriptions_path}})
            """,
                descriptions_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )
            logger.info(f"Added descriptions to DB, took {time.time()-start_time}s")

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikidata-descriptions-to-db.checkpoint")


class AddWikidataImagesToDB(luigi.Task):
    def requires(self):  # type:ignore
        return InitDB(), DownloadWikidataImages()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikidata Image URLs to DB.")
            start_time = time.time()

            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                    "CALL apoc.load.json($images_path) YIELD value RETURN value AS dat",
                    'WITH replace(dat.qid.value,"http://www.wikidata.org/entity/","") AS id,
                          COALESCE(dat.photo1,"NA") as photo1,
                          COALESCE(dat.photo2,"NA") as photo2,
                          COALESCE(dat.photo3,"NA") as photo3,
                          COALESCE(dat.photo1_caption, "") as photo1_caption,
                          COALESCE(dat.photo2_caption, "") as photo2_caption,
                          COALESCE(dat.photo3_caption, "") as photo3_caption
                     MATCH (a:Entity {id:id})
                     CALL apoc.do.when(
                        (photo1 <> "NA") AND (photo1.value <> "NA"),
                       "MERGE (img:Image {src:photo.value, altText:photo_caption.value}) 
                        MERGE (img)-[r:imageOf]->(a)
                        SET r.rank = 20",
                       "",
                       {a:a, photo:photo1, photo_caption:photo1_caption}) YIELD value AS ignore1

                     CALL apoc.do.when(
                        (photo2 <> "NA") AND (photo2.value <> "NA"),
                       "MERGE (img:Image {src:photo.value, altText:photo_caption.value}) 
                        MERGE (img)-[r:imageOf]->(a)
                        SET r.rank = 20",
                       "",
                       {a:a, photo:photo2, photo_caption:photo2_caption}) YIELD value AS ignore2

                     CALL apoc.do.when(
                        (photo3 <> "NA") AND (photo3.value <> "NA"),
                       "MERGE (img:Image {src:photo.value, altText:photo_caption.value}) 
                        MERGE (img)-[r:imageOf]->(a)
                        SET r.rank = 20",
                       "",
                       {a:a, photo:photo3, photo_caption:photo3_caption}) YIELD value AS ignore3

                    RETURN ""
                    ',
                    {batchSize: $batch_size, retries:$retries, parallel:true,params:{images_path: $images_path}})
                    YIELD errorMessages, updateStatistics,timeTaken,total
                """,
                images_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=1000,
                retries=RETRIES,
            )

            logger.info(
                f"Added Wikidata Image URLs to DB, took {time.time()-start_time}s."
            )
            logger.info(
                f"AddWikidataImagesToDB: {[record.data() for record in records]}"
            )
        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikidata-images-to-db.checkpoint")


class AddWikipediaURLSToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikipediaURLS()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikipedia URLs to DB.")
            start_time = time.time()

            driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  "CALL apoc.load.json($articles_path) YIELD value RETURN value",

                  ' WHERE value.article is not null
                    WITH value.article.value AS url,
                         replace(value.qid.value,"http://www.wikidata.org/entity/","") AS id
                    MATCH (a:Entity {id:id})
                    SET a.wikipediaUrl = url',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params: {articles_path: $articles_path}})
                """,
                articles_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            logger.info(f"Added Wikipedia URLs to DB, took {time.time()-start_time}s.")

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikipedia-urls-to-db.checkpoint")


class AddWikipediaDescriptionsToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikipediaDescriptions()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikipedia descriptions to DB.")
            start_time = time.time()
            # we explicitly return statistics about the run from the iterate call for debug logging
            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  "CALL apoc.load.json($wikipedia_descriptions_path) YIELD value RETURN value",
                  'WHERE value is not null
                   WITH value.url AS url,
                        value.description as description
                   MATCH (a:Entity {wikipediaUrl:url})
                   SET a.wikipediaDescription = description',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params: {wikipedia_descriptions_path:$wikipedia_descriptions_path}})
                  YIELD updateStatistics,timeTaken,total
                """,
                wikipedia_descriptions_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            for record in records:
                logger.info(f"wikipedia-descriptions result: {record.data()}")
            logger.info(
                f"Added Wikipedia descriptions to DB, took {time.time()-start_time}s."
            )

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikipedia-descriptions-to-db.checkpoint")


class AddWikipediaImagesToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikipediaImages()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikipedia images to DB.")
            start_time = time.time()
            # we explicitly return statistics about the run from the iterate call for debug logging
            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  "CALL apoc.load.json($wikipedia_images_path) YIELD value RETURN value",
                  'WHERE value is not null
                   WITH value.url AS url,
                        value.images as images
                   MATCH (a:Entity {wikipediaUrl:url})
                   UNWIND images as image
                   MERGE (i:Image {src:image.image_url})
                   MERGE (a)<-[r:imageOf]-(i)
                   SET r.rank = image.rank
                   SET i.altText = image.alt_text',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params: {wikipedia_images_path:$wikipedia_images_path}})
                  YIELD updateStatistics,timeTaken,total
                """,
                wikipedia_images_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            for record in records:
                logger.info(f"wikipedia-images result: {record.data()}")
            logger.info(
                f"Added Wikipedia images to DB, took {time.time()-start_time}s."
            )

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikipedia-images-to-db.checkpoint")


class RemoveTemplates(luigi.Task):
    def requires(self):  # type:ignore
        return [DownloadWikipediaWikiText()]

    def run(self):  # type:ignore
        wiki_texts: list[dict[str, str]] = []
        logger = logging.getLogger("luigi-interface")

        articles_path = f"{os.path.realpath(str(self.input()[0].path))}"

        with open(articles_path, "r") as f:
            article_json = json.load(f)

        for page in article_json:
            # logger.log(10, clean_page)

            wikicode = mwparserfromhell.parse(str(page["wiki_text"]))

            # wikicode = str(wikicode)

            for template in wikicode.ifilter_templates():
                if template.name.matches(["convert", "cvt"]):
                    value = ""
                    if any(
                        sep in str(param)
                        for param in template.params[1]
                        for sep in [
                            "-",
                            "–",
                            "and",
                            "to",
                            "x",
                            "×",
                            "+/-",
                            "±",
                            "+",
                            ",",
                        ]
                    ):
                        try:
                            value += template.params[0].value.strip() + " "
                            value += template.params[1].value.strip() + " "
                            value += template.params[2].value.strip()
                            unit = template.params[3].value.strip()
                        except Exception as e:
                            continue
                    else:
                        value = template.params[0].value.strip()
                        unit = template.params[1].value.strip()

                    if not value:
                        raise ValueError(
                            f"Value is empty for template {template}. This should not happen, contact dm319 so he can cry more over this."
                        )

                    template_value = str(template)
                    # logger.log(
                    #     10,
                    #     f"====================================== Found convert template: {template_value} {value} {unit}",
                    # )
                    wikicode = str(wikicode).replace(template_value, f"{value}{unit}")
                    wikicode = mwparserfromhell.parse(wikicode)

                elif template.name.matches(
                    [
                        "cite journal",
                        "cite book",
                        "cite web",
                        "cite news",
                        "cite magazine",
                        "cite encyclopedia",
                        "cite video",
                        "clade",
                        "short description",
                        "automatic taxobox",
                    ]
                ):
                    try:
                        wikicode.remove(template)
                    except ValueError:
                        # logger.warning(
                        #     f"Failed to remove template: {template}"
                        # )
                        ...

            section: mwparserfromhell.wikicode.Wikicode
            for section in wikicode.get_sections():
                heading: mwparserfromhell.nodes.heading.Heading
                for heading in section.ifilter_headings(recursive=False):
                    if not heading.title.matches(
                        [
                            "Description",
                        ]
                    ):
                        try:
                            wikicode.remove(section)
                            ...
                        except ValueError as e:
                            logger.warning(f"Failed to remove section: {section}")
                            raise e
                    else:
                        # logger.info(
                        #     f"============================= Found section: {heading.title}"
                        # )
                        wikicode.remove(heading)

            # !! In order to do the kind of processing I wanted to do, I need to run a ML model on the text/sections to get the "most important" parts of the article.
            # !! This is very out of scope, and very out of time, as it requires a large amount of labeled data, and a lot of time to train a model (and label data).

            # TODO :: Remove semicolons with a leading space, and the space after them.
            # TODO :: Remove anything in square brackets

            # logger.info(wikicode)

            clean_page = bs(str(wikicode), "html.parser")
            for elem in clean_page(["ref"]):
                elem.decompose()

            # clean_page = str(clean_page)

            # -- get wikicode as plain text, replacing all whitespace with a single space.
            # -- -- works for now, until (if) i come up with a way to tablate data.
            try:
                wikitext = " ".join(
                    pandoc.write(
                        pandoc.read(clean_page, format="mediawiki"), format="plain"
                    ).split()
                )
            except Exception as e:
                logger.warn(f"RemoveTemplates: {type(e).__name__} {e}", e)
                continue

            wikitext = re.sub(r" ; ", "", wikitext)
            wikitext = re.sub(
                r"\[.*?\]", "", wikitext
            )  # -- if this works it will be a miracle

            # logger.info(f"=============================: \n{wikitext}")

            wiki_texts.append({"url": page["url"], "wiki_text": wikitext})

            # logger.log(10, f"{wikicode}")

        with self.output().open("w") as f:
            f.write(json.dumps(wiki_texts))

    def output(self):  # type: ignore
        return luigi.LocalTarget("wiki-article-no-template.json")


class AddWikipediaWikiTextToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), GetWikiTextAsPlainText()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikipedia wiki text to DB.")
            start_time = time.time()
            # we explicitly return statistics about the run from the iterate call for debug logging
            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  "CALL apoc.load.json($wikipedia_wiki_text_path) YIELD value RETURN value",
                  'WHERE value is not null
                   WITH value.url AS url,
                        value.wiki_text as wiki_text,
                        value.plain_text as plain_text
                   MATCH (a:Entity {wikipediaUrl:url})
                   SET a.wikipediaWikiText = wiki_text
                   SET a.wikipediaPlainText = plain_text',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params: {wikipedia_wiki_text_path:$wikipedia_wiki_text_path}})
                  YIELD errorMessages,updateStatistics,timeTaken,total
                """,
                wikipedia_wiki_text_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            for record in records:
                logger.info(f"wikipedia-wiki-text result: {record.data()}")
            logger.info(
                f"Added Wikipedia wiki text to DB, took {time.time()-start_time}s."
            )

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-wikipedia-wiki-text-to-db.checkpoint")


class AddFilteredWikipediaWikiTextToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), RemoveTemplates()

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("Adding Wikipedia wiki text to DB.")
            start_time = time.time()
            # we explicitly return statistics about the run from the iterate call for debug logging
            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  "CALL apoc.load.json($wikipedia_wiki_text_path) YIELD value RETURN value",
                  'WHERE value is not null
                   WITH value.url AS url,
                        value.wiki_text as wiki_text
                   MATCH (a:Entity {wikipediaUrl:url})
                   SET a.body = wiki_text',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params: {wikipedia_wiki_text_path:$wikipedia_wiki_text_path}})
                  YIELD updateStatistics,timeTaken,total
                """,
                wikipedia_wiki_text_path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=ADD_TRANSCATION_SIZE,
                retries=RETRIES,
            )

            for record in records:
                logger.info(f"wikipedia-wiki-text result: {record.data()}")
            logger.info(
                f"Added Wikipedia wiki text to DB, took {time.time()-start_time}s."
            )

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("add-filtered-wikipedia-wiki-text-to-db.checkpoint")
