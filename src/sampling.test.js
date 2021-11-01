const { shuffleSubarrs, indicesOverlap, indicesTwice, sample } = require('./sampling');


test('shuffleSubarrs test 1/2', () => {
  // scenario
  const arrs = [[1, 2, 3], [4, 5, 6]];
  const out = shuffleSubarrs(arrs);
  // check
  for(var i = 0; i < out.length; i++){
    for(var v of out[i]){
      expect( arrs[i].includes(v) ).toBe(true);
    }
  }
});
test('shuffleSubarrs test 2/2', () => {
  // scenario
  const arrs = [[1, 2, 3], [4, 5, 6]];
  const n_items = 3;
  const n_sets = 2;
  const out = shuffleSubarrs(arrs, n_sets, n_items);
  // check
  for(var i = 0; i < out.length; i++){
    for(var v of out[i]){
      expect( arrs[i].includes(v) ).toBe(true);
    }
  }
});



test('indicesOverlap test 1/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 0;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: No overlap possible with n_items=0.');
});
test('indicesOverlap test 2/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 1;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: No overlap possible with n_items=1.');
});
test('indicesOverlap test 3/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 2;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: Zero BWS sets requested.');
});
test('indicesOverlap test 4/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 1;
  const n_items = 2;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([[0, 1]]);
  expect(n_examples).toBe(2);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: Only one BWS set requested.');
  //console.log(bwsindices)
});
test('indicesOverlap test 5/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 2;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]]);
  expect(n_examples).toBe(4);
});
test('indicesOverlap test 6/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 3;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual(
    [[0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0]]
  );
  expect(n_examples).toBe(8);
});
test('indicesOverlap test 7/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual(
    [[0, 1, 2, 3], [3, 4, 5, 6], [6, 7, 8, 9], [9, 10, 11, 0]]
  );
  expect(n_examples).toBe(12);
});
test('indicesOverlap test 8/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 5;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([
      [0, 1, 2, 3, 4], [4, 5, 6, 7, 8],
      [8, 9, 10, 11, 12], [12, 13, 14, 15, 0]
  ]);
  expect(n_examples).toBe(16);
});
test('indicesOverlap test 9/10', () => {
  // scenario
  const n_sets = 1000;
  const n_items = 6;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(1000);
  expect(bwsindices[0].length).toBe(6);
  expect(n_examples).toBe( n_sets * (n_items - 1) );
});
test('indicesOverlap test 10/10', () => {
  // scenario
  const n_sets = 100;
  const n_items = 5;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesOverlap(n_sets, n_items, shuffle)
  // prepare
  var idx1 = []
  bwsindices.forEach(list => {
    idx1 = idx1.concat(list)
  });
  const idx2 = [...Array(n_examples).keys()];
  // check
  for(var i of idx1){
    expect( idx2.includes(i) ).toBe(true);
  }
  for(var i of idx2){
    expect( idx1.includes(i) ).toBe(true);
  }
});



test('indicesTwice test 1/6', () => {
  // scenario
  const n_sets = 1;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesTwice(n_sets, n_items, shuffle)
  // count each item
  var cnt = {}
  bwsindices.forEach(list => {
    list.forEach(elem => {
      cnt[elem] = (cnt[elem] || 0) + 1
    })
  });
  cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
  // check
  for(var c of cnt){
    expect(c).toBe(1);
  }
  expect(n_examples).toBe(4);
});

test('indicesTwice test 2/6', () => {
  // scenario
  const n_sets = 2;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesTwice(n_sets, n_items, shuffle)
  // count each item
  var cnt = {}
  bwsindices.forEach(list => {
    list.forEach(elem => {
      cnt[elem] = (cnt[elem] || 0) + 1
    })
  });
  cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
  // check
  for(var c of cnt){
    expect(c).toBe(2);
  }
  expect(n_examples).toBe( n_sets * (n_items - 1) );
});

test('indicesTwice test 3/6', () => {
  // scenario
  const n_sets = 100;
  const shuffle = false;

  for(var n_items of [2, 4]){
    const [bwsindices, n_examples] = indicesTwice(n_sets, n_items, shuffle)
    // count each item
    var cnt = {}
    bwsindices.forEach(list => {
      list.forEach(elem => {
        cnt[elem] = (cnt[elem] || 0) + 1
      })
    });
    cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
    // check
    for(var c of cnt){
      expect(c).toBe(2);
    }
    expect(n_examples).toBe( n_sets * (n_items - 1) );
  }
});

test('indicesTwice test 6/6', () => {
  // scenario
  const n_sets = 5;
  const n_items = 3;
  const shuffle = false;
  const [bwsindices, n_examples] = indicesTwice(n_sets, n_items, shuffle)
  // count each item
  bwsindices.forEach(bwsset => {
    expect(bwsset.length).toBe(n_items);
  })
  expect(n_examples).toBe( n_sets * (n_items - 1) );
});



test('sample test 1/5', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_items = 5;
  const shuffle = false;
  examples = ['a'];
  const samples = sample(examples, n_items, 'overlap', shuffle);
  // check
  expect(samples.length).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: Zero BWS sets requested.');
});

test('sample test 2/5', () => {
  // scenario
  const n_items = 4;
  const shuffle = false;
  examples = ['a', 'b'];
  const samples = sample(examples, n_items, 'overlap', shuffle);
  // check
  expect(samples.length).toBe(0);
});

test('sample test 3/5', () => {
  // scenario
  const n_items = 2;
  const method = 'overlap';
  const shuffle = false;
  examples = [...Array(100).keys()];
  const samples = sample(examples, n_items, method, shuffle);
  // check
  // count each item
  var cnt = {}
  samples.forEach(list => {
    list.forEach(elem => {
      cnt[elem] = (cnt[elem] || 0) + 1
    })
  });
  cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
  // check
  for(var c of cnt){
    expect(c).toBe(2);
  }
  expect(samples.length).toBe( Math.trunc(examples.length / (n_items - 1)) );
});

test('sample test 4/5', () => {
  // scenario
  const n_items = 3;
  const method = 'overlap';
  const shuffle = false;
  examples = [...Array(100).keys()];
  const samples = sample(examples, n_items, method, shuffle);
  // check
  // count each item
  var cnt = {}
  samples.forEach(list => {
    list.forEach(elem => {
      cnt[elem] = (cnt[elem] || 0) + 1
    })
  });
  cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
  // check
  var n1 = 0;
  var n2 = 0;
  for(var c of cnt){
    if (c == 1){
      n1 += 1;
    }else if (c == 2){
      n2 += 1;
    }
  }
  expect(n1).toBe(50);
  expect(n2).toBe(50);
  expect(samples.length).toBe( Math.trunc(examples.length / (n_items - 1)) );
});

test('sample test 5/5', () => {
  // scenario
  const n_items = 3;
  const method = 'twice';
  const shuffle = false;
  examples = [...Array(90).keys()];
  const samples = sample(examples, n_items, method, shuffle);
  // check
  // count each item
  var cnt = {}
  samples.forEach(list => {
    list.forEach(elem => {
      cnt[elem] = (cnt[elem] || 0) + 1
    })
  });
  cnt = Object.keys(cnt).map(key => cnt[key]);  // json values to array
  // console.log(cnt)
  // check
  for(var c of cnt){
    expect(c).toBe(2);
  }
});
