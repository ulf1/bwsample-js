const { shuffle_subarrs, indices_overlap, indices_twice } = require('./sampling');


test('shuffle_subarrs test 1/2', () => {
  // scenario
  const arrs = [[1, 2, 3], [4, 5, 6]];
  const out = shuffle_subarrs(arrs);
  // check
  for(var i = 0; i < out.length; i++){
    for(var v of out[i]){
      expect( arrs[i].includes(v) ).toBe(true);
    }
  }
});
test('shuffle_subarrs test 2/2', () => {
  // scenario
  const arrs = [[1, 2, 3], [4, 5, 6]];
  const n_items = 3;
  const n_sets = 2;
  const out = shuffle_subarrs(arrs, n_sets, n_items);
  // check
  for(var i = 0; i < out.length; i++){
    for(var v of out[i]){
      expect( arrs[i].includes(v) ).toBe(true);
    }
  }
});



test('indices_overlap test 1/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 0;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: No overlap possible with n_items=0.');
});
test('indices_overlap test 2/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 1;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: No overlap possible with n_items=1.');
});
test('indices_overlap test 3/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 0;
  const n_items = 2;
  const shuffle = undefined;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(0);
  expect(n_examples).toBe(0);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: Zero BWS sets requested.');
});
test('indices_overlap test 4/10', () => {
  // read log output
  const consoleSpy = jest.spyOn(console, 'log');
  // scenario
  const n_sets = 1;
  const n_items = 2;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([[0, 1]]);
  expect(n_examples).toBe(2);
  expect(consoleSpy).toHaveBeenCalledWith('Warning: Only one BWS set requested.');
  //console.log(bwsindices)
});
test('indices_overlap test 5/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 2;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]]);
  expect(n_examples).toBe(4);
});
test('indices_overlap test 6/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 3;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual(
    [[0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0]]
  );
  expect(n_examples).toBe(8);
});
test('indices_overlap test 7/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual(
    [[0, 1, 2, 3], [3, 4, 5, 6], [6, 7, 8, 9], [9, 10, 11, 0]]
  );
  expect(n_examples).toBe(12);
});
test('indices_overlap test 8/10', () => {
  // scenario
  const n_sets = 4;
  const n_items = 5;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices).toEqual([
      [0, 1, 2, 3, 4], [4, 5, 6, 7, 8],
      [8, 9, 10, 11, 12], [12, 13, 14, 15, 0]
  ]);
  expect(n_examples).toBe(16);
});
test('indices_overlap test 9/10', () => {
  // scenario
  const n_sets = 1000;
  const n_items = 6;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
  // check
  expect(bwsindices.length).toBe(1000);
  expect(bwsindices[0].length).toBe(6);
  expect(n_examples).toBe( n_sets * (n_items - 1) );
});
test('indices_overlap test 10/10', () => {
  // scenario
  const n_sets = 100;
  const n_items = 5;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_overlap(n_sets, n_items, shuffle)
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



test('indices_twice test 1/6', () => {
  // scenario
  const n_sets = 1;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_twice(n_sets, n_items, shuffle)
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

test('indices_twice test 2/6', () => {
  // scenario
  const n_sets = 2;
  const n_items = 4;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_twice(n_sets, n_items, shuffle)
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

test('indices_twice test 3/6', () => {
  // scenario
  const n_sets = 100;
  const shuffle = false;

  for(var n_items of [2, 4]){
    const [bwsindices, n_examples] = indices_twice(n_sets, n_items, shuffle)
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

test('indices_twice test 6/6', () => {
  // scenario
  const n_sets = 5;
  const n_items = 3;
  const shuffle = false;
  const [bwsindices, n_examples] = indices_twice(n_sets, n_items, shuffle)
  // count each item
  bwsindices.forEach(bwsset => {
    expect(bwsset.length).toBe(n_items);
  })
  expect(n_examples).toBe( n_sets * (n_items - 1) );
});
