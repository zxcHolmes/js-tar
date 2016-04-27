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
  var readFile = function (file, callback) {
    var fileReader = new FileReader();
    fileReader.onloadend = function () {
      var result = null;
      if (fileReader.readyState === FileReader.DONE) {
        result = fileReader.result;
      }
      if (!result) {
        result = fileReader.content;
      }
      if (callback) {
        callback(result);
      }
    };
    fileReader.readAsBinaryString(file);
  };
  
  /*GULP_REPLACE_HOLDER_FOR_TAR*/
  
  function Tar(){
    
  }

  Tar.unpack = function (file, callback) {
    readFile(file, function (text) {
      var fileAsBytes = ByteHelper.stringUTF8ToBytes(text);
      var tarFile = TarFile.fromBytes(file.fileName, fileAsBytes);
      callback(tarFile.getFileList());
    });
  };
  
  Tar.vresion = '0.0.1';

  window.Tar = Tar;
})(window);