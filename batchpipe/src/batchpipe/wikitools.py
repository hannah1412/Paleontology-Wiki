from collections.abc import Generator, Iterable

import pywikibot
from pywikibot import BaseSite, ItemPage, Page

"""
A generator over all pages in the given pywikidata Site that correspond to the
given Wikidata qids.

Any qids that do not have an associated id in the given site are ignored.
"""


def pages_from_qids_generator(
    site: BaseSite, qids: Iterable[str]
) -> Generator[Page, None, None]:
    for qid in qids:
        page: Page = site.page_from_repository(qid)
        if page is not None and page.exists():
            yield page


def wikidata_items_from_qids_generator(
    qids: Iterable[str],
) -> Generator[tuple[str, ItemPage], None, None]:
    site = pywikibot.Site("wikidata")
    for qid in qids:
        page = pywikibot.ItemPage(site, qid)
        if page is not None and page.exists():
            yield (qid, page)


def preloading_with_templates_generator(
    generator: Iterable[Page], groupsize: int = 50, quiet: bool = False
) -> Generator[Page, None, None]:
    # dirct copy of the one from pywikibot, but trancludes templates for us!
    sites = {}
    # build a list of pages for each site found in the iterator
    for page in generator:
        site = page.site
        sites.setdefault(site, []).append(page)

        groupsize = min(groupsize, site.maxlimit)
        if len(sites[site]) >= groupsize:
            # if this site is at the groupsize, process it
            group = sites.pop(site)
            yield from site.preloadpages(
                group, groupsize=groupsize, quiet=quiet, templates=True
            )

    for site, pages in sites.items():
        # process any leftover sites that never reached the groupsize
        yield from site.preloadpages(
            pages, groupsize=groupsize, quiet=quiet, templates=True
        )
