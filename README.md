Bit of a skunkwork to clip HLS video streams to create video clips on the fly.

# Concept

Unencrypted HLS stream typically looks like this.

~~~
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:NO
#EXT-X-VERSION:2
#EXT-X-TARGETDURATION:8
#EXTINF:8,
output_2400kbps_720p.mp4Frag1Num0.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag2Num1.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag3Num2.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag4Num3.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag5Num4.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag6Num5.ts
~~~

Each TS segment file has a fixed length and always starts with a key frame. Which means we can extract certain segments and create a seperate clip without re-encoding the video. 

Example
~~~
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:NO
#EXT-X-VERSION:2
#EXT-X-TARGETDURATION:8
#EXTINF:8,
output_2400kbps_720p.mp4Frag4Num3.ts
#EXTINF:8,
output_2400kbps_720p.mp4Frag5Num4.ts
#EXT-X-ENDLIST
~~~

With this concept for a given time window. We can calculate the segment numbers we are required to make avaialble on the playlist to create the clip.

~~~
startSegmentNumber = Math.floor(clip.start/json.segmentLength)
endSegment=Math.ceil(clip.end/json.segmentLength);
~~~

