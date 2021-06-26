const { direct_extract, merge_lil, direct_extract_batch } = require('./counting');
const { v4: uuid4 } = require('uuid');
const deepEqual = require('deep-equal')

test('direct_extract 1/3', () => {
  // scenario
  const stateids = ['abc', 'def', 'ghi', 'jkl'];
  const combostates = [0, 0, 2, 1];
  const [lil, lil_bw, lil_bn, lil_nw] = direct_extract(stateids, combostates);
  // check
  expect(deepEqual(lil, {
    'abc': {'ghi': 1}, 'def': {'ghi': 1}, 
    'jkl': {'abc': 1, 'def': 1, 'ghi': 1} })).toBe(true);
  expect(deepEqual(lil_bw, {'jkl': {'ghi': 1}} )).toBe(true);
  expect(deepEqual(lil_bn, {'jkl': {'abc': 1, 'def': 1}} )).toBe(true);
  expect(deepEqual(lil_nw, {'abc': {'ghi': 1}, 'def': {'ghi': 1}} )).toBe(true);
  expect(deepEqual(lil, merge_lil([lil_bw, lil_bn, lil_nw]) )).toBe(true);
});

test('direct_extract 2/3', () => {
  // scenario
  const stateids = ['abc', 'def', 'ghi', 'jkl'];
  const combostates = [0, 0, 2, 1];
  var [lil, lil_bw, lil_bn, lil_nw] = direct_extract(stateids, combostates);
  [lil, lil_bw, lil_bn, lil_nw] = direct_extract(
    stateids, combostates, lil, lil_bw, lil_bn, lil_nw);
  // check
  expect(deepEqual(lil, {
    'abc': {'ghi': 2}, 'def': {'ghi': 2}, 
    'jkl': {'abc': 2, 'def': 2, 'ghi': 2} })).toBe(true);
  expect(deepEqual(lil_bw, {'jkl': {'ghi': 2}} )).toBe(true);
  expect(deepEqual(lil_bn, {'jkl': {'abc': 2, 'def': 2}} )).toBe(true);
  expect(deepEqual(lil_nw, {'abc': {'ghi': 2}, 'def': {'ghi': 2}} )).toBe(true);
  expect(deepEqual(lil, merge_lil([lil_bw, lil_bn, lil_nw]) )).toBe(true);
});

test('direct_extract 3/3', () => {
  // scenario
  var stateids = [];
  var combostates = [];
  for(var i = 0; i < 1000; i++){
    stateids.push(uuid4());
    combostates.push(0);
  }
  for(var i = 1; i <= 2; i++){
    stateids.push(uuid4());
    combostates.push(i);
  }
  const [lil, lil_bw, lil_bn, lil_nw] = direct_extract(stateids, combostates);
  // check
  expect(deepEqual(lil, merge_lil([lil_bw, lil_bn, lil_nw]) )).toBe(true);
});


test('direct_extract_batch 1/1', () => {
  const evaluations = [
    [[0, 0, 2, 1], ['id1', 'id2', 'id3', 'id4']],
    [[0, 1, 0, 2], ['id4', 'id5', 'id6', 'id1']] 
  ];
  const [dok, detail] = direct_extract_batch(evaluations);
  // check
  expect(deepEqual(dok, {
    "id1": {"id3": 1},
    "id2": {"id3": 1},
    "id4": {"id1": 2, "id2": 1, "id3": 1},
    "id5": {"id1": 1, "id4": 1, "id6": 1},
    "id6": {"id1": 1}
  })).toBe(true);
});


