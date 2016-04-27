function OctalHelper() {

}

OctalHelper.parseString = function (stringToParse) {
  var returnValue = 0;
  var numberOfDigits = stringToParse.length;
  for (var d = 0; d < numberOfDigits; d++) {
    var octalDigitAsString = stringToParse[numberOfDigits - d - 1];
    var octalDigitAsNumber = parseInt(octalDigitAsString);
    var valueOfDigitInPlace = octalDigitAsNumber << (3 * d);
    returnValue += valueOfDigitInPlace;
  }
  return returnValue;
};