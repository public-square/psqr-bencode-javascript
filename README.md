# psqr-bencode-javascript
A node library for bencoding and bdecoding torrent metaInfo with friendly javascript object translation.

## Data Structure
This library translates bencoded data to javascript maps. Further translation is
available to JSON-friendly javascript objects.

## Strings
Bencoded strings are not restricted to utf-8, and are represented as buffers
when decoding to javascript maps. This applies to property names as well as
values.

## Javascript / JSON Friendly Objects
When translating to a friendly format in javascript, buffers that are
not valid utf-8 are converted to a human-readable representation of hex,
which can be included in JSON:
```
   "<hex>0A 0B 0C 11 22 33</hex>"
```

## BitTorrent v2 Property Names
BitTorrent version 2 uses property names that include whitespace, include
periods, may be binary, and may be zero length.

The details are contained in BEP 52, particularly in the "file tree" and
"piece layers" sections.

  http://www.bittorrent.org/beps/bep_0052.html


Note that `utility.convertMapToFriendlyObject()` does not change BitTorrent
property names. Array notation is necessary to handle the properties of
zero length or those containing spaces and punctuation:
```
  metaInfoObj["info"]["file tree"]["directory1"]["fileA.txt"][""]["pieces root"]
  metaInfoObj["piece layers"]["<hex>0A 0B 0C 11 22 33</hex>"]
```
