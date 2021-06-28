const { minmax, quantile_transform } = require("./scaling")

test("minmax 1/1", () => {
  const sample = [-1, 2, 3];
  const y = minmax(sample);
  // check
  expect(sample).toEqual([-1, 2, 3]);
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([0.0, 0.75, 1.0]);
});

test("quantile_transform 1/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantile_transform(sample, 3);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([1, 1, 0, 0.5, 0, 1, 1, 1, 1, 1, 1]);
})

test("quantile_transform 2/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantile_transform(sample, 5);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([1, 1, 0, 0.5, 0, 0.5, 0.75, 1, 1, 1, 1]);
})

test("quantile_transform 3/3", () => {
  const sample = [.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27];
  const y = quantile_transform(sample, 10000);
  // check
  expect(sample).toEqual([.21, .22, .11, .12, .11, .15, .16, .21, .25, .26, .27]); // find bug
  expect(y.length).toBe(sample.length);
  expect(y).toEqual([0.5, 0.6, 0, 0.2, 0, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9]);
})
