from backend import timeline
import json


f = open("tests/backend/timeline/samples/wikipedia_views_cache.json")
wikipedia_cache = json.load(f)
f.close()

timeline.wikipedia_views_cache = wikipedia_cache
#"Triceratops": 535148
#"Coryloides hancockii": 89
#"ZeroForTesting":0
entry1 = {'label': "Triceratops"}
entry2 = {'label': "Coryloides hancockii"}
entry3 = {'label': "ZeroForTesting"}
entry4 = {'label': "NotExist"}


def test_return_int():
    '''Test if the function returns the correct type'''
    wiki_rank = timeline.get_wikipedia_rank(entry1)
    assert type(wiki_rank) == int

def test_existing_entry():
    '''Test the function with existing entry'''
    assert timeline.get_wikipedia_rank(entry1) == int(10000000/(535148 + 1))

def test_non_existing_entry():
    '''Test the function with non-existing entry'''
    assert timeline.get_wikipedia_rank(entry4) == 10000000

def test_less_views():
    '''Test the function when a given entry has small number of views'''
    assert timeline.get_wikipedia_rank(entry2) == int(10000000/(89 + 1))

def test_zero_views():
    '''Test the function when a given entry has 0 views'''
    assert timeline.get_wikipedia_rank(entry3) == int(10000000/(0 + 1))







    


