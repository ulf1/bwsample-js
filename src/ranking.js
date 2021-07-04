const { adjustscore } = require("./scaling");


const rank = (cnt, method, adjust=undefined, avg="exist") => {
  // select method
  if (method == "ratio"){
    var [positions, sortedids, metrics, info] = maximize_ratio(cnt, avg); 
  }else if (method == "approx" || method == "hoaglin"){
    var [positions, sortedids, metrics, info] = maximize_hoaglinapprox(cnt, avg);
  }else{
    throw new Error(`method='${method}' not available.`);
  }

  // adjust scores
  if (adjust !== undefined){
    var scores = adjustscore(metrics, adjust);
  }else{
    var scores = [...metrics];
  }

  // done
  return [positions, sortedids, metrics, scores, info];
}


/**
 * see https://stackoverflow.com/a/65410414
 * 
 * Example:
 *  clickCount = [5, 2, 4, 3, 1]
 *  imgUrl = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']
 *  order = argsort(clickCount);
 *  newArray = order.map(i => imgUrl[i])
 */
const argsort = (arr) => {
  const decor = (v, i) => [v, i];  // set index to value
  const undecor = a => a[1];       // leave only index
  return arr.map(decor).sort().map(undecor);
}

/**
 * Rank items based simple ratios, and calibrate row sums as scores
 * 
 * @param {JSON LIL}  cnt   LIL-format sparse matrix of the pair counts
 * @param {String}    avg   How to compute denominator for averaging (Default: "exist") 
 */
const maximize_ratio = (cnt, avg="exist") => {
  // compute ratios
  var ratio = {}
  for( var id1 in cnt ){
    for( var id2 in cnt[id1] ){
      //console.log(id1, id2, cnt[id1][id2], cnt[id2][id1])
      var Nij = cnt[id1][id2];
      var Nji = 0;
      if (cnt.hasOwnProperty(id2)){
        if (cnt[id2].hasOwnProperty(id1)){
          Nji = cnt[id2][id1];
        }
      }
      if (!ratio.hasOwnProperty(id1)){
        ratio[id1] = {}
      }
      if (!ratio.hasOwnProperty(id2)){
        ratio[id2] = {}
      }
      ratio[id1][id2] = Nij / (Nij + Nji)
      ratio[id2][id1] = Nji / (Nij + Nji)
    }
  }

  // sum up rows in LIL matrix (i.e. the 1st key)
  var metrics = []
  var sortedids = []
  for( var id1 in ratio ){
    var tmp = 0;
    var num = 0;
    for( var id2 in ratio[id1] ){
      tmp += ratio[id1][id2];
      num++;
    }
    metrics.push(tmp / Math.max(1, num))
    sortedids.push(id1)
  }

  if (avg !== "exist"){
    throw new Error("Only avg=exist is implemented!");
  }

  // sort, larger row sums are better
  var positions = argsort(metrics) 
  positions.reverse()  // maximize
  metrics = positions.map(i => metrics[i])
  sortedids = positions.map(i => sortedids[i])

  // done
  return [positions, sortedids, metrics, {}];
}


/**
 * Rank based on p-values computed with the Hoaglin Approximation of DoF=0
 * 
 * @param {JSON LIL}  cnt   LIL-format sparse matrix of the pair counts
 * @param {String}    avg   How to compute denominator for averaging (Default: "exist") 
 */
const maximize_hoaglinapprox = (cnt, avg="exist") => {
  // wrap p-value computation here
  const hoaglin_pvalue = (Nij, Nji) => {
    // compute Expected E
    var E = (Nij + Nji) / 2.0;
    // compute X^2
    var Chi2 = Math.pow(Nij - E, 2) / E;
    // compute Hoaglin's Approximation for DoF=0
    var pval = Math.pow(0.1, (Math.sqrt(Chi2) + 1.37266) / 2.13161);
    // ensure interval
    return Math.max(0.0, Math.min(1.0, pval));
  }

  // compute Q=1-pvalue
  var qij = {}
  for( var id1 in cnt ){
    for( var id2 in cnt[id1] ){
      var Nij = cnt[id1][id2];
      var Nji = 0
      if (cnt.hasOwnProperty(id2)){
        if (cnt[id2].hasOwnProperty(id1)){
          Nji = cnt[id2][id1];
        }
      }
      if (!qij.hasOwnProperty(id1)){
        qij[id1] = {}
      }
      if (!qij.hasOwnProperty(id2)){
        qij[id2] = {}
      }

      // if `Nij > Nji` then set Qij=1-pval and Qji=0
      // if `Nji > Nij` then set Qji=1-pval and Qij=0
      // if `Nji = Nij` then set both Qij=Qji=0
      if (Nij > Nji){
        var pval = hoaglin_pvalue(Nij, Nji);
        qij[id1][id2] = 1.0 - pval;
        qij[id2][id1] = 0.0;
      }else if (Nji > Nij){
        var pval = hoaglin_pvalue(Nji, Nij);
        qij[id2][id1] = 1.0 - pval;
        qij[id1][id2] = 0.0;
      }else {
        qij[id1][id2] = 0.0;
        qij[id2][id1] = 0.0;
      }
    }
  }

  // sum up rows in LIL matrix (i.e. the 1st key)
  var metrics = []
  var sortedids = []
  for( var id1 in qij ){
    var tmp = 0;
    var num = 0;
    for( var id2 in qij[id1] ){
      tmp += qij[id1][id2];
      num++;
    }
    metrics.push(tmp / Math.max(1, num))
    sortedids.push(id1)
  }

  if (avg !== "exist"){
    throw new Error("Only avg=exist is implemented!");
  }

  // sort, larger row sums are better
  var positions = argsort(metrics) 
  positions.reverse()  // maximize
  metrics = positions.map(i => metrics[i])
  sortedids = positions.map(i => sortedids[i])

  // done
  return [positions, sortedids, metrics, {}];
}

module.exports = {
  rank,
  maximize_ratio,
  maximize_hoaglinapprox
}
