
function getKpiValue (agregationFlag, rows) {
  var sum = 0
  var i = 0
  var j = 0
  if (agregationFlag === 'SUM') {
    for (i = 0; i < rows.length; i++) {
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
    for (i = 0; i < rows.length; i++) {
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
    var rowLast = rows[rows.length - 1]
    return parseFloat(rowLast[3])
  } else if (agregationFlag === 'FIRST') {
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
