const { shuffle_subarrs } = require('./sampling');

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
