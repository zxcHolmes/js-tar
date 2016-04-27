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