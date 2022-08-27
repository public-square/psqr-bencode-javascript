#!/usr/bin/env node

const bencode = require('./lib/index.js')
const fs = require('fs')


// get script name and arguments
const args = process.argv

// ensure that we have the correct argument count
if (args.length != 4) {
  console.log("Usage:\n", args[1], ' inFile outFile\n')
  process.exit(1)
}

// get input and output files
const outFile = args.pop();
const inFile = args.pop();

// read the file
fs.readFile((inFile), (err, metaInfoJSON) => {
  if (err) return cb(new Error('Unable to read torrent json file'))

  // get an object from JSON
  const metaInfoObj=JSON.parse(metaInfoJSON)

  // get the bencoded torrent from the friendly object
  let metaInfoBencoded = bencode.encodeFriendlyObject(metaInfoObj)

  // write the torrent file
  fs.writeFile(outFile, metaInfoBencoded, (err) => {
    if (err) return cb(new Error('Unable to write torrent file'))
    console.log('Wrote torrent file\n', outFile)
  })

})
