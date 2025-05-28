from flask import Blueprint, Response, jsonify, send_file, request
from apscheduler.schedulers.background import BackgroundScheduler
import subprocess
import json
from cladogram.update_classification import Node

cladogram_blueprint = Blueprint("cladogram", __name__)
scheduler = BackgroundScheduler()


def create_summary(node, references):
    """
    Creates a summary for the given node.
    """
    if node.parent_id == None:
        return {
            "name": node.name,
            "id": node.id,
            "children": [{"name": child.name, "id": child.id} for child in node.children],
        }

    parent = references[node.parent_id]

    summary = {
        "name": parent.name,
        "id": parent.id,
        "children": [{"name": child.name, "id": child.id} for child in parent.children if child.id != node.id],
    }
    _node = {
        "name": node.name,
        "id": node.id,
        "children": [{"name": child.name, "id": child.id} for child in node.children],
    }
    summary["children"].append(_node)

    return summary


def create_tree(filename):
    """
    Deserializes the tree from the given filename.
    """
    with open(filename, "rb") as f:
        references = {}
        return Node.from_dict(json.load(f), references), references


def update_json():
    """
    Updates the json file with the latest data from wikidata.
    """
    subprocess.Popen(["python3.11", "cladogram/update_classification.py"])
scheduler.add_job(update_json, "interval", hours=24)
scheduler.start()
update_json()


# CORS
@cladogram_blueprint.after_request
def after_request(response: Response):
    """
    Adds headers to the response to allow cross origin requests.
    """
    header = response.headers
    header["Access-Control-Allow-Origin"] = "*"

    return response


@cladogram_blueprint.route("/<classification>", methods=["GET"])
def get_tree(classification):
    """
    Returns the tree for the given classification.
    """
    expanded = request.args.get("expanded")
    root_id = request.args.get("root_id")

    try:
        root, references = create_tree(f"cladogram/data/{classification}.json")

        if root_id:
            try:
                root = references[root_id]
            except KeyError:
                return jsonify({"msg": "Tree not found for this root"}), 404

        if expanded:
            return jsonify(root.to_dict()), 200
        else:
            return jsonify(root.to_base_dict()), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 404


@cladogram_blueprint.route("/summary/<id>", methods=["GET"])
def get_summary(id):
    """
    Returns the summary for the given id.
    """
    try:
        summary = {}

        try:
            root, references = create_tree("cladogram/data/benton.json")
            node = references[id]
            summary.update({"benton": create_summary(node, references)})
        except KeyError:
            pass
        
        try:
            root, references = create_tree("cladogram/data/bnb.json")
            node = references[id]
            summary.update({"bnb": create_summary(node, references)})
        except KeyError:
            pass
        
        try:
            root, references = create_tree("cladogram/data/wdo.json")
            node = references[id]
            summary.update({"wdo": create_summary(node, references)})
        except KeyError:
            pass
            
        if summary == {}:
            raise Exception("No summary found")

        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"msg": str(e)}), 404


@cladogram_blueprint.route("/easter-egg", methods=["GET"])
def get_infraorder():
    """
    Returns the infraorder classification.
    """
    try:
        return send_file("cladogram/data/infra.json"), 200
    except Exception as e:
        return jsonify({"msg": "Not quite sure what happened"}), 500


@cladogram_blueprint.route("/easter-egg/<filename>", methods=["GET"])
def get_image(filename):
    """
    Returns the image for the given id.
    """
    try:
        return send_file(f"cladogram/easter-egg/{filename}"), 200
    except Exception as e:
        return jsonify({"msg": "Image not found"}), 404


@cladogram_blueprint.route("/3d/<name>", methods=["GET"])
def get_3dModel(name):
    """
    Returns a file used in the 3d objects page.
    """
    name = "/".join(name.split("|"))
    try: 
        return send_file(f"cladogram/models/3d/{name}.glb"), 200
    except Exception as e:
        return jsonify({"msg":"Model not found"}), 404