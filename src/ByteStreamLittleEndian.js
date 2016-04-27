function ByteStreamLittleEndian(bytes) {
  this.bytes = bytes;
  this.byteIndexCurrent = 0;
}

ByteStreamLittleEndian.BitsPerByte = 8;
ByteStreamLittleEndian.BitsPerByteTimesTwo = ByteStreamLittleEndian.BitsPerByte * 2;
ByteStreamLittleEndian.BitsPerByteTimesThree = ByteStreamLittleEndian.BitsPerByte * 3;


ByteStreamLittleEndian.prototype.hasMoreBytes = function () {
  return (this.byteIndexCurrent < this.bytes.length);
};

ByteStreamLittleEndian.prototype.peekBytes = function (numberOfBytesToRead) {
  var returnValue = [];
  for (var b = 0; b < numberOfBytesToRead; b++) {
    returnValue[b] = this.bytes[this.byteIndexCurrent + b];
  }
  return returnValue;
};

ByteStreamLittleEndian.prototype.readBytes = function (numberOfBytesToRead) {
  var returnValue = [];
  for (var b = 0; b < numberOfBytesToRead; b++) {
    returnValue[b] = this.readByte();
  }
  return returnValue;
};

ByteStreamLittleEndian.prototype.readByte = function () {
  var returnValue = this.bytes[this.byteIndexCurrent];
  this.byteIndexCurrent++;
  return returnValue;
};

ByteStreamLittleEndian.prototype.readInt = function () {
  var returnValue =
    (
      (this.readByte() & 0xFF) | ((this.readByte() & 0xFF) << ByteStreamLittleEndian.BitsPerByte) | ((this.readByte() & 0xFF) << ByteStreamLittleEndianBitsPerByteTimesTwo) | ((this.readByte() & 0xFF) << ByteStreamLittleEndianBitsPerByteTimesThree)
    );
  return returnValue;
};

ByteStreamLittleEndian.prototype.readShort = function () {
  var returnValue =
    (
      (this.readByte() & 0xFF) | ((this.readByte() & 0xFF) << ByteStreamLittleEndianBitsPerByte)
    );
  return returnValue;
};

ByteStreamLittleEndian.prototype.readString = function (lengthOfString) {
  var returnValue = "";
  for (var i = 0; i < lengthOfString; i++) {
    var byte = this.readByte();

    if (byte != 0) {
      var byteAsChar = String.fromCharCode(byte);
      returnValue += byteAsChar;
    }
  }
  return returnValue;
};

ByteStreamLittleEndian.prototype.writeBytes = function (bytesToWrite) {
  for (var b = 0; b < bytesToWrite.length; b++) {
    this.bytes.push(bytesToWrite[b]);
  }
  this.byteIndexCurrent = this.bytes.length;
};

ByteStreamLittleEndian.prototype.writeByte = function (byteToWrite) {
  this.bytes.push(byteToWrite);
  this.byteIndexCurrent++;
};

ByteStreamLittleEndian.prototype.writeInt = function (integerToWrite) {
  this.bytes.push((integerToWrite & 0x000000FF));
  this.bytes.push((integerToWrite & 0x0000FF00) >>> ByteStreamLittleEndianBitsPerByte);
  this.bytes.push((integerToWrite & 0x00FF0000) >>> ByteStreamLittleEndianBitsPerByteTimesTwo);
  this.bytes.push((integerToWrite & 0xFF000000) >>> ByteStreamLittleEndianBitsPerByteTimesThree);
  this.byteIndexCurrent += 4;
};

ByteStreamLittleEndian.prototype.writeShort = function (shortToWrite) {
  this.bytes.push((shortToWrite & 0x00FF));
  this.bytes.push((shortToWrite & 0xFF00) >>> ByteStreamLittleEndianBitsPerByte);
  this.byteIndexCurrent += 2;
};

ByteStreamLittleEndian.prototype.writeString = function (stringToWrite) {
  for (var i = 0; i < stringToWrite.length; i++) {
    this.writeByte(stringToWrite.charCodeAt(i));
  }
};