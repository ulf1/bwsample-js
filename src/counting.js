/**
 * 
 * @param {*} lil 
 * @param {*} id1 
 * @param {*} id2 
 * @returns 
 * 
 * 
 * Example:
 *    var lil = undefined
 *    lil = incr_lil(lil, "la", "li");
 *    lil = incr_lil(lil, "la", "li");
 *    lil = incr_lil(lil, "la", "lu");
 *    console.log(lil)
 */
 const incr_lil = (lil, id1, id2) => {
  if (lil == undefined){
    lil = {};
  }
  if (lil[id1] == undefined){
    lil[id1] = {};
  }
  if (lil[id1][id2] == undefined){
    lil[id1][id2] = 1;
  }else{
	  lil[id1][id2] += 1;
  }
  return lil;
}

/** 
 * Add count values of two LIL objects together
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
 const add_lil = (a, b) => {
  var c = JSON.parse(JSON.stringify(a));
  for(var id1 in b){
    if(c[id1] === undefined){
      c[id1] = JSON.parse(JSON.stringify(b[id1]));
    }else{
      for (var id2 in b[id1]){
        if(c[id1][id2] === undefined){
          c[id1][id2] = parseInt(b[id1][id2]);
        }else{
          c[id1][id2] += parseInt(b[id1][id2]);
        }
      }
    }
  }
  return c;
}

/**
 * Add count values of an list of LIL objects toegther
 * 
 * @param {*} arr 
 * @returns 
 */
const merge_lil = (arr) => {
  var a = {};
  for (var b of arr){
    a = add_lil(a, b);
  }
  return a;
}


// def count(evaluations: List[Tuple[List[ItemState], List[ItemID]]],
//           direct_dok: Optional[Dict[Tuple[ItemID, ItemID], int]] = None,
//           direct_detail: Optional[Dict[Tuple[ItemID, ItemID], int]] = None,
//           use_logical: Optional[bool] = True,
//           logical_dok: Optional[Dict[Tuple[ItemID, ItemID], int]] = None,
//           logical_detail: Optional[dict] = None,
//           logical_database: List[Tuple[List[ItemState], List[ItemID]]] = None,
//           ) -> (
//               Dict[Tuple[ItemID, ItemID], int],
//               Dict[Tuple[ItemID, ItemID], int],
//               dict,
//               Dict[Tuple[ItemID, ItemID], int],
//               dict):
//     """Extract pairs from evaluated BWS sets

//     Parameters:
//     -----------
//     evaluations : List[Tuple[List[ItemState], List[ItemID]]]
//         A list of new BWS sets to be evaluated.

//     direct_dok : Dict[Tuple[ItemID, ItemID], int]
//         (default: None) Previously recorded frequencies for all directly
//           extracted pairs.

//     direct_detail : dict
//         (default: None) Previously recorded frequencies for each type of
//           pair: "BEST>WORST" (bw), "BEST>NOT" (bn), "NOT>WORST" (nw)

//     use_logical : Optional[bool] = True
//         flag to deactivate logical inference

//     logical_dok : Optional[Dict[Tuple[ItemID, ItemID], int]]
//         The previous counts/frequencies of logical inferred pairs
//           that need to be updated.

//     logical_detail : Optional[dict]
//         A dictionary of previously stored DOKs for each variant of
//           logically inferred pairs.

//     logical_database : List[Tuple[List[ItemState], List[ItemID]]]
//         A database of previously processed BWS sets

//     Returns:
//     --------
//     logical_dok: Optional[Dict[Tuple[ItemID, ItemID], int]]
//         The counts/frequencies of logical inferred pairs.

//     logical_detail: Optional[dict]
//         A dictionary that stores seperate DOKs for each variant of
//           logically inferred pairs.

