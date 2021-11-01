'use strict';

/**
 * Sample BWS sets from a list of examples
 * 
 * @param {Array[DATA]} examples  A list of examples
 * @param {int}         n_items   Number items per BWS set
 * @param {String}      method    'overlap' or 'twice'
 * @param {Boolean}     shuffle   Flag to permute/shuffle indices
 * 
 * @returns {Array[Array[DATA]]}  samples. A list of BWS sets. Each BWS set 
 *                                is a list of n_items sampled examples
 * 
 * Examples:
 * ---------
 *    const { sample } = require('./sampling');
 *    var examples = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
 *    var samples = sample(examples, n_items=4, method='overlap')
 */
const sample = (examples, 
                n_items, 
                method = 'overlap',
                shuffle = true) => {
    // Generate BWS sets
    const n_sets = Math.trunc(examples.length / (n_items - 1))
    var bwsindices;
    if (method === 'overlap'){
        bwsindices = indicesOverlap(n_sets, n_items, shuffle)[0];
    }else if (method === 'twice'){
        bwsindices = indicesTwice(n_sets, n_items, shuffle)[0];
    }else{
        throw new Error(`method='${method}' not available.`)
    }
    // enforce overflow if `index>=n`
    const n = examples.length;

    var oflowindices_ = [];
    bwsindices.forEach(indicies => {
      var tmp = [];
      indicies.forEach(idx => {
        tmp.push(idx % n);
      });
      oflowindices_.push(tmp);
    })

    // reshape data into BWS sets
    var reshaped = [];
    oflowindices_.forEach(indicies => {
      var tmp = [];
      for ( var [i, v] of examples.entries() ){
        if ( indicies.includes(i) ){
          tmp.push(v);
        }
      }
      reshaped.push(tmp);
    });

    // done
    return reshaped;
}


/**
 * Shuffle the sublists' items
 * 
 * @param {Array} arrs      A list of (sub)lists
 * @param {Int}   n_sets    Requested number of BWS sets
 * @param {Int}   n_items   Number items per BWS set
 * 
 *  Example:
 *  --------
 *    var arrs = [[1, 2, 3], [4, 5, 6]]
 *    var n_sets = 2
 *    var n_items = 3
 *    var out = shuffleSubarrs(arrs, n_sets, n_items)
 */
const shuffleSubarrs = (arrs, n_sets=undefined, n_items=undefined) => {
    if (n_sets === undefined){
        n_sets = arrs.length;
    }
    if (n_items === undefined){
        n_items = arrs[0].length;
    }
    
    // random indicies
    const randInt = (max) => Math.trunc(Math.random() * max)

    var rj = [];
    var rk = [];
    for(var i = 0; i < n_sets; i++){
      rj.push(randInt(n_items - 1) + 1);  // idx=(1, n_items-1)
      rk.push(randInt(n_items - 2));  // idx=(0, n_items-2)
    }

    // swap elements
    var j, k, tmp;
    for(var i = 0; i < n_sets; i++){
      j = rj[i];
      k = rk[i];
      // swap
      tmp = arrs[i][j];
      arrs[i][j] = arrs[i][0];
      arrs[i][0] = tmp;
      // swap again
      if( j != k ){
        tmp = arrs[i][k];
        arrs[i][k] = arrs[i][-1];
        arrs[i][-1] = tmp;
      }
    }

    // done
    return arrs;
}


/**
 * Generate BWS set indices so that each example occur at least once,
 * and exactly `1/(n_items - 1) * 100%` of examples occur twice across
 * all generate BWS sets.
 * 
 * @param {Int}     n_sets    Requested number of BWS sets
 * @param {Int}     n_items   Number items per BWS set
 * @param {Boolean} shuffle   Flag to permute/shuffle indices
 * 
 * @returns {Array[Array[Int]]} bwsindices. A list of `n_sets` BWS sets. 
 *                              Each BWS set is a list of `n_items` indices.
 * @returns {Int}               n_examples. The number of indices spread across the
 *                              BWS sets. The indices can be generated as follows: 
 *                              `indices=range(0, n_examples)`
 * Examples:
 * ---------
 *    const {bwsindices, n_examples} = indicesOverlap(1000, 4, false)
 */
