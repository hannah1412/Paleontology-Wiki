from .init import init
import os

init()

NEO4J_AUTH = ("neo4j", os.environ["BATCHPIPE_DB_PASSWORD"])
NEO4J_URI = (
    f"bolt://{os.environ['BATCHPIPE_ADDRESS']}:{os.environ['BATCHPIPE_DB_BOLT']}"
)

del os
