"""
Tasks used for setting up search indexes
"""

__all__ = ["SetupFullTextSearchIndex"]

from .populate_db import (
    InitDB,
    AddWikidataDescriptionsToDB,
    AddWikipediaDescriptionsToDB,
    AddWikipediaWikiTextToDB,
)

from batchpipe import NEO4J_URI, NEO4J_AUTH
import luigi
from neo4j import GraphDatabase


class SetupFullTextSearchIndex(luigi.Task):
    def requires(self):  # type: ignore
        return [
            AddWikidataDescriptionsToDB(),
            AddWikipediaWikiTextToDB(),
            AddWikipediaDescriptionsToDB(),
            InitDB(),
        ]

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:
            driver.execute_query(
                "CREATE FULLTEXT INDEX search FOR (n:Entity) ON EACH [n.shortDescription,n.label,n.id,n.wikipediaDescription,n.wikipediaPlainText]"
            )
        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("setup-full-text-search-index.checkpoint")
