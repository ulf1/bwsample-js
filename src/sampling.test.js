const { shuffle_subarrs, indices_overlap } = require('./sampling');


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


test('indices_overlap test 1/11', () => {
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


test('indices_overlap test 2/11', () => {
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


test('indices_overlap test 3/11', () => {
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



test('indices_overlap test 4/11', () => {
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


/*
test('indices_overlap test 5/11', () => {
});



test('indices_overlap test 6/11', () => {
});


test('indices_overlap test 7/11', () => {
});



test('indices_overlap test 8/11', () => {
});



test('indices_overlap test 9/11', () => {
});



test('indices_overlap test 10/11', () => {
});

test('indices_overlap test 11/11', () => {
});
*/
