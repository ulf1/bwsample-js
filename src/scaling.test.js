const { minMax, quantileTransform } = require("./scaling")

test("minMax 1/1", () => {
  const sample = [-1, 2, 3];
  const y = minMax(sample);
  // check
  expect(sample).toEqual([-1, 2, 3]);
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([0.0, 0.75, 1.0]);
});

test("quantileTransform 1/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantileTransform(sample, 3);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([1, 1, 0, 0.5, 0, 1, 1, 1, 1, 1, 1]);
})

test("quantileTransform 2/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantileTransform(sample, 5);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([1, 1, 0, 0.5, 0, 0.5, 0.75, 1, 1, 1, 1]);
})

test("quantileTransform 3/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantileTransform(sample, 10000);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([0.5, 0.6, 0, 0.2, 0, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9]);
})
