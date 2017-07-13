/*
*modify by zxc 2017-7-4
*/
; (function (window) {
  //ie hook
  if (!FileReader.prototype.readAsBinaryString) {
      FileReader.prototype.readAsBinaryString = function (fileData) {
          var binary = "";
          var pt = this;
          var reader = new FileReader();
          reader.onload = function (e) {
              var bytes = new Uint8Array(reader.result);
              var length = bytes.byteLength;
              for (var i = 0; i < length; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              //pt.result  - readonly so assign binary
              pt.content = binary;
              $(pt).trigger('onloadend');
          }
          reader.readAsArrayBuffer(fileData);
      }
  }
  var chunkSize=512;
  var readHeader=function(bytes,entries){
	  var fileAsBytes = ByteHelper.stringUTF8ToBytes(bytes);
	  var reader = new ByteStreamLittleEndian(fileAsBytes);
	  var chunkAsBytes = reader.readBytes(512);
	  var areAllBytesInChunkZeroes = true;
      for (var b = 0; b < chunkAsBytes.length; b++) {
		  if (chunkAsBytes[b] != 0) {
			areAllBytesInChunkZeroes = false;
		  }
      }
	  if(!areAllBytesInChunkZeroes){
		  var header = TarFileEntryHeader.fromBytes(chunkAsBytes);
		  entries.push(header);
		  var sizeOfDataEntryInBytesUnpadded = header.fileSizeInBytes;
		  var numberOfChunksOccupiedByDataEntry = Math.ceil(sizeOfDataEntryInBytesUnpadded / chunkSize);
          var sizeOfDataEntryInBytesPadded = numberOfChunksOccupiedByDataEntry * chunkSize;
		  return sizeOfDataEntryInBytesPadded;
	  }else {
		  return -1;
	  }
	  
  }
  var blobSlice =function (blob, index, length) {
		if (index < 0 || length < 0 || index + length > blob.size)
			throw new RangeError('offset:' + index + ', length:' + length + ', size:' + blob.size);
		if (blob.slice)
			return blob.slice(index, index + length);
		else if (blob.webkitSlice)
			return blob.webkitSlice(index, index + length);
		else if (blob.mozSlice)
			return blob.mozSlice(index, index + length);
		else if (blob.msSlice)
			return blob.msSlice(index, index + length);
	}
  
  var readFile2=function(file,callBack){
	  //console.log(file);
	  var entries=new Array();
	  readFile3(file,0,entries,callBack);
  }
  
  var readFile3=function(blobMain,start,entries,callBack){
	  var fileReader = new FileReader();
	  fileReader.onloadend = function (e) {
		  var _fileReader=e.target;
		  var result = null;
		  if (_fileReader.readyState === FileReader.DONE) {
			result = _fileReader.result;
		  }
		  if (!result) {
			result = _fileReader.content;
		  }
		  var dataSize=readHeader(result,entries);
		  if(dataSize==-1){
			  callBack(null,entries);
			  return;
		  }
		  var end=_fileReader._data[0];
		  if(end>=blobMain.size){
			  callBack(null,entries);
			  return;
		  }
		  readFile3(blobMain,end+dataSize,entries,callBack);
	  };
	  try{
		  fileReader.readAsBinaryString(blobSlice(blobMain,start,chunkSize));
	  }catch(e){
		  callBack(new Error("not a valid tar"),null);
		  return ;
	  }
	  fileReader._data=new Array();
	  fileReader._data.push((start+chunkSize));
  }
  
  var readFile = function (file, callback) {
	readFile2(file);
	return;
    var fileReader = new FileReader();
    fileReader.onloadend = function (e) {
        fileReader=e.target;
      var result = null;
      if (fileReader.readyState === FileReader.DONE) {
        result = fileReader.result;
      }
	  
	  
      if (!result) {
        result = fileReader.content;
      }
	  console.log("readHeader");
	  readHeader(result);
	  return ;
      if (callback) {
        callback(result);
      }
    };
    fileReader.readAsBinaryString(file);
  };
  
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
ByteStreamLittleEndian.prototype.length=function(){
  return this.bytes.length;	
}

ByteStreamLittleEndian.prototype.byteIndex=function(){
  return this.byteIndexCurrent;
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
function FileHelper() {

}

FileHelper.destroyClickedElement = function (event) {
  document.body.removeChild(event.target);
};



FileHelper.loadFileAsBinaryString = function (fileToLoad, contextForCallback, callback) {
  var fileReader = new FileReader();
  fileReader.onloadend = function (fileLoadedEvent) {
    var returnValue = null;
    if (fileLoadedEvent.target.readyState == FileReader.DONE) {
      returnValue = fileLoadedEvent.target.result;
    }
    callback.call(contextForCallback, fileToLoad, returnValue);
  }
  fileReader.readAsBinaryString(fileToLoad);
};

FileHelper.saveBytesAsFile = function (bytesToWrite, fileNameToSaveAs) {
  var bytesToWriteAsArrayBuffer = new ArrayBuffer(bytesToWrite.length);
  var bytesToWriteAsUIntArray = new Uint8Array(bytesToWriteAsArrayBuffer);
  for (var i = 0; i < bytesToWrite.length; i++) {
    bytesToWriteAsUIntArray[i] = bytesToWrite[i];
  }
  var bytesToWriteAsBlob = new Blob([bytesToWriteAsArrayBuffer], { type: 'application/type' });
  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(bytesToWriteAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = FileHelper.destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
}
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
function TarFileTypeFlag(value, name) {
  this.value = value;
  this.id = "_" + value;
  this.name = name;
}

function TarFileTypeFlag_Instances() {
  this.Normal = new TarFileTypeFlag(0, "Normal");
  this.HardLink = new TarFileTypeFlag(1, "Hard Link");
  this.SymbolicLink = new TarFileTypeFlag(2, "Symbolic Link");
  this.CharacterSpecial = new TarFileTypeFlag(3, "Character Special");
  this.BlockSpecial = new TarFileTypeFlag(4, "Block Special");
  this.Directory = new TarFileTypeFlag(5, "Directory");
  this.FIFO = new TarFileTypeFlag(6, "FIFO");
  this.ContiguousFile = new TarFileTypeFlag(7, "Contiguous File");
  this._All = [
    this.Normal,
    this.HardLink,
    this.SymbolicLink,
    this.CharacterSpecial,
    this.BlockSpecial,
    this.Directory,
    this.FIFO,
    this.ContiguousFile,
  ];

  for (var i = 0; i < this._All.length; i++) {
    var item = this._All[i];
    this._All[item.id] = item;
  }
}

TarFileTypeFlag.Instances = new TarFileTypeFlag_Instances();
function TarFileEntryHeader(fileName,
  fileMode,
  userIDOfOwner,
  userIDOfGroup,
  fileSizeInBytes,
  timeModifiedInUnixFormat,
  checksum,
  typeFlag,
  nameOfLinkedFile,
  uStarIndicator,
  uStarVersion,
  userNameOfOwner,
  groupNameOfOwner,
  deviceNumberMajor,
  deviceNumberMinor,
  filenamePrefix
) {
  this.fileName = fileName;
  this.fileMode = fileMode;
  this.userIDOfOwner = userIDOfOwner;
  this.userIDOfGroup = userIDOfGroup;
  this.fileSizeInBytes = fileSizeInBytes;
  this.timeModifiedInUnixFormat = timeModifiedInUnixFormat;
  this.checksum = checksum;
  this.typeFlag = typeFlag;
  this.nameOfLinkedFile = nameOfLinkedFile;
  this.uStarIndicator = uStarIndicator;
  this.uStarVersion = uStarVersion;
  this.userNameOfOwner = userNameOfOwner;
  this.groupNameOfOwner = groupNameOfOwner;
  this.deviceNumberMajor = deviceNumberMajor;
  this.deviceNumberMinor = deviceNumberMinor;
  this.filenamePrefix = filenamePrefix;
}

TarFileEntryHeader.fromBytes = function (bytes) {
  var reader = new ByteStreamLittleEndian(bytes);

  var fileName = reader.readString(100).trim();
  var fileMode = reader.readString(8);
  var userIDOfOwner = reader.readString(8);
  var userIDOfGroup = reader.readString(8);
  var fileSizeInBytesAsStringOctal = reader.readString(12).trim();
  var timeModifiedInUnixFormat = reader.readBytes(12);
  var checksum = reader.readBytes(8);
  var typeFlagValue = reader.readString(1);
  var nameOfLinkedFile = reader.readBytes(100);
  var uStarIndicator = reader.readBytes(6);
  var uStarVersion = reader.readBytes(2);
  var userNameOfOwner = reader.readBytes(32);
  var groupNameOfOwner = reader.readBytes(32);
  var deviceNumberMajor = reader.readBytes(8);
  var deviceNumberMinor = reader.readBytes(8);
  var filenamePrefix = reader.readString(155);

  var fileSizeInBytes = OctalHelper.parseString(fileSizeInBytesAsStringOctal);

  var typeFlags = TarFileTypeFlag.Instances._All;
  var typeFlag = typeFlags[typeFlagValue];

  var returnValue = new TarFileEntryHeader(
    fileName,
    fileMode,
    userIDOfOwner,
    userIDOfGroup,
    fileSizeInBytes,
    timeModifiedInUnixFormat,
    checksum,
    typeFlag,
    nameOfLinkedFile,
    uStarIndicator,
    uStarVersion,
    userNameOfOwner,
    groupNameOfOwner,
    deviceNumberMajor,
    deviceNumberMinor,
    filenamePrefix
  );

  return returnValue;
};

TarFileEntryHeader.prototype.toString = function () {
  var newline = "\n";
  var returnValue = "[TarFileEntryHeader " + "fileName='" + this.fileName + "' " + "typeFlag='" + (this.typeFlag == null ? "err" : this.typeFlag.name) + "' " + "fileSizeInBytes='" + this.fileSizeInBytes + "' " + "]" + newline;
  return returnValue;
};
function TarFileEntry(header, dataAsBytes) {
  this.header = header;
  this.dataAsBytes = dataAsBytes;
}

TarFileEntry.prototype.buttonDownload_Click = function (event) {
  FileHelper.saveBytesAsFile(this.dataAsBytes, this.header.fileName);
};

TarFileEntry.prototype.toString = function () {
  var newline = "\n";
  headerAsString = this.header.toString();
  var dataAsHexadecimalString = ByteHelper.bytesToStringHexadecimal(this.dataAsBytes);
  var returnValue = "[TarFileEntry]" + newline + headerAsString + "[Data]" + dataAsHexadecimalString + "[/Data]" + newline + "[/TarFileEntry]" + newline;
  return returnValue;
};
function TarFile(fileName, entries) {
  this.fileName = fileName;
  this.entries = entries;
}

TarFile.ChunkSize = 512;
TarFile.NOT_TAR_FILE=1;
TarFile.SIZE_NOT_SATISFY=2;
TarFile.SIZE_SATISFY=3;
TarFile.judgeBytes=function(bytes){
	var chunkSize = TarFile.ChunkSize;
	if(bytes.length<512){
		throw new error("judge Bytes.length must be positive 512");
	}
	var reader = new ByteStreamLittleEndian(bytes);
	var chunkAsBytes = reader.readBytes(chunkSize);
	for (var b = 0; b < chunkAsBytes.length; b++) {
      if (chunkAsBytes[b] != 0) {
        areAllBytesInChunkZeroes = false;
      }
    }
	if(areAllBytesInChunkZeroes){
		return {"code":TarFile.NOT_TAR_FILE};
	}else {
		
	}
}

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
      var entry = new TarFileEntry(header, []);
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
  
  function Tar(){
    
  }

  Tar.unpack = function (file, callback) {
    readFile(file, function (text) {
      var fileAsBytes = ByteHelper.stringUTF8ToBytes(text);
      var tarFile = TarFile.fromBytes(file.fileName, fileAsBytes);
      callback(tarFile.getFileList());
    });
  };
  
  Tar.listFileName=function(file,callBack){
	  readFile2(file,callBack);
  }
  
  Tar.vresion = '0.0.1';

  window.Tar = Tar;
})(window);
