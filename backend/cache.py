from flask_caching import Cache

cache = Cache(
    config={"DEBUG": True, "CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 0}
)
