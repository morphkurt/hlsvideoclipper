/*MIT License

Copyright (c) [2019] [Damitha Gunawardena]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var express = require('express');
var app = express();
var util = require('util');
var url  = require('url');

app.get('*/playlist.m3u8', function (req, res) {
    var pathname = url.parse(req.url).pathname;
    var base64Json = pathname.split("/")[1];
    var buffer = new Buffer(base64Json, 'base64'); 
    var json=JSON.parse(buffer.toString('utf8'));
    res.writeHead(200, {"Content-Type": "application/x-mpegurl"});
    res.write("#EXTM3U\n");
    for(var i = 0; i < json.rates.length; i++) {
    	var rate = json.rates[i];
    	res.write("#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH="+rate.rate+"\n");
    	res.write("varient/"+rate.playListName+".m3u8"+"\n");
    }
    res.end();
});

app.get('*/varient/output*m3u8', function (req, res) {
    var pathname = url.parse(req.url).pathname;
    var base64Json = pathname.split("/")[1];
    var playlistname = pathname.split("/")[3].replace('.m3u8','');
    var buffer = new Buffer(base64Json, 'base64'); 
    var json=JSON.parse(buffer.toString('utf8'));
    res.writeHead(200, {"Content-Type": "application/x-mpegurl"});
    res.write("#EXTM3U\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-ALLOW-CACHE:NO\n#EXT-X-VERSION:2\n#EXT-X-TARGETDURATION:8\n");
    if (json.fullLength==1){
	    for(var i = 0; i < json.assetLength; i++) {
    		res.write("#EXTINF:8,"+"\n");
	    	res.write(json.baseDomain+json.urlPrefix+"/"+playlistname+"Frag"+(i+1)+"Num"+i+".ts"+"\n");
	    }
    } else {
	    var firstRun=true;
	    for(var i = 0; i < json.clips.length; i++) {
                var clip = json.clips[i];
	        var startSegment=Math.floor(clip.start/json.segmentLength);
	        var endSegment=Math.ceil(clip.end/json.segmentLength);
		if (firstRun){
			 firstRun=false;
		}
		else {
			res.write("#EXT-X-DISCONTINUITY"+"\n");
		}
		for (var j =startSegment; j <= endSegment;j++){
	                res.write("#EXTINF:"+json.segmentLength+","+"\n");
        	        res.write(json.baseDomain+json.urlPrefix+"/"+playlistname+"Frag"+(j+1)+"Num"+j+".ts"+"\n");
		}
            }

    }
    res.write("#EXT-X-ENDLIST");
    res.end();
});


app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
