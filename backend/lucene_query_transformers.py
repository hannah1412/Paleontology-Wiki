"""
File: lucene_query_transformers.py
Author: nd60
Description: Functions to transform Apache Lucene Search queries.
"""

__all__ = ["process_query"]

from luqum.parser import parser
from luqum.visitor import TreeTransformer, TreeVisitor
from luqum.tree import (
    BaseGroup,
    Word,
    Phrase,
    Fuzzy,
    Proximity,
    SearchField,
    OrOperation,
    Group,
    FieldGroup,
    Boost,
    BaseOperation,
)
from luqum.pretty import prettify
from luqum.auto_head_tail import auto_head_tail
from collections.abc import Iterator


BOOST_AMOUNT = 3


def process_query(query: str, fuzzy: bool = True) -> str:
    """
    Processes a search query ready for use with our database.

    This function encapsulates all transformations needed before
    a query can be processed by our database.

    It also provides optional support for turning an exact search into a fuzzy
    search.
    """
    ast = parser.parse(query)

    ast = FieldNameTransformer().visit(ast)

    if fuzzy:
        ast = _make_fuzzy(ast)

    ast = _maybe_boost_title(ast)

    return prettify(auto_head_tail(ast))


def _make_fuzzy(ast):
    """
    Converts a lucene ast to fuzzy search, returning the fuzzified query.

    This is achieved by adding the ~ fuzzy operator to all non-fuzzy words and
    prhases in the query.
    """

    transformer = FuzzyTransformer()
    new_ast = transformer.visit(ast)
    return new_ast


def _maybe_boost_title(ast):
    """
    If the given query contains no search field, the query is transformed so
    that title maches are given precedence in search results.

    If the query has search fields, no transformation occurs.
    """
    if _has_search_field(ast):
        return ast
    transformer = TitleBoostTransformer()
    return transformer.visit(ast)


class FuzzyTransformer(TreeTransformer):
    """
    Transforms Word -> Fuzzy(Word), and Phrase -> Proximity(Phrase)
    """

    def visit_word(self, word: Word, ctx) -> Iterator[Fuzzy]:
        yield Fuzzy(word)

    def visit_phrase(self, phrase: Phrase, ctx) -> Iterator[Proximity]:
        yield Proximity(phrase)

    # NOTE (nd60): This is requried for us to add the fuzzy operator to
    # something that already has it. We don't want foo~ to turn into foo~~ as
    # that is a meaningless query. This relies on the fact that a visit method
    # must call visit on its children manually if it wants them to be visited
    # too. We don't want to see inside any existing Fuzzy or  Proximity nodes,
    # so we ensure to visit them non-recursively.
    def visit_fuzzy(self, fuzzy: Fuzzy, _) -> Iterator[Fuzzy]:
        yield fuzzy

    # same as above but for Phrase / Proximity.
    def visit_proximity(self, proximity: Proximity, _) -> Iterator[Proximity]:
        yield proximity


class FieldNameTransformer(TreeTransformer):
    """
    Turns user-friendly field names into ones that our Neo4J database
    understand.

    This is necessary as Neo4J expects field names that exactly match the name
    of node properties. However, this is not convenient from a UX standpoint.

    This allows us to:

    1. alias nodes - e.g. a user can do name:foo as well as label:foo
    2. have composite fields not directly in the database: e.g. desc:foo to
    search shortDescription and wikipedia description.
    """

    def visit_search_field(
        self, node: SearchField, _
    ) -> Iterator[SearchField | OrOperation]:
        match node.name.lower():
            case "desc" | "description":
                yield OrOperation(
                    SearchField("shortDescription", node.expr),
                )

            case "name" | "title" | "label":
                yield SearchField("label", node.expr)

            case "text" | "content" | "article":
                yield OrOperation(
                    SearchField("wikipediaPlainText", node.expr),
                    SearchField("wikipediaDescription", node.expr),
                    Boost(SearchField("shortDescription", node.expr), 2),
                    # SearchField("label", node.expr),
                )

            # convert to lower case
            case x:
                yield SearchField(x, node.expr)


def _has_search_field(ast) -> bool:
    visitor = HasFieldVisitor()
    ctx = {"global": {"exists": False}}
    visitor.visit(ast, ctx)
    return ctx["global"]["exists"]


# as recommended by the docs, store global stuff inside a dict inside context.
class HasFieldVisitor(TreeVisitor):
    def visit_search_field(self, n: SearchField, ctx: dict[str, dict[str, bool]]):

        ctx["global"]["exists"] = True
        yield n


class TitleBoostTransformer(TreeTransformer):
    def visit_item(self, node, ctx):
        if isinstance(node, BaseOperation):
            yield from self.generic_visit(node, ctx)
        else:
            yield OrOperation(
                Group(node), Boost(SearchField("label", FieldGroup(node)), BOOST_AMOUNT)
            )


# vim: cc=80 tw=80
