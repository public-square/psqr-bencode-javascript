var bencode = module.exports

bencode.encode = require('./encode')
bencode.decode = require('./decode')
bencode.utility = require('./utility')


/**
 * Determines the amount of bytes
 * needed to encode the given value
 * @param  {Object|Array|Buffer|String|Number|Boolean} value
 * @return {Number} byteCount
 */
bencode.byteLength = bencode.encodingLength = function (value) {
  return bencode.encode(value).length
}

/**
 * Bdecode a torrent and convert it to a friendly javascript object.
 * @param  {Buffer} metaInfoBencoded
 * @return {Object} metaInfoObj
 */
bencode.decodeToFriendlyObject = function (metaInfoBencoded) {
  return bencode.utility.convertMapToFriendlyObject(
    bencode.decode(metaInfoBencoded)
  )
}

/**
 * Bencode a friendly javascript object to a torrent.
 * @param  {Object} metaInfoObj
 * @return {Buffer} metaInfoBencoded
 */
bencode.encodeFriendlyObject = function (metaInfoObj) {
  return bencode.encode(
    bencode.utility.convertFriendlyObjectToMap(metaInfoObj)
  )
}
