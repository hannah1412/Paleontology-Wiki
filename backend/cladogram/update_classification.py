import requests
import json
import time
import os
import sys

retry_count = 0


def capatalize_first_letter(string):
    """
    Capatalizes the first letter of the given string.
    """
    return string[0].upper() + string[1:]


class Node:
    """
    A serializable node class to represent a clade in a cladogram tree.
    """
    # Counter to assign unique ids to nodes
    counter = 1

    # Create a new node
    def __init__(self, id, name, taxon_rank, in_base, parent_id):
        self.id = id
        self.name = name
        self.taxon_rank = taxon_rank
        self.parent_id = parent_id
        self.children = []
        self.in_base = in_base

    # Add a child to the node
    def add_child(self, node):
        self.children.append(node)
    
    # Convert the node to a dictionary
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "taxon_rank": self.taxon_rank,
            "parent_id": self.parent_id,
            "children": [child.to_dict() for child in self.children],
            "in_base": self.in_base,
        }
    
    # Convert the node to a dictionary adding children where in_base is true
    def to_base_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "taxon_rank": self.taxon_rank,
            "parent_id": self.parent_id,
            "children": [child.to_base_dict() for child in self.children if child.in_base],
            "in_base": self.in_base,
        }

    # Convert the node from a dictionary
    @classmethod
    def from_dict_recursive(cls, data, references):
        node = cls(data["id"], data["name"], data["taxon_rank"], data["in_base"], data["parent_id"])
        references[data["id"]] = node
        for child in data["children"]:
            node.add_child(cls.from_dict_recursive(child, references))
        return node
    
    @classmethod
    def from_dict(cls, data, references):
        node = cls.from_dict_recursive(data, references)
        return node


def fetch_qnumber(name):
    """
    Fetches the qnumber of the given taxon name from wikidata, assuming the
    first search result is the correct one.
    """
    try:
        query = "https://www.wikidata.org/w/api.php"
        response = requests.get(
            query,
            params={
                "action": "wbsearchentities",
                "search": name,
                "language": "en",
                "format": "json",
            },
        )
        if response.status_code != 200:
            if response.status_code == 429:
                global retry_count
                retry_count += 1
                if retry_count > 5:
                    sys.exit(1)

                # Rate limit exceeded
                return "-429"
            return "-1"
        data = response.json()

        if len(data["search"]) == 0:
            return "-1"
        qnumber = data["search"][0]["id"]
        return qnumber
    except Exception as e:
        print(f"Exception: {e}", flush=True)
        return "-1"


def fetch_children(search_stack, parent, get_subfamily=False):
    """
    Fetches the children of the given parent node and adds them to the search
    stack.
    """
    # Sleep to avoid rate limiting on the paleobiodb api
    time.sleep(2.5)

    try:
        ranks = "genus,species"
        if get_subfamily:
            ranks = "subfamily,genus,species"
        if parent.taxon_rank == "genus":
            ranks = "species"
        query = f"""
            https://paleobiodb.org/data1.2/taxa/list.json?base_name={parent.name}&immediate&taxon_status=valid&pres=regular&rel=children&rank={ranks}
        """
        response = requests.get(query)
        if response.status_code != 200:
            if response.status_code == 429:
                global retry_count
                retry_count += 1
                if retry_count > 5:
                    sys.exit(1)

                # Rate limit exceeded
                time.sleep(600)
                fetch_children(search_stack, parent, get_subfamily)
                return
            return
        data = response.json()

        for record in data["records"]:
            if record["nam"] == parent.name:
                # Prevent infinite loops
                continue

            name = record["nam"]
            if record["rnk"] == 5:
                taxon_rank = "genus"
            elif record["rnk"] == 3:
                taxon_rank = "species"
            else:
                taxon_rank = "unranked"

            id = fetch_qnumber(name)
            if id == "-429":
                # Rate limit exceeded
                time.sleep(600)
                fetch_children(search_stack, parent, get_subfamily)
                return
            if id == "-1":
                Node.counter += 1
                id = "L" + str(Node.counter)

            if taxon_rank == "species":
                name = name.split(" ", 1)
                if len(name) > 1:
                    name = name[0][0] + ". " + name[1]

            child = Node(id, capatalize_first_letter(name), capatalize_first_letter(taxon_rank), False, parent.id)
            parent.add_child(child)

            if taxon_rank != "species":
                search_stack.append(child)
    except Exception as e:
        print(f"Exception: {e}", flush=True)


def expand_tree(root, get_subfamily=False):
    """
    Expands the given tree with genus and species using paleobiodb.
    """
    search_stack = [root]
    while search_stack:
        current = search_stack.pop()
        search_stack.extend(current.children)

        if current.name == "Dinosauria" or current.name == "Aves":
            continue

        fetch_children(search_stack, current, get_subfamily)

    return root


def create_node(data, parent_id):
    """
    Creates a node from a json file of d3 format.
    """
    id = fetch_qnumber(data["name"])
    if id == "-1":
        Node.counter += 1
        id = "L" + str(Node.counter)

    node = Node(id, capatalize_first_letter(data["name"]), capatalize_first_letter(data["taxon_rank"]), True, parent_id)
    for child in data["children"]:
        node.add_child(create_node(child, id))
    return node


def create_tree(filename, get_subfamily=False):
    """
    Creates a tree from a json file of d3 format, expanding the base with genus
    and species using paleobiodb.
    """
    with open(filename, "r") as f:
        data = json.load(f)
    root = create_node(data, None)
    return expand_tree(root, get_subfamily)


def create_infraorder(root):
    """
    Creates a dictionary mapping infraorders to a list of species.
    Note infraorders can be found at any point in the tree path.
    """
    infraorder = {}
    infraorder.update({"other": []})

    search_stack = [root]
    while search_stack:
        current = search_stack.pop()

        if current.taxon_rank == "Infraorder":
            _infra = current.name
            infraorder.update({_infra: []})

            second_search_stack = [current]
            while second_search_stack:
                _current = second_search_stack.pop()

                if os.path.isfile(f"cladogram/images/ModelShots/{_current.id}.png"):
                    infraorder[_infra].append({
                        "name": _current.name,
                        "id": _current.id,
                    })
                second_search_stack.extend(_current.children)
        else:
            if os.path.isfile(f"cladogram/images/ModelShots/{current.id}.png"):
                infraorder["other"].append({
                    "name": current.name,
                    "id": current.id,
                })
            search_stack.extend(current.children)
    return infraorder


if __name__ == "__main__":
    filepath = "cladogram/data/"

    try:
        tree = create_tree(filepath + "benton_base.json", get_subfamily=True)
        with open(filepath + "benton.json", "w") as f:
            json.dump(tree.to_dict(), f)
        with open(filepath + "infra.json", "w") as f:
            infraorder = create_infraorder(tree)
            json.dump(infraorder, f)
    except Exception as e:
        print(f"Exception: {e}", flush=True)

    try:
        tree = create_tree(filepath + "bnb_base.json")
        with open(filepath + "bnb.json", "w") as f:
            json.dump(tree.to_dict(), f)
    except Exception as e:
        print(f"Exception: {e}", flush=True)

    try:
        tree = create_tree(filepath + "wdo_base.json")
        with open(filepath + "wdo.json", "w") as f:
            json.dump(tree.to_dict(), f)
    except Exception as e:
        print(f"Exception: {e}", flush=True)
