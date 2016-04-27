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