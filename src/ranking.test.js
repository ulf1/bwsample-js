const { rank, maximizeRatio, maximizeHoaglinapprox } = require("./ranking");
const { count } = require("./counting");


test("ranking.js unit tests", () => {
  // demo data
  const evaluations = [
    [[1, 0, 0, 2], ['A', 'B', 'C', 'D']],
    [[1, 0, 0, 2], ['A', 'B', 'C', 'D']],
    [[2, 0, 0, 1], ['A', 'B', 'C', 'D']],
    [[0, 1, 2, 0], ['A', 'B', 'C', 'D']],
    [[0, 1, 0, 2], ['A', 'B', 'C', 'D']]
  ];
  var [agg, _1, _2, _3, _4] = count(evaluations);

  // possible settings
  const settings = [
    {"method": "ratio", "avg": "exist", "adjust": "minMax"},
    {"method": "ratio", "avg": "exist", "adjust": "quantile"},
    {"method": "approx", "avg": "exist", "adjust": "minMax"},
    {"method": "approx", "avg": "exist", "adjust": "quantile"}
  ];

  // loop over each setting
  for (var setting of settings){
    var [positions, sortedids, metrics, scores, info] = rank(
      agg, setting["method"], setting["adjust"], setting["avg"]);
    expect(positions.length).toBe(4);
    expect(sortedids.length).toBe(4);
    expect(metrics.length).toBe(4);
    expect(scores.length).toBe(4);
    //expect(info instanceof JSON).toBe(true);
  }
})


test("maximizeRatio", () => {
  const cnt = {'jkl': {'ghi': 2, 'abc': 2, 'def': 2}, 'abc': {'jkl': 1}, 'def': {'jkl': 3}}
  var [positions, sortedids, metrics, info] = maximizeRatio(cnt);
  expect(positions).toEqual([0, 3, 2, 1])
  expect(sortedids).toEqual(["jkl", "def", "abc", "ghi"])
  expect(metrics).toEqual([(1. + 2./3. + 0.4) / 3., 0.6, 1./3., 0])
});


test("maximizeHoaglinapprox", () => {
  const cnt = {'jkl': {'ghi': 2, 'abc': 2, 'def': 2}, 'abc': {'jkl': 1}, 'def': {'jkl': 3}}
  var [positions, sortedids, metrics, info] = maximizeHoaglinapprox(cnt);
  expect(positions).toEqual([3, 0, 2, 1])
  expect(sortedids).toEqual(["def", "jkl", "abc", "ghi"])
  expect(metrics).toEqual([0.8386779155734472, 0.5922889408957621, 0, 0])
});
