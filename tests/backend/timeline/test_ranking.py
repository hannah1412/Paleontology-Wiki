from backend import timeline


entry1 = {'label': "Triceratops", #535148
              'startTime' : '-101000000-01-01T00:00:00Z'}
entry2 = {'label': "Coryloides hancockii", #89
              'startTime' : '-107000000-01-01T00:00:00Z'} 
entry3 = {'label': "Regnosaurus", #3611
              'startTime' : '-114000000-01-01T00:00:00Z'}
entry4 = {'label': "Multituberculata", #38540
              'startTime' : '-116000000-01-01T00:00:00Z'}
entry5 = {'label': "Eutriconodonta", #14926
              'startTime' : '-123000000-01-01T00:00:00Z'}
entry6 = {'label':"Sinoconodon", #8507
              'startTime' : '-127000000-01-01T00:00:00Z'}
entry7 = {'label':"Entelodon", #17286
              'startTime' : '-132000000-01-01T00:00:00Z'}
entry8 = {'label':"Baphetidae", #5699
              'startTime' : '-138000000-01-01T00:00:00Z'}
entry9 = {'label':"Macrurosaurus", #3115
              'startTime' : '-141000000-01-01T00:00:00Z'}
entry10 = {'label': "Ardipithecus kadabba", #14792
               'startTime' : '-147000000-01-01T00:00:00Z'}
entry11 = {'label':"Leptictida", #9615 
               'startTime' : '-154000000-01-01T00:00:00Z'}
entry12 = {'label':"Placodermi", #101067
               'startTime' : '-159000000-01-01T00:00:00Z'}
entry13 = {'label':"Australopithecus afarensis cumio", #1
               'startTime' : '-162000000-01-01T00:00:00Z'}
entry14 = {'label':"Dromaeosaurus", # 56715
               'startTime' : '-168000000-01-01T00:00:00Z'}
entry15 = {'label': "Niobrarasaurus" , #4285
               'startTime' : '-173000000-01-01T00:00:00Z'}
entry16 = {'label':"Macrogryphosaurus"  , #7152
               'startTime' : '-179000000-01-01T00:00:00Z'}
entry17 = {'label': "Dicraeosaurus", #12331
               'startTime' : '-184000000-01-01T00:00:00Z'}
entry18 = {'label': "Hyaenodon", #38535
               'startTime' : '-188000000-01-01T00:00:00Z'}
entry19 = {'label': "Brachytrachelopan", #12584
               'startTime' : '-191000000-01-01T00:00:00Z'}
entry20 = {'label':"Proterosuchidae" , #10533
               'startTime' : '-196000000-01-01T00:00:00Z'}
entry21 = {'label': "Pachyrhinosaurus" , #70104
               'startTime' : '-201000000-01-01T00:00:00Z'}
entry22 = {'label': "Greererpeton", #3215
               'startTime' : '-203000000-01-01T00:00:00Z'}
    

start_time = '-100000000-01-01T00:00:00Z'
end_time = '-200000000-01-01T00:00:00Z'
n = 10


def test_ranking_returns_list():
    '''Test function returns the correct data type.'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    ranked_data = timeline.ranking(start_time, end_time, n, small_data)
    assert type(ranked_data) == list
    
def test_ranking_result_lengths():
    '''Test the function returns the correct number of results.'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    ranked_data = timeline.ranking(start_time, end_time, n, small_data)
    assert len(ranked_data) == 10

def test_ranking_small_dataset():
    '''Test the function returns the correct entries according to the given time points with small dataset(22).'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]

    result = timeline.ranking(start_time, end_time, n, small_data)
    expectedResult = [entry1, entry2, entry5, entry7, entry9, entry10, entry12, entry14, entry16, entry19]
    assert result == expectedResult


def test_ranking_small_dataset_less_timePoints():
    '''Test the function returns the correct entries according to the small given time points with small dataset(22).'''
    n=5

    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data)
    expectedResult = [entry1, entry5, entry9, entry12, entry16]
    assert result == expectedResult

def test_ranking_small_dataset_popularity75():
    '''Test the function returns the correct entries with popularity rank weighting 75%'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data, False, 0.75)
    expectedResult = [entry1, entry2, entry5, entry7, entry9, entry10, entry12, entry14, entry16, entry19]
    assert result == expectedResult

def test_ranking_small_dataset_popularity25():
    '''Test the function returns the correct entries with popularity rank weighting 25%'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data, False, 0.25)
    expectedResult = [entry1, entry2, entry5, entry7, entry9, entry10, entry12, entry14, entry16, entry19]
    assert result == expectedResult


def test_ranking_small_dataset_popularity0():
    '''Test the function returns the correct entries with popularity rank weighting 0%'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data, False, 0)
    expectedResult = [entry1, entry2, entry5, entry7, entry9, entry10, entry12, entry14, entry16, entry19]
    assert result == expectedResult


def test_ranking_small_dataset_popularity100():
    '''Test the function returns the correct entries with popularity rank weighting 100%'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data, False, 1)
    expectedResult = [entry1, entry12, entry21, entry14, entry4, entry18, entry7, entry5, entry10, entry19]
    assert result == expectedResult


def test_ranking_small_dataset_reversePopularity():
    '''Test the function returns the correct entries with reversed populairty rank (least popular)'''
    small_data = [entry1, entry2, entry3, entry4, entry5, entry6, entry7, entry8, entry9, entry10, entry11, entry12, entry13, entry14, entry15, entry16, entry17, entry18, entry19, entry20, entry21, entry22]
    result = timeline.ranking(start_time, end_time, n, small_data, True)
    expectedResult = [entry1, entry2, entry5, entry7, entry9, entry10, entry13, entry14, entry16, entry19]
    assert result == expectedResult
