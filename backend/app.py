from flask import Flask
from flask_cors import CORS, cross_origin

import os
from search import search_blueprint
from article import article_blueprint
from timeline import timeline_blueprint
from map import map_blueprint
from cladogram.cladogram import cladogram_blueprint

from cache import cache

# Create top level flask app
app = Flask(__name__)

cache.init_app(app)

# Register sub app blueprints
app.register_blueprint(search_blueprint, url_prefix="/search")
app.register_blueprint(article_blueprint, url_prefix="/article/")
app.register_blueprint(timeline_blueprint, url_prefix="/timeline")
app.register_blueprint(map_blueprint, url_prefix="/map")
app.register_blueprint(cladogram_blueprint, url_prefix="/cladogram")

# Setup cross origin
# See https://flask-cors.readthedocs.io/en/3.0.7/
# https://flask-cors.corydolphin.com/en/latest/api.html#using-cors-with-blueprints
CORS(app)

# development server
# remember to source .env before running if not through docker!
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=os.environ["BACKEND_PORT"])