//     Example:
//     --------
//         import bwsample as bws
//         agg_dok, dir_dok, dir_detail, logi_dok, logi_detail = bws.count(
//             evaluations)
//     """
const count = (evaluations,
               direct_lil=undefined,
               direct_detail=undefined,
               use_logical=true,
               logical_lil=undefined,
               logical_detail=undefined,
               logical_database=undefined) => {
  // extract from each BWS set
  [direct_lil, direct_detail] = direct_extract_batch(
    evaluations, direct_lil, direct_detail);

  // search for logical inferences
  if (use_logical){
    [logical_lil, logical_detail] = logical_infer_update(
      evaluations, logical_database, logical_lil, logical_detail);
  }
  //  merge agg_lil=direct_dok+logical_dok
  if (use_logical){
    var agg_lil = add_lil(logical_lil, direct_lil);
  }else{
    var agg_lil = JSON.parse(JSON.stringify(direct_lil));
  }

  // done
  return [agg_lil, direct_lil, direct_detail, logical_lil, logical_detail]
}




/**
 * Extract ">" Pairs from one evaluated BWS set
 * 
 * @param {Array[ID]}   stateids      A list of IDs (e.g. uuid) corresponding to the `combostates` list.
 * @param {Array[Int]}  combostates   Combinatorial state variable. Each element of the list
 *                                    - corresponds to an ID in the `stateids` list,
 *                                    - represents an item state variable (or the i-th FSM), and
 *                                    - can habe one of the three states:
 *                                      - 0: NOT, unselected (initial state)
 *                                      - 1: BEST
 *                                      - 2: WORST
 * @param {JSON}        agg           Dictionary with counts for each ">" pair, e.g. an
 *                                      entry `{..., ('B', 'C'): 1, ...} means `B>C` was 
 *                                      counted `1` times.
 *                                    We can extract 3 types of pairs from 1 BWS set:
 *                                      - "BEST > WORST" (see dok_bw)
 *                                      - "BEST > NOT" (see dok_bn)
 *                                      - "NOT > WORST" (see dok_nw)
 *                                    The `dok` dictionary contains the aggregate counts of the 
 *                                      types of pairs. Use `dok_bw`, `dok_bn` and `dok_nw` for
 *                                      attribution analysis.
 * @param {JSON}        bw        Dictionary with counts for explicit "BEST > WORST" pairs.
 * @param {JSON}        bn        Dictionary with counts for "BEST > NOT" pairs.
 * @param {JSON}        nw        Dictionary with counts for "NOT > WORST" pairs.
 * @returns agg, bw, bn, nw
 * 
 * Example
 *    // process the 1st evaluation
 *    var stateids = ['A', 'B', 'C', 'D']
 *    var combostates = [0, 0, 2, 1]  # BEST=1, WORST=2
 *    var [agg, bw, bn, nw] = direct_extract(stateids, combostates);
 *    // update with the next evaluation
 *    stateids = ['D', 'E', 'F', 'A']
 *    combostates = [0, 1, 0, 2]
 *    [agg, bw, bn, nw] = direct_extract(
 *      stateids, combostates, agg, bw, bn, nw);
 */
const direct_extract = (stateids, 
                        combostates, 
                        agg=undefined, 
                        bw=undefined, 
                        bn=undefined, 
                        nw=undefined) => {
  // check args
  if (stateids.length != combostates.length){
    throw new Error(`stateids.length='${stateids.length}' and combostates.length=${combostates.length} are not equal.`);
  }
  // set defaults
  if (agg === undefined){
    agg = {};
  }
  if (bw === undefined){
    bw = {};
  }
  if (bn === undefined){
    bn = {};
  }
  if (nw === undefined){
    nw = {};
  }

  // find `best` and `worst` py index
  // (this is 2-3x faster than a loop with if-else)
  // If no element has the state `1` and `2`, then skip
  const best_idx = combostates.indexOf(1);
  const worst_idx = combostates.indexOf(2);

  if ( best_idx === -1 || worst_idx === -1){
    return [agg, bw, bn, nw];
  }

  // add the direct "BEST > WORST" observation
  const best_uuid = stateids[best_idx];
  const worst_uuid = stateids[worst_idx];
  agg = incr_lil(agg, best_uuid, worst_uuid);
  bw = incr_lil(bw, best_uuid, worst_uuid);

  // loop over all other elements
  for ( var [middle_idx, middle_uuid] of stateids.entries() ){
    if (middle_idx != best_idx && middle_idx != worst_idx){
      // add `BEST > NOT`
      agg = incr_lil(agg, best_uuid, middle_uuid);
      bn = incr_lil(bn, best_uuid, middle_uuid);
      // add `NOT > WORST`
      agg = incr_lil(agg, middle_uuid, worst_uuid);
      nw = incr_lil(nw, middle_uuid, worst_uuid);
    }
  }
  // done
  return [agg, bw, bn, nw];
};


