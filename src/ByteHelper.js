function ByteHelper() {

}

ByteHelper.BitsPerByte = 8;
ByteHelper.BitsPerNibble = ByteHelper.BitsPerByte / 2;
ByteHelper.ByteValueMax = Math.pow(2, ByteHelper.BitsPerByte) - 1;

ByteHelper.bytesToStringHexadecimal = function (bytesToConvert) {
  var returnValue = "";
  var bitsPerNibble = ByteHelper.BitsPerNibble;
  for (var i = 0; i < bytesToConvert.length; i++) {
    var byte = bytesToConvert[i];
    for (var d = 1; d >= 0; d--) {
      var digitValue = byte >> (bitsPerNibble * d) & 0xF;
      var digitString = "";
      digitString += (digitValue < 10 ? digitValue : String.fromCharCode(55 + digitValue));
      returnValue += digitString;
    }
    returnValue += " ";
  }
  return returnValue;
};

ByteHelper.bytesToStringUTF8 = function (bytesToConvert) {
  var returnValue = "";
  for (var i = 0; i < bytesToConvert.length; i++) {
    var charCode = bytesToConvert[i];
    var character = String.fromCharCode(charCode);
    returnValue += character;
  }
  return returnValue;
};

ByteHelper.bytesToNumber = function (bytes) {
  var returnValue = 0;
  var bitsPerByte = ByteHelper.BitsPerByte;
  for (var i = 0; i < bytes.length; i++) {
    var byte = bytes[i];
    var byteValue = (byte << (bitsPerByte * i));
    returnValue += byteValue;
  }
  return returnValue;
};

ByteHelper.numberOfBytesNeededToStoreNumber = function (number) {
  var numberOfBitsInNumber = Math.ceil(
    Math.log(number + 1) / Math.log(2)
  );
  var numberOfBytesNeeded = Math.ceil(numberOfBitsInNumber / ByteHelper.BitsPerByte);
  return numberOfBytesNeeded;
};

ByteHelper.numberToBytes = function (number, numberOfBytesToUse) {
  var returnValues = [];
  if (numberOfBytesToUse == null) {
    numberOfBytesToUse = this.numberOfBytesNeededToStoreNumber(number);
  }
  var bitsPerByte = ByteHelper.BitsPerByte;

  for (var i = 0; i < numberOfBytesToUse; i++) {
    var byte = (number >> (bitsPerByte * i)) & 0xFF;
    returnValues.push(byte);
  }
  return returnValues;
};

ByteHelper.stringUTF8ToBytes = function (stringToConvert) {
  var returnValues = [];
  for (var i = 0; i < stringToConvert.length; i++) {
    var charCode = stringToConvert.charCodeAt(i);
    returnValues.push(charCode);
  }
  return returnValues;
};

ByteHelper.xorBytesWithOthers = function (bytes0, bytes1) {
  for (var i = 0; i < bytes0.length; i++) {
    bytes0[i] ^= bytes1[i];
  }
  return bytes0;
}