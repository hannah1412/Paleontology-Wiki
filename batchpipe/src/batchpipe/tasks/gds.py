"""
Tasks for generating metrics using neo4j graph data science

nd60
"""

import logging

import luigi
from neo4j import GraphDatabase

from batchpipe import NEO4J_AUTH, NEO4J_URI

from .relationships import CheckpointAllLinksInDB


class CheckpointGraphMetricsGenerated(luigi.WrapperTask):
    def requires(self):
        return [InitGDSGraph(), GeneratePageRank()]


class GeneratePageRank(luigi.Task):
    """
    Writes the pagerank of each node to the property pageRank.
    """

    def requires(self):
        return [InitGDSGraph()]

    def run(self):
        logger = logging.getLogger("luigi-interface")
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:

            driver.execute_query("MATCH (n:Entity) REMOVE n.pageRank")

            records, _, _ = driver.execute_query(
                """
                CALL gds.pageRank.write('pagelinks', {
                    maxIterations: 20,
                    dampingFactor: 0.85,
                    writeProperty: 'pageRank',
                    scaler: "MEAN" 
                })
                YIELD nodePropertiesWritten, ranIterations
                """
            )

            for record in records:
                logger.info(f"GeneratePageRank: {record.data()}")

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("generate-page-rank.checkpoint")


class InitGDSGraph(luigi.Task):
    """
    Initialise the graph representation used by the neo4j graph data science (GDS) library.
    This is called pagelinks.
    """

    def requires(self):
        return [CheckpointAllLinksInDB()]

    def run(self):
        with GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH) as driver:

            # drop the graph if it exists (for idempotency)
            driver.execute_query(
                """
                CALL gds.graph.drop('pagelinks', false)
                """
            )

            driver.execute_query(
                """
                CALL gds.graph.project('pagelinks', 'Entity','Link')
                """
            )

        self.output().open("w").close()

    def output(self):  # type: ignore
        return luigi.LocalTarget("init-gds-graph.checkpoint")
