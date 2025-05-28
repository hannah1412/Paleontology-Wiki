"""
Init function ran on package import.

    1. Load environment variables from .env if it exists, otherwise error.
    2. Test the database connection.


This package is usually run by pointing luigi to a specific task class.
Therefore, there is no good main method to put this stuff in.
"""

import rich
import os
import sys
from pathlib import Path
from rich.console import Console
from dotenv import load_dotenv
import neo4j
from neo4j import GraphDatabase

console = Console()


def init():
    console.print(f"[bold bright_white]:star: Initialising batchpipe.")

    package_dir: Path = Path(__file__).parent.absolute()
    env_file: Path = package_dir.joinpath("../../../.env").resolve()

    if not env_file.exists():
        console.print(
            f"[bold bright_red]:exclamation_mark: Error: expected .env file at [/bold bright_red][bright_white]{str(env_file)}[/bright_white][bold bright_red] but this does not exist.[/bold bright_red]"
        )
        sys.exit(1)

    any_variables_set = load_dotenv(env_file)

    if not any_variables_set:
        console.print(
            f"[yellow bold]:warning: Warning: .env does not seem to contain any variables."
        )
    else:
        console.print(f":thumbsup: [green bold].env file loaded successfully.")

    ###########################################
    #        Can we connect to the DB?        #
    ###########################################

    uri = f"bolt://{os.environ['BATCHPIPE_ADDRESS']}:{os.environ['BATCHPIPE_DB_BOLT']}"
    user = "neo4j"
    passwd = os.environ["BATCHPIPE_DB_PASSWORD"]

    console.print(
        f"[bold bright_white]:star: Trying to connect to Neo4j DB. Is the Docker container running?"
    )
    console.print(f"[bold bright_white]   DB url: {uri} user: {user}")

    # print shorter traceback if database does not connect - we do not want the
    # extra info, just the top level exception
    sys.tracebacklimit = 0

    with GraphDatabase.driver(uri=uri, auth=(user, passwd)) as driver:
        try:
            driver.verify_connectivity()
        except Exception as e:
            console.print(
                f"[bold bright_red]:exclamation_mark: Error connecting to DB."
            )
            console.print(f"\n{e}\n")
            sys.exit(1)

    console.print(f"[bold bright_green]:thumbsup: I can connect to DB.")

    # revert this now
    sys.tracebacklimit = 1000

    ########################
    #        Done!!        #
    ########################

    console.print(f":smile:[green bold] batchpipe initialised successfully!")
