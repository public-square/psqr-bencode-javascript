/**
 * Utility Functions
 *
 * Bencoded strings are not restricted to utf-8, and are best represented
 * as buffers.
 *
 * When translating to a friendly format in javascript, buffers that are
 * not valid utf-8 are converted to a human-readable representation of hex,
 * which can be included in JSON:
 *   "<hex>0A 0B 0C ...</hex>"
 *
 * This is done for strings that are property names as well as strings that are
 * values. BitTorrent version 2 uses property names that include whitespace,
 * include periods, may be binary, and may be zero length.
 *
 * The details are contained in BEP 52, particularly in the "file tree" and
 * "piece layers" sections.
 *   http://www.bittorrent.org/beps/bep_0052.html
 *
 * Note that utility.convertMapToFriendlyObject() does not change BitTorrent
 * property names. Array notation is necessary to handle the properties of
 * zero length or those containing spaces and punctuation:
 *   torrent["info"]["file tree"]["directory1"]["fileA.txt"][""]["pieces root"]
 *   torrent["piece layers"]["<hex>0A 0B 0C ...</hex>"]
 *
 */

//var Buffer = require('safe-buffer').Buffer

const utility = {}

utility.isString = function(s)
{
  return (Object.prototype.toString.call(s) === "[object String]");
}

utility.tryEncodeHexstring = function(data)
{
  const isValidUtf8String = (str) =>
  {
    const replacementChar = '\uFFFD';  // U+FFFD REPLACEMENT CHARACTER
    return (str.indexOf(replacementChar) === -1);
  };

  const encodeToHexstring = (buf)=>
  {
    // example: <hex>0A 0B 0C ...</hex>
    const hexStr = buf.toString('hex').toUpperCase();

    let str = "";
    for (let i = 0; i < hexStr.length; i += 2)
      str += (hexStr.substr(i, 2) + " ");
    str = `<hex>${str.trim()}</hex>`;
    return str;
  };

  const str = data.toString();
  return isValidUtf8String(str)
    ? str
    : encodeToHexstring(Buffer.from(data));
}

utility.tryDecodeHexstring = function(str)
{
  const isHexstring = (str) =>
  {
    const re = /<hex>[0-9a-f ]+<\/hex>/gi;
    return re.test(str);
  };

  const decodeToBuffer = (hex) =>
  {
    const str = hex.substring(5, (hex.length - 6)).replace(/ /g, "");
    return Buffer.from(str, 'hex');
  };

  return isHexstring(str)
    ? decodeToBuffer(str)
    : Buffer.from(str);
}

utility.encodeToArray = function(data)
{
  const ret = [];

  for (const val of data)
  {
    if (typeof val === "number"){ ret.push(val); }

    else if (val instanceof Uint8Array){ ret.push(utility.tryEncodeHexstring(val)); }

    else if (val instanceof Array){ ret.push(utility.encodeToArray(val)); }

    else if (val instanceof Map){ ret.push(utility.encodeToObject(val)); }

    else
    {
      //throw new Error("Type unhandled: " + typeof val + "\nValue: " + val);
    }
  }

  return ret;
}

utility.encodeToObject = function(data)
{
//  const ret: ReturnType<typeof utility.encodeToObject> = {};

  for (const [key, val] of data)
  {
    const keyString = utility.tryEncodeHexstring(key);

    if (typeof val === "number"){ ret[keyString] = val; }

    else if (val instanceof Uint8Array){ ret[keyString] = utility.tryEncodeHexstring(val); }

    else if (val instanceof Array){ ret[keyString] = utility.encodeToArray(val); }

    else if (val instanceof Map){ ret[keyString] = utility.encodeToObject(val); }

    else
    {
      //throw new Error("Type unhandled: " + typeof val + "\nValue: " + val);
    }
  }

  return ret;
}

utility.decodeToArray = function(data)
{
  const ret = [];

  for (const val of data)
  {
    if (typeof val === "number"){ ret.push(val); }

    else if (utility.isString(val)){ ret.push(utility.tryDecodeHexstring(val)); }

    else if (val instanceof Array){ ret.push(utility.decodeToArray(val)); }

    else if (val instanceof Object){ ret.push(utility.decodeToMap(val)); }

    else
    {
      //throw new Error("Type unhandled: " + typeof val + "\nValue: " + val);
    }
  }

  return ret;
}

utility.decodeToMap = function(data)
{
  const ret = new Map();

  for (const [key, val] of Object.entries(data))
  {
    const keyString = utility.tryDecodeHexstring(key);

    if (typeof val === "number"){ ret.set(keyString, val); }

    else if (utility.isString(val)){ ret.set(keyString, utility.tryDecodeHexstring(val)); }

    else if (val instanceof Array){ ret.set(keyString, utility.decodeToArray(val)); }

    else if (val instanceof Object){ ret.set(keyString, utility.decodeToMap(val)); }

    else
    {
      //throw new Error("Type unhandled: " + typeof val + "\nValue: " + val);
    }
  }

  return ret;
}

utility.convertMapToFriendlyObject = function(data)
{
  // handle buffers / strings
  if (Buffer.isBuffer(data)) {
    return utility.tryEncodeHexstring(data)

  // handle numbers
  } else if (typeof(data) === 'number') {
    return data

  // handle arrays
  } else if (Array.isArray(data)) {
    let result = []
    data.forEach((item, i) => {
      result.push(utility.convertMapToFriendlyObject(item))
    });
    return result

  //handle maps
  } else if (data instanceof Map) {
    let result = {}
    for (const [property, value] of data) {
      let safeProperty=utility.convertMapToFriendlyObject(property)
      let safeValue=utility.convertMapToFriendlyObject(value)
      result[safeProperty] = safeValue
    }
    return result

  // this should not happen
  } else {
    console.error('Unrecognized type: ', typeof(data))
  }
  return data
}

utility.convertFriendlyObjectToMap = function(data)
{
  // handle buffers / strings
  if (typeof(data) === 'string') {
    return utility.tryDecodeHexstring(data)

  // handle numbers
  } else if (typeof(data) === 'number') {
    return data

  // handle arrays
  } else if (Array.isArray(data)) {
    let result = []
    data.forEach((item, i) => {
      result.push(utility.convertFriendlyObjectToMap(item))
    });
    return result

  //handle maps
  } else if (data instanceof Map) {
    let result = {}
    for (const [property, value] of data) {
      let mapProperty=utility.convertFriendlyObjectToMap(property)
      let mapValue=utility.convertFriendlyObjectToMap(value)
      result[mapProperty] = mapValue
    }
    return result

  // handle objects
  } else if (typeof(data) === "object") {
    var iterableMap = new Map()

    for (const property of Object.keys(data)){
      let mapProperty=utility.tryDecodeHexstring(property)
      let mapValue=utility.convertFriendlyObjectToMap(data[property])
      iterableMap.set(mapProperty, mapValue)
    }
    return iterableMap

  } else {
    console.error('Unrecognized type: ', typeof(data))
  }
  return data
}

module.exports = utility
