const { rank } = require("./ranking");
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
    {"method": "ratio", "avg": "all", "adjust": "minmax"},
    {"method": "ratio", "avg": "exist", "adjust": "minmax"},
    {"method": "ratio", "avg": "all", "adjust": "quantile"},
    {"method": "ratio", "avg": "exist", "adjust": "quantile"},
    {"method": "approx", "avg": "all", "adjust": "minmax"},
    {"method": "approx", "avg": "exist", "adjust": "minmax"},
    {"method": "approx", "avg": "all", "adjust": "quantile"},
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
    expect(info instanceof JSON).toBe(true);
  }
})
