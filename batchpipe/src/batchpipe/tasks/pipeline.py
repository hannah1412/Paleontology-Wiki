from .search_indexing import SetupFullTextSearchIndex
from .populate_db import CheckpointAllDataInDB
from .relationships import CheckpointAllLinksInDB
from .gds import CheckpointGraphMetricsGenerated
import luigi

__all__ = ["Pipeline"]

"""
The main pipeline that is run!
Add tasks using yield
"""


class Pipeline(luigi.WrapperTask):
    def requires(self):  # type: ignore
        return (
            CheckpointGraphMetricsGenerated(),
            CheckpointAllDataInDB(),
            CheckpointAllLinksInDB(),
            SetupFullTextSearchIndex(),
        )