/** 
 * Loop over an batch of BWS sets
 * 
 * @param {Array}   evaluations   A list of combinatorial states and associated identifiers.
 * @param {JSON}    agg           Previously recorded frequencies for all directly extracted pairs.
 * @param {JSON}    detail        Previously recorded frequencies for each type of pair: "BEST>WORST" 
 *                                  (bw), "BEST>NOT" (bn), "NOT>WORST" (nw)
 * @returns agg, detail
 * 
 * Example
 *  const evaluations = [ [[0, 0, 2, 1], ['id1', 'id2', 'id3', 'id4']],
 *                         [[0, 1, 0, 2], ['id4', 'id5', 'id6', 'id1']] ];
 *  const [dok, detail] = direct_extract_batch(evaluations);
 */
const direct_extract_batch = (evaluations, 
                              agg=undefined, 
                              detail=undefined) => {
  // initialize empty dict objects
  if (agg === undefined){
    agg = {};
  }
  if (detail === undefined){
    detail = {"bw": {}, "bn": {}, "nw": {}}
  }
  // query `detail` object
  var bw = detail["bw"];
  var bn = detail["bn"];
  var nw = detail["nw"];
  // loop over all evaluated BWS sets, and post-process each
  for (var [combostates, stateids] of evaluations){
    [agg, bw, bn, nw] = direct_extract(
      stateids, combostates, agg, bw, bn, nw);
  }
  // copy details
  detail["bw"] = bw;
  detail["bn"] = bn;
  detail["nw"] = nw;

  // done
  return [agg, detail];
}


/**
 * Find IDs by state
 * 
 * @param {Array} ids     IDs, e.g. UUID
 * @param {Array} states  States, e.g. 0,1,2
 * @param {Array} s_      List of states to search for
 * @returns 
 */
const find_by_state = (ids, states, s_) => {
  var out = [];
  for(var i = 0; i < ids.length; i++){
    if( s_.includes(states[i]) ){
      out.push(ids[i]);
    }
  }
  return out;
}


/**
 * Logical Inference rules
 * 
 * @param {Array[ID]}   ids1    List of IDs
 * @param {Array[ID]}   ids2    see "ids1"
 * @param {Array[Int]}  states1 Combinatorial states, i.e. a list of item states. 
 *                                Each item state is encoded as
 *                                - 0: NOT
 *                                - 1: BEST
 *                                - 2: WORST
 * @param {Array[Int]}  states2 see "states1"
 * @param {Int}         s1      The item state of the overlapping item
 * @param {Int}         s2      see "s1"
 * @param {JSON}        agg     Previous counts/frequencies of logically inferred pairs.
 * @param {JSON}        nn      Previously counts/frequencies for different variants of logically inferred pairs counted separately
 * @param {JSON}        nb      see "nn"
 * @param {JSON}        nw      see "nn"
 * @param {JSON}        bn      see "nn"
 * @param {JSON}        bw      see "nn"
 * @param {JSON}        wn      see "nn"
 * @param {JSON}        wb      see "nn"
 * @returns agg, nn, nb, nw, bn, bw, wn, wb
 * 
 * Literature
 *    Hamster, U. A. (2021, March 9). Extracting Pairwise Comparisons Data
 *       from Best-Worst Scaling Surveys by Logical Inference.
 *       https://doi.org/10.31219/osf.io/qkxej
 */
