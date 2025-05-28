import json
import os
from typing import Dict, List
import pywikibot

import luigi
from luigi.local_target import LocalTarget
from neo4j import GraphDatabase

from .populate_db import InitDB, AddWikipediaURLSToDB
import logging
from batchpipe.wikitools import (
    wikidata_items_from_qids_generator,
    pages_from_qids_generator,
)
from batchpipe import NEO4J_URI, NEO4J_AUTH

import time

TEST_LIMIT = -1


class CheckpointAllLinksInDB(luigi.WrapperTask):
    def requires(self):
        return [AddWikipediaLinksToDB(), AddWikidataLinksToDB()]


class DownloadWikidataLinks(luigi.Task):
    def requires(self):  # type:ignore
        return InitDB()

    def run(self):  # type:ignore

        logger = logging.getLogger("luigi-interface")

        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            records, _, _ = driver.execute_query(
                """
                    MATCH (n:Entity)
                    RETURN n.id AS qid 
                """
            )

        qids = [record.get("qid") for record in records]
        n_pages: int = len(qids)
        data: List[Dict[str, str | List[str]]] = []
        start_time = time.time()

        for i, (qid, page) in enumerate(wikidata_items_from_qids_generator(qids)):
            try:
                for linkedPage in page.linkedPages():
                    linked_qid: str = linkedPage.title()

                    if linked_qid[0] != "Q":
                        continue

                    data.append({"qid1": qid, "qid2": linked_qid})

            except pywikibot.exceptions.Error as e:
                logger.warn(f"DownloadWikidataLinks: {type(e).__name__} {e}", e)
                continue
            except ValueError as e:
                logger.warn(f"DownloadWikidataLinks: {type(e).__name__} {e}", e)
                continue
            except TypeError as e:
                logger.warn(f"DownloadWikidataLinks: {type(e).__name__} {e}", e)
                continue

            if i % 10 == 0:
                pages_percent = i * 100 // n_pages
                logger.info(
                    f"DownloadWikidataLinks: {i} / {n_pages} pages ({pages_percent}%)"
                )
                logger.info(f"DownloadWikidataLinks: {time.time()-start_time}s so far.")

                self.set_progress_percentage(pages_percent)  # type:ignore
                self.set_status_message(  # type:ignore
                    f"{i} / {n_pages} pages ({time.time()-start_time}s so far)"
                )

            if TEST_LIMIT > 0 and i > TEST_LIMIT:
                logger.info(
                    f"DownloadWikidataLinks: test page limit set to {TEST_LIMIT}, early stopping!"
                )
                break

        logger.info(f"DownloadWikidataLinks: completed in {time.time()-start_time}s.")

        with self.output().open("w") as f:
            f.write(json.dumps(data))

    def output(self):  # type:ignore
        return LocalTarget("wikidata-links.json")


class DownloadWikipediaLinks(luigi.Task):
    def requires(self):  # type:ignore
        return InitDB(), AddWikipediaURLSToDB()

    def run(self):  # type:ignore

        logger = logging.getLogger("luigi-interface")
        start_time = time.time()

        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            records, _, _ = driver.execute_query(
                """
                    MATCH (n:Entity)
                    WHERE n.wikipediaUrl IS NOT NULL
                    RETURN n.id AS qid 
                """
            )

        qids = [record.get("qid") for record in records]
        n_pages: int = len(qids)
        data: List[Dict[str, str | List[str]]] = []
        site = pywikibot.Site("en", "wikipedia")

        for i, page in enumerate(pages_from_qids_generator(site, qids)):
            try:
                url = page.full_url()

                for link in page.linkedPages():
                    data.append({"page1": url, "page2": link.full_url()})

                # for backlink in page.backlinks():
                #    data.append({"page1": backlink.full_url(), "page2": url})

            except pywikibot.exceptions.Error as e:
                logger.warn(f"DownloadWikipediaLinks: {type(e).__name__} {e}", e)
                continue
            except ValueError as e:
                logger.warn(f"DownloadWikipediaLinks: {type(e).__name__} {e}", e)
                continue
            except TypeError as e:
                logger.warn(f"DownloadWikipediaLinks: {type(e).__name__} {e}", e)
                continue

            if i % 10 == 0:
                pages_percent = i * 100 // n_pages
                logger.info(
                    f"DownloadWikipediaLinks: {i} / {n_pages} pages ({pages_percent}%)"
                )
                logger.info(
                    f"DownloadWikipediaLinks: {time.time()-start_time}s so far."
                )
                self.set_progress_percentage(pages_percent)  # type:ignore
                self.set_status_message(  # type:ignore
                    f"{i} / {n_pages} pages"
                )

            if TEST_LIMIT > 0 and i > TEST_LIMIT:
                logger.info(
                    f"DownloadWikipediaLinks: test page limit set to {TEST_LIMIT}, early stopping!"
                )
                break

        logger.info(f"DownloadWikipediaLinks: completed in {time.time()-start_time}s.")

        with self.output().open("w") as f:
            f.write(json.dumps(data))

    def output(self):  # type:ignore
        return LocalTarget("wikipedia-links.json")


class AddWikidataLinksToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikidataLinks()

    def run(self):  # type: ignore
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("AddWikidataLinksToDB: started")
            start_time = time.time()

            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  'CALL apoc.load.json($path) YIELD value RETURN value',
                  'WHERE value IS NOT NULL
                   WITH value.qid1 AS qid1,
                        value.qid2 AS qid2
                   MATCH (n:Entity {id:qid1})
                   MATCH (m:Entity {id:qid2})
                   MERGE (n)-[:Link {source: "wikidata"}]->(m)
                  ',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params:{path: $path}})
                  YIELD updateStatistics,timeTaken,total,errorMessages
                """,
                path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=100,
                retries=20,
            )

            logger.info(
                f"AddWikidataLinksToDB: completed in {time.time()-start_time}s."
            )
            logger.info(
                f"AddWikidataLinksToDB: DB query status: {[record.data() for record in records]}"
            )
        self.output().open("w").close()

    def output(self):  # type: ignore
        return LocalTarget("add-wikidata-links-to-db.checkpoint")


class AddWikipediaLinksToDB(luigi.Task):
    def requires(self):  # type: ignore
        return InitDB(), DownloadWikipediaLinks()

    def run(self):  # type: ignore
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            logger = logging.getLogger("luigi-interface")
            logger.info("AddWikipediaLinksToDB: started")
            start_time = time.time()

            records, _, _ = driver.execute_query(
                """
                CALL apoc.periodic.iterate(
                  'CALL apoc.load.json($path) YIELD value RETURN value',
                  'WHERE value IS NOT NULL
                   WITH value.page1 AS page1,
                        value.page2 AS page2

                   MATCH (n:Entity {wikipediaUrl:page1})
                   MATCH (m:Entity {wikipediaUrl:page2})
                   MERGE (n)-[:Link {source:"wikipedia"}]->(m)',
                  {batchSize: $batch_size, retries:$retries, parallel:true,params:{path: $path}})
                  YIELD updateStatistics,timeTaken,total,errorMessages
                """,
                path=f"file:///host/{os.path.realpath(str(self.input()[1].path))}",
                batch_size=100,
                retries=20,
            )

            logger.info(
                f"AddWikipediaLinksToDB: completed in {time.time()-start_time}s."
            )
            logger.info(
                f"AddWikipediaLinksToDB: DB query status: {[record.data() for record in records]}"
            )
        self.output().open("w").close()

    def output(self):  # type: ignore
        return LocalTarget("add-wikipedia-links-to-db.checkpoint")
