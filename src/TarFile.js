function TarFile(fileName, entries) {
  this.fileName = fileName;
  this.entries = entries;
}

TarFile.ChunkSize = 512;

TarFile.fromBytes = function (fileName, bytes) {
  var reader = new ByteStreamLittleEndian(bytes)
  var entries = [];
  var chunkSize = TarFile.ChunkSize;
  var numberOfConsecutiveZeroChunks = 0;
  while (reader.hasMoreBytes() == true) {
    var chunkAsBytes = reader.readBytes(chunkSize);
    var areAllBytesInChunkZeroes = true;
    for (var b = 0; b < chunkAsBytes.length; b++) {
      if (chunkAsBytes[b] != 0) {
        areAllBytesInChunkZeroes = false;
      }
    }
    if (areAllBytesInChunkZeroes == true) {
      numberOfConsecutiveZeroChunks++;
      if (numberOfConsecutiveZeroChunks == 2) {
        break;
      }
    } else {
      numberOfConsecutiveZeroChunks = 0;
      var header = TarFileEntryHeader.fromBytes(chunkAsBytes);
      var sizeOfDataEntryInBytesUnpadded = header.fileSizeInBytes;
      var numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize);
      var sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize;
      var dataAsBytes = reader.readBytes(sizeOfDataEntryInBytesPadded).slice(0, sizeOfDataEntryInBytesUnpadded);
      var entry = new TarFileEntry(header, dataAsBytes);
      entries.push(entry);
    }
  }
  var returnValue = new TarFile(fileName, entries);
  return returnValue;
};

TarFile.prototype.getFileList = function () {
  return this.entries;
};

TarFile.prototype.toString = function () {
  var newline = "\n";
  var returnValue = "[TarFile]" + newline;
  for (var i = 0; i < this.entries.length; i++) {
    var entry = this.entries[i];
    var entryAsString = entry.toString();
    returnValue += entryAsString;
  }
  returnValue += "[/TarFile]" + newline;
  return returnValue;
};