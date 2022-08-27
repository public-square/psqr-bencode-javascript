#!/usr/bin/env node

const bencode = require('./lib/index.js')
const fs = require('fs')

// get script name and arguments
const args = process.argv

// ensure that we have the correct argument count
if (args.length != 3) {
  console.log("Usage:\n", args[1], ' inFile \n')
  process.exit(1)
}

// get input and output files
const inFile = args.pop();

// read the file
fs.readFile((inFile), (err, metaInfoBencoded) => {
  if (err) return cb(new Error('Unable to read torrent metainfo file'))

  // convert bencoded data to a friendly javascript object
  let metaInfo = bencode.decodeToFriendlyObject(metaInfoBencoded)

  // encode as json and output
  console.log(JSON.stringify(metaInfo, null, 4))
})