const logical_rules = (ids1, ids2, states1, states2, s1, s2, 
                       agg, nn, nb, nw, bn, bw, wn, wb) => {
  // set defaults
  if (agg === undefined){
    agg = {};
  }
  if (nn === undefined){
    nn = {};
  }
  if (nb === undefined){
    nb = {};
  }
  if (nw === undefined){
    nw = {};
  }
  if (bn === undefined){
    bn = {};
  }
  if (bw === undefined){
    bw = {};
  }
  if (wn === undefined){
    wn = {};
  }
  if (wb === undefined){
    wb = {};
  }

  // Logical Inferences rules
  if (s1 === 0){  // 0:NOT
    if (s2 === 0){  // 0:NOT
      // nn: D>Z
      for (var i of find_by_state(ids1, states1, [1]) ){
        for (var j of find_by_state(ids2, states2, [2]) ){
          agg = incr_lil(agg, i, j);
          nn = incr_lil(nn, i, j);
        }
      }
      // nn: X>F
      for (var i of find_by_state(ids2, states2, [1]) ){
        for (var j of find_by_state(ids1, states1, [2]) ){
          agg = incr_lil(agg, i, j);
          nn = incr_lil(nn, i, j);
        }
      }
    }
    else if (s2 === 1){  // 1:BEST
      // nb: D>Y, D>Z
      for (var i of find_by_state(ids1, states1, [1]) ){
        for (var j of find_by_state(ids2, states2, [0, 2]) ){
          agg = incr_lil(agg, i, j);
          nb = incr_lil(nb, i, j);
        }
      }
    }
    else if (s2 === 2){  // 2:WORST
      // nw: X>F, Y>F
      for (var j of find_by_state(ids1, states1, [2]) ){
        for (var i of find_by_state(ids2, states2, [0, 1]) ){
          agg = incr_lil(agg, i, j);
          nw = incr_lil(nw, i, j);
        }
      }
    }
  }
  else if (s1 === 1){  // 1:BEST
    if (s2 === 0){
      // bn: X>E, X>F
      for (var i of find_by_state(ids2, states2, [1]) ){
        for (var j of find_by_state(ids1, states1, [0, 2]) ){
          agg = incr_lil(agg, i, j);
          bn = incr_lil(bn, i, j);
        }
      }
    }
    else if (s2 === 2){
      // bw: X>E, X>F, Y>E, Y>F
      for (var j of find_by_state(ids1, states1, [0, 2]) ){
        for (var i of find_by_state(ids2, states2, [0, 1]) ){
          agg = incr_lil(agg, i, j);
          bw = incr_lil(bw, i, j);
        }
      }
    }
  }
  else if (s1 === 2){  // 2:WORST
    if (s2 === 0){
      // wn: D>Z, E>Z
      for (var i of find_by_state(ids1, states1, [0, 1]) ){
        for (var j of find_by_state(ids2, states2, [2]) ){
          agg = incr_lil(agg, i, j);
          wn = incr_lil(wn, i, j);
        }
      }
    }
    else if (s2 === 1){
      // wb: D>Y, D>Z, E>Y, E>Z
      for (var i of find_by_state(ids1, states1, [0, 1]) ){
        for (var j of find_by_state(ids2, states2, [0, 2]) ){
          agg = incr_lil(agg, i, j);
          wb = incr_lil(wb, i, j);
        }
      }
    }
  }
  // done
  return [agg, nn, nb, nw, bn, bw, wn, wb];
}


/**
 * Logical Inference between 2 BWS sets (See `logical_rules`)
 * 
 * @param see logical_rules
 * 
 * Example
 *    const ids1 = ['D', 'E', 'F'];
 *    const ids2 = ['F', 'Y', 'Z'];
 *    const states1 = [1, 0, 2];
 *    const states2 = [1, 0, 2];
 *    const [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
 *     ids1, ids2, states1, states2)
 */
