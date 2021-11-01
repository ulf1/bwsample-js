
/**
 * 
 * @param {Array[float]}  scores   Vector with numbers
 * @param {String}        method    Name of the method
 */
const adjustScore = (scores, method) => {
  if (method === "quantile"){
    return quantileTransform(scores, 10000);
  }else if (method === "minMax"){
    return minMax(scores);
  }else{
    throw new Error(`method='${method}' not available.`);
  }
}

/**
 * Min-Max Scaling
 * 
 * @param {Array}   x   Vector with numbers
 */
const minMax = (x) => {
  const xmin = Math.min(...x);
  const xmax = Math.max(...x);
  var y = [];
  const d = xmax - xmin;
  x.forEach(e => {
    y.push( (e - xmin) / d )
  });
  return y;
}

/**
 * Quantile Transformation
 * 
 * @param {Array}   sample      Vector with numbers   
 * @param {Int}     n_quantiles Number of quantiles
 */
const quantileTransform = (sample, n_quantiles) => {
  // prepare
  const n_buckets = Math.min(sample.length, n_quantiles);

  // specify each bin
  var percentile = []
  var bincutoff = []
  for(var i = 0; i < n_buckets; i++){
    percentile.push(i / (n_buckets - 1)) 
    bincutoff.push( Math.round(n_buckets * i / (n_buckets - 1)) )
  }
  // identify the cutoff values for each bin
  const sorted = [...sample].sort()
  const values = []
  for(var idx of bincutoff){
    values.push(sorted[idx])
  }

  // assign percentile values to each sample
  var y = [];
  const idx_last = percentile.length - 1;
  for (var x of sample){
    if (x <= values[0]){
      y.push(percentile[0]);
      continue;
    }else if (x >= values[idx_last]){
      y.push(percentile[idx_last]);
      continue;
    }else {
      var found = false
      for (var i = 0; i < (idx_last - 1); i++){
        if (x >= values[i]){
          if (x <= values[i+1]){
            y.push(percentile[i+1]);
            found = true
            break;
          }
        }
      }
      if( !found ){
        throw new Error("Unknown Bug. Cannot assign x to percentile value.")
      }
    }
  }

  // done 
  return y;
}


module.exports = {
  adjustScore,
  minMax,
  quantileTransform
}
