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