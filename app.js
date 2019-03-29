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
	                res.write("#EXTINF:8,"+"\n");
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
