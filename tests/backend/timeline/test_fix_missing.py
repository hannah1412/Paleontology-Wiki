from backend import timeline


def test_gives_right_format_get_endtime_from_parent_img_url_from_grandparent():
    '''Test the function when endTime and imgURL is missing'''
    data = {"head": {"vars": ['id', 'label', 'startTime', 'endTime', 'rankLabel', 'firstParentLabel', 'firstImgURL']}, 
            "results": {"bindings": 
                [
                {'id': {'type': 'literal', 'value': 'T123456'}, 'label': {'xml:lang': 'en', 'type': 'literal', 'value': 'Test'}, 'startTime': {'datatype': 'http://www.w3.org/2001/XMLSchema#dateTime', 'type': 'literal', 'value': '-176000000-01-01T00:00:00Z'}, 
                    'rankLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'species'}, 'firstParentLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'TestParent'}},
                {'id': {'type': 'literal', 'value': 'T122334'},'label': {'xml:lang': 'en', 'type': 'literal', 'value': 'TestParent'}, 'startTime': {'datatype': 'http://www.w3.org/2001/XMLSchema#dateTime', 'type': 'literal', 'value': '-175000000-01-01T00:00:00Z'}, 'endTime': {'datatype': 'http://www.w3.org/2001/XMLSchema#dateTime', 'type': 'literal', 'value': '-23000000-01-01T00:00:00Z'}, 
                    'rankLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'genus'}, 'firstParentLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'TestGrandparent'}},
                {'id': {'type': 'literal', 'value': 'T133445'},'label': {'xml:lang': 'en', 'type': 'literal', 'value': 'TestGrandparent'}, 'startTime': {'datatype': 'http://www.w3.org/2001/XMLSchema#dateTime', 'type': 'literal', 'value': '-174000000-01-01T00:00:00Z'}, 'endTime': {'datatype': 'http://www.w3.org/2001/XMLSchema#dateTime', 'type': 'literal', 'value': '-23100000-01-01T00:00:00Z'}, 
                    'rankLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'family'}, 'firstParentLabel': {'xml:lang': 'en', 'type': 'literal', 'value': 'TestGreatGrandparent'}, 'firstImgURL': {'type': 'uri', 'value': 'http://commons.wikimedia.org/wiki/Special:FilePath/Ischyodus%20avitus.jpg'}}
                ]
                }}
    timeline.wikidata_cache = {}
    timeline.wikidata_cache['test'] = timeline.format_data(data, "species", 'test')
    timeline.fix_missing(0)
    timeline.fix_missing(0)
    expected_result = [{'id':'T123456', 'label': 'Test', 'startTime': '-176000000-01-01T00:00:00Z', 'rankLabel': 'species', 'firstParentLabel': 'TestParent', 'endTime': '-23000000-01-01T00:00:00Z', 'imgURL' : 'http://commons.wikimedia.org/wiki/Special:FilePath/Ischyodus%20avitus.jpg'}]
    
    assert timeline.wikidata_cache['test'] == expected_result
