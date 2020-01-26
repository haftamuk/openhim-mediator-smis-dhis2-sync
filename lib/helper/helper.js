
function getKpiValue (agregationFlag, rows) {
  var sum = 0
  var i = 0
  var j = 0
  if (agregationFlag === 'SUM') {
    if (rows.length === 0) {
      return false
    }
    for (i = 0; i < rows.length; i++) {
    /**
     * Check for mulformed rows(Expected 4 elements with kpivALUEbeing the fourth element)
     */
      if (rows[i].length !== 4) {
        return false
      }
      var rowSum = rows[i]
      for (j = 0; j < rowSum.length; j++) {
        var valueToAdd = rowSum[j]
        if (j === 3) {
          sum += parseFloat(valueToAdd)
        }
      }
    }
    return sum
  } else if (agregationFlag === 'AVERAGE') {
    if (rows.length === 0) {
      return false
    }
    for (i = 0; i < rows.length; i++) {
    /**
     * Check for mulformed rows(Expected 4 elements with kpivALUEbeing the fourth element)
     */
      if (rows[i].length !== 4) {
        return false
      }
      var rowAverage = rows[i]
      for (j = 0; j < rowAverage.length; j++) {
        var valueAverage = rowAverage[j]
        if (j === 3) {
          sum += parseFloat(valueAverage)
        }
      }
    }
    return sum / rows.length
  } else if (agregationFlag === 'LAST') {
    if (rows.length === 0) {
      return false
    }
    /**
     * Check for mulformed rows(Expected 4 elements with kpivALUEbeing the fourth element)
     */
    if (rows[i].length !== 4) {
      return false
    }
    var rowLast = rows[rows.length - 1]
    return parseFloat(rowLast[3])
  } else if (agregationFlag === 'FIRST') {
    if (rows.length === 0) {
      return false
    }
    /**
     * Check for mulformed rows(Expected 4 elements with kpivALUEbeing the fourth element)
     */
    if (rows[0].length !== 4) {
      return false
    }
    var rowFirst = rows[0]
    return parseFloat(rowFirst[3])
  } else {
    return false
  }
}
/**
 * This is to avail the function for test
 */
exports.getKpiValue = getKpiValue