const indicesOverlap = (n_sets, 
                         n_items,
                         shuffle = true) => {
    // abort
    if(n_items < 2){
      console.log(`Warning: No overlap possible with n_items=${n_items}.`)
      return [ [], 0 ]
    }
    if(n_sets < 1){
      console.log("Warning: Zero BWS sets requested.")
      return [ [], 0 ]
    }
    if(n_sets == 1){
      console.log("Warning: Only one BWS set requested.")
      if (shuffle === true){
        var arr = [...Array(n_items).keys()];
        arr.sort(() => (Math.random() > .5) ? 1 : -1);
        return [ [arr], n_items ]
      }else{
        return [ [[...Array(n_items).keys()]], n_items ]
      }
    }
    // compute required number of examples
    const n_examples = n_sets * (n_items - 1)

    // generate a `pool` of indices
    const pool = [...Array(n_examples).keys()];

    // copy from indices `pool`
    var bwsindices = []
    for(var k = 0; k < n_examples; k += (n_items - 1) ){
      bwsindices.push( pool.slice(k, k + n_items) );
    }
    bwsindices[bwsindices.length - 1].push(bwsindices[0][0]);

    // shuffle each BWS set
    if (shuffle){
      bwsindices = shuffleSubarrs(bwsindices, n_sets, n_items);
    }

    // done
    return [ bwsindices, n_examples ]
}


/**
 * Sample each example at least twice across all generated BWS sets
 * 
 * @param {Int}     n_sets    Requested number of BWS sets
 * @param {Int}     n_items   Number items per BWS set
 * @param {Boolean} shuffle   Flag to permute/shuffle indices
 * @returns {Array[Array[Int]]}   bwsindices A list of `n_sets` BWS sets. 
 *                            Each BWS set is a list of `n_items` indices.
 * @returns {Int}   n_examples  The number of indices spread across the BWS sets. 
 *                            The indices can be generated as follows: 
 *                            `indices=range(0, n_examples)`
 * Examples:
 * ---------
 *    bwsindices, n_examples = indicesTwice(1000, 4, False)
 */
const indicesTwice = (n_sets, 
                       n_items,
                       shuffle = true) => {
    // (A) Call `indicesOverlap` without randomness!
    const [ bwsindices, n_examples ] = indicesOverlap(n_sets, n_items, false);

    if (n_items <= 2 && n_sets <= 1){
        return [ bwsindices, n_examples ]
    }

    // (B) Add BWS sets so that every index is used twice --
    // number of BWS sets to connect examples
    const n_btw = Math.trunc( (n_examples * (n_items - 2)) / (n_items * (n_items - 1)) );

    // which examples from the `pool` have not been used twice?
    var avail = [];
    for(var q = 0; q < n_examples; q++){
      if( (q % (n_items - 1)) != 0 ){
        avail.push(q);
      }
    }
    const n_avail = n_btw * Math.trunc(avail.length / n_btw);

    // generate BWS sets
    var grid = [];
    for(var i = 0; i < n_avail; i += n_btw){
      if(grid.length < n_items){
        grid.push(i);
      }
    }
    for(var r = 0; r < n_btw; r++){
      var tmp = [];
      for(var k of grid){
        tmp.push(avail[k + r]);
      }
      bwsindices.push(tmp);
    }

    // (C) Shuffle here
    if (shuffle){
      bwsindices = shuffleSubarrs(bwsindices, n_sets, n_items);
    }

    // done
    return [ bwsindices, n_examples ]
}


module.exports = {
  sample,
  shuffleSubarrs,
  indicesOverlap,
  indicesTwice
};
