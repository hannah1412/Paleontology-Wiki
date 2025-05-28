"""
visualise the dependency tree with 
python3 -m batchpipe.vis
"""

import luigi.tools.deps_tree as deps_tree

from .tasks.pipeline import Pipeline

if __name__ == "__main__":
    print("PIPELINE TREE:")
    print(deps_tree.print_tree(Pipeline()))