const logical_infer = (ids1, ids2, states1, states2,
                       agg, nn, nb, nw, bn, bw, wn, wb) => {
  // set defaults
  if (agg === undefined){
    agg = {};
  }
  if (nn === undefined){
    nn = {};
  }
  if (nb === undefined){
    nb = {};
  }
  if (nw === undefined){
    nw = {};
  }
  if (bn === undefined){
    bn = {};
  }
  if (bw === undefined){
    bw = {};
  }
  if (wn === undefined){
    wn = {};
  }
  if (wb === undefined){
    wb = {};
  }

  // find common IDs, and loop over them
  const commonids = ids1.filter(x => ids2.includes(x)); // intersection
  for(var uid of commonids){
    try{
      // find positions of the ID
      var p1 = ids1.indexOf(uid);
      var p2 = ids2.indexOf(uid);
      // lookup states of the ID
      var s1 = states1[p1];
      var s2 = states2[p2];
      // apply rules
      [agg, nn, nb, nw, bn, bw, wn, wb] = logical_rules(
        ids1, ids2, states1, states2, s1, s2, 
        agg, nn, nb, nw, bn, bw, wn, wb);
    } catch (err){
      console.log(`Error: ${err.message}`);
    }
  }

  // done
  return [agg, nn, nb, nw, bn, bw, wn, wb];
}


// def logical_infer_update(
//         evaluations: List[Tuple[List[ItemState], List[ItemID]]],
//         database: List[Tuple[List[ItemState], List[ItemID]]] = None,
//         dok: Optional[Dict[Tuple[ItemID, ItemID], int]] = None,
//         detail: Optional[dict] = None) -> (
//             Dict[Tuple[ItemID, ItemID], int], dict):
//     """Run logical inference from a batch/list of BWS sets against ad database

//     Parameters:
//     -----------
//     evaluations: List[Tuple[List[ItemState], List[ItemID]]]
//         A list of new BWS sets to be evaluated.

//     database: List[Tuple[List[ItemState], List[ItemID]]]
//         A database of previously processed BWS sets

//     dok: Optional[Dict[Tuple[ItemID, ItemID], int]]
//         The previous counts/frequencies of logical inferred pairs
//           that need to be updated.

//     detail: Optional[dict]
//         A dictionary of previously stored DOKs for each variant of
//           logically inferred pairs.

//     Returns:
//     --------
//     dok: Optional[Dict[Tuple[ItemID, ItemID], int]]
//         The counts/frequencies of logical inferred pairs.

//     detail: Optional[dict]
//         A dictionary that stores seperate DOKs for each variant of
//           logically inferred pairs.
//     """
const logical_infer_update = (evaluations,
                              database=undefined,
                              agg=undefined,
                              detail=undefined) => {
  // initialize empty dict objects
  if (agg === undefined){
    agg = {};
  }
  if (detail === undefined){
    detail = {"nn": {}, "nb": {}, "nw": {}, "bn": {}, "bw": {}, "wn": {}, "wb": {}};
  }

  // query `detail` object
  var nn = detail["nn"];
  var nb = detail["nb"];
  var nw = detail["nw"];
  var bn = detail["bn"];
  var bw = detail["bw"];
  var wn = detail["wn"];
  var wb = detail["wb"];

  // Create new database
  if (database === undefined){
    database = evaluations;
  }

  // start searching for logical inferences
  for (const [states1, ids1] of evaluations){
    for (const [states2, ids2] of database){
      [agg, nn, nb, nw, bn, bw, wn, wb] = logical_infer(
        ids1, ids2, states1, states2, agg, nn, nb, nw, bn, bw, wn, wb);
    }
  }

  // copy details
  detail["nn"] = nn;
  detail["nb"] = nb;
  detail["nw"] = nw;
  detail["bn"] = bn;
  detail["bw"] = bw;
  detail["wn"] = wn;
  detail["wb"] = wb;

  // done
  return [agg, detail];
}


module.exports = {
  incr_lil,
  add_lil, 
  merge_lil,
  direct_extract,
  direct_extract_batch,
  find_by_state,
  logical_infer,
  logical_infer_update,
  count
};