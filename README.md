##README.md 
js-tar，可以在本地读取tar包，修改自HstarStudio的js-tar项目，原项目可以读取tar包，但是仅限于小的tar包，大的tar包  
比如docker镜像，甚至几百MB大小的，就无法读取了，因为原项目代码逻辑是先把文件全部转换成bytes，这里主要做的修改是利用  
Blob.slice函数进行逐步读取逐步修改，而不是全部读出来，因为全部读出来，内存明显不够。  
主要做的工作是读取tar包里面的文件名，对tar包文件的byte不做保留  
这个项目主要的作用是读取tar包里面有什么文件，好做判断。  
最近有个项目，需要判断docker镜像，而docker镜像的结构是里面有manifest.json和repositories这两个文件。  
虽然还不太严谨，但是对于前端Docker验证镜像的合法性已经足够了。  
支持读取的tar包文件大小可以达到几百MB，甚至几G的大小。  
****************************************************
translated by google translate

Js-tar, you can read the tar package locally, modify the js-tar project from HstarStudio, the original project can read the tar package, but only for small tar packages,   
large tar packages,Such as docker mirror, or even hundreds of MB size, can not read, because the original project code logic is the first file into all bytes, where the main changes are made use The Blob.slice function is progressively read step by step, rather than reading all, because all read out, the memory is not enough.  
The main thing to do is to read the tar file inside the file name, the tar package file does not save the byte  
The main role of this project is to read what file inside the tar package, so easy to judge.  
Recently there is a project, need to determine the docker mirror, and docker mirror structure is inside the manifest.json and repositories these two files.  
Although it is not too rigorous, but for the front-end Docker verify the legitimacy of the mirror is enough.  
Support to read the tar package file size can reach hundreds of MB, or even a few G size.  

---
#ja-tar
-------------


### Usages:
``` javascript
<input type="file" accept="application/x-tar" id="inputFile">
<script type="text/javascript" src="/path/js-tar.js"></script>
var inputFile= document.getElementById('inputFile');
inputFile.addEventListener("change",function(event){
	var tarFile = inputFile.files[0];
	window.Tar.listFileName(tarFile,function(err,result){
				if(err){
					console.log("not a tar");
				}else {
					console.log(result);
				}
			});
```

## License
MIT
