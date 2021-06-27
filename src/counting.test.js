const { 
  direct_extract, merge_lil, direct_extract_batch, 
  find_by_state, logical_infer, logical_infer_update,
  count, add_lil
} = require('./counting');
const { v4: uuid4 } = require('uuid');
const deepEqual = require('deep-equal')

test('direct_extract 1/3', () => {
  // scenario
  const stateids = ['abc', 'def', 'ghi', 'jkl'];
  const combostates = [0, 0, 2, 1];
  const [agg, bw, bn, nw] = direct_extract(stateids, combostates);
  // check
  expect(deepEqual(agg, {
    'abc': {'ghi': 1}, 'def': {'ghi': 1}, 
    'jkl': {'abc': 1, 'def': 1, 'ghi': 1} })).toBe(true);
  expect(deepEqual(bw, {'jkl': {'ghi': 1}} )).toBe(true);
  expect(deepEqual(bn, {'jkl': {'abc': 1, 'def': 1}} )).toBe(true);
  expect(deepEqual(nw, {'abc': {'ghi': 1}, 'def': {'ghi': 1}} )).toBe(true);
  expect(deepEqual(agg, merge_lil([bw, bn, nw]) )).toBe(true);
});

test('direct_extract 2/3', () => {
  // scenario
  const stateids = ['abc', 'def', 'ghi', 'jkl'];
  const combostates = [0, 0, 2, 1];
  var [agg, bw, bn, nw] = direct_extract(stateids, combostates);
  [agg, bw, bn, nw] = direct_extract(
    stateids, combostates, agg, bw, bn, nw);
  // check
  expect(deepEqual(agg, {
    'abc': {'ghi': 2}, 'def': {'ghi': 2}, 
    'jkl': {'abc': 2, 'def': 2, 'ghi': 2} })).toBe(true);
  expect(deepEqual(bw, {'jkl': {'ghi': 2}} )).toBe(true);
  expect(deepEqual(bn, {'jkl': {'abc': 2, 'def': 2}} )).toBe(true);
  expect(deepEqual(nw, {'abc': {'ghi': 2}, 'def': {'ghi': 2}} )).toBe(true);
  expect(deepEqual(agg, merge_lil([bw, bn, nw]) )).toBe(true);
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
  const [agg, bw, bn, nw] = direct_extract(stateids, combostates);
  // check
  expect(deepEqual(agg, merge_lil([bw, bn, nw]) )).toBe(true);
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


test("find_by_state 1/1", () => {
  const ids = ['a', 'b', 'c', 'd'];
  const states = [0, 1, 0, 2];
  const ids2 = find_by_state(ids, states, [0]);
  expect(ids2).toEqual(['a', 'c']);
});


test("logical_infer 1/9", () => {
  // nn: D>Z, X>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'E', 'Z'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'D': {'Z': 1}, 'X': {'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, target)).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 2/9", () => {
  // nb: D>Y, D>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['E', 'Y', 'Z'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'D': {'Y': 1, 'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, target)).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 3/9", () => {
  // nw: X>F, Y>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'E'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'X': {'F': 1}, 'Y': {'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, target)).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 4/9", () => {
  // bn: X>E, X>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'D', 'Z'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'X': {'E': 1, 'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, target)).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 5/9", () => {
  // bb: n.a.
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['D', 'Y', 'Z'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  expect(deepEqual(agg, {})).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 6/9", () => {
  // bw: X>E, X>F, Y>E, Y>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'D'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'X': {'E': 1, 'F': 1}, 'Y': {'E': 1, 'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, target)).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});

test("logical_infer 7/9", () => {
  // wn: D>Z, E>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'F', 'Z'];
  const states1 = [1, 0, 2];  
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'D': {'Z': 1}, 'E': {'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, target)).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});


test("logical_infer 8/9", () => {
  // wb: D>Y, D>Z, E>Y, E>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['F', 'Y', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  const target = {'D': {'Y': 1, 'Z': 1}, 'E': {'Y': 1, 'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, target)).toBe(true);
});

test("logical_infer 9/9", () => {
  // ww: n.a.
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'F'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
    ids1, ids2, states1, states2)
  expect(deepEqual(agg, {})).toBe(true);
  expect(deepEqual(nn, {})).toBe(true);
  expect(deepEqual(nb, {})).toBe(true);
  expect(deepEqual(nw, {})).toBe(true);
  expect(deepEqual(bn, {})).toBe(true);
  expect(deepEqual(bw, {})).toBe(true);
  expect(deepEqual(wn, {})).toBe(true);
  expect(deepEqual(wb, {})).toBe(true);
});



test("logical_infer_update 1/9", () => {
  // nn: D>Z, X>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'E', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'D': {'Z': 1}, 'X': {'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], target)).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 2/9", () => {
  // nb: D>Y, D>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['E', 'Y', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'D': {'Y': 1, 'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], target)).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 3/9", () => {
  // nw: X>F, Y>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'E'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
        [[states1, ids1]], [[states2, ids2]])
  const target = {'X': {'F': 1}, 'Y': {'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], target)).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 4/9", () => {
  // bn: X>E, X>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'D', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'X': {'E': 1, 'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], target)).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 5/9", () => {
  // bb: n.a.
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['D', 'Y', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  expect(deepEqual(agg, {})).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 6/9", () => {
  // bw: X>E, X>F, Y>E, Y>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'D'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'X': {'E': 1, 'F': 1}, 'Y': {'E': 1, 'F': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], target)).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 7/9", () => {
  // wn: D>Z, E>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'F', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'D': {'Z': 1}, 'E': {'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], target)).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});

test("logical_infer_update 8/9", () => {
  // wb: D>Y, D>Z, E>Y, E>Z
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['F', 'Y', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  const target = {'D': {'Y': 1, 'Z': 1}, 'E': {'Y': 1, 'Z': 1}}
  expect(deepEqual(agg, target)).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], target)).toBe(true);
});

test("logical_infer_update 9/9", () => {
  // ww: n.a.
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'Y', 'F'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg, detail] = logical_infer_update(
    [[states1, ids1]], [[states2, ids2]])
  expect(deepEqual(agg, {})).toBe(true);
  expect(deepEqual(detail["nn"], {})).toBe(true);
  expect(deepEqual(detail["nb"], {})).toBe(true);
  expect(deepEqual(detail["nw"], {})).toBe(true);
  expect(deepEqual(detail["bn"], {})).toBe(true);
  expect(deepEqual(detail["bw"], {})).toBe(true);
  expect(deepEqual(detail["wn"], {})).toBe(true);
  expect(deepEqual(detail["wb"], {})).toBe(true);
});


test("logical_infer_update 1/12", () => {
  // nn: D>Z, X>F
  const ids1 = ['D', 'E', 'F'];
  const ids2 = ['X', 'E', 'Z'];
  const states1 = [1, 0, 2];
  const states2 = [1, 0, 2];
  const [agg_lil, direct_lil, direct_detail, logical_lil, logical_detail] = count(
    [[states1, ids1]], undefined, undefined, true, undefined, undefined, [[states2, ids2]])
  const target = {'D': {'Z': 1}, 'X': {'F': 1}}
  expect(deepEqual(logical_lil, target)).toBe(true);
  expect(deepEqual(logical_detail["nn"], target)).toBe(true);
  expect(deepEqual(logical_detail["nb"], {})).toBe(true);
  expect(deepEqual(logical_detail["nw"], {})).toBe(true);
  expect(deepEqual(logical_detail["bn"], {})).toBe(true);
  expect(deepEqual(logical_detail["bw"], {})).toBe(true);
  expect(deepEqual(logical_detail["wn"], {})).toBe(true);
  expect(deepEqual(logical_detail["wb"], {})).toBe(true);
  expect(deepEqual(direct_lil, {'D': {'E': 1, 'F': 1}, 'E': {'F': 1}} )).toBe(true);
  expect(deepEqual(direct_detail["bw"], {'D': {'F': 1}} )).toBe(true);
  expect(deepEqual(direct_detail["bn"], {'D': {'E': 1}} )).toBe(true);
  expect(deepEqual(direct_detail["nw"], {'E': {'F': 1}} )).toBe(true);
  expect(deepEqual(agg_lil, add_lil({'D': {'E': 1, 'F': 1}, 'E': {'F': 1}}, target) )).toBe(true);
});

