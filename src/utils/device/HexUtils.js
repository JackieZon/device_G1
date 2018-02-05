//获取某位的值
export function getBit(val, bit) {
    /*1 return true; 0 return false*/
    return ((val & (0x1 << bit)) >> bit) == 1;
}
//设置位
export function setBit(val, bit) {
    return val | (0x1 << bit)
}
//清除位
export function clearBit(val, bit) {
    var a = 255;
    for (var i = 0; i <= bit; i++) {
        a = a << 1;
        if (i > 0) a++;
    }
    return val & a;
}
//位翻转
export function reverseBit(val, bit) {
    if (getBit(val, bit)) return clearBit(val, bit);
    else return setBit(val, bit);
}



 
//Hex to ASCII
export function toAscii(str)
{
    var symbols = " !\"#$%&'()*+,-./0123456789:;<=>?@";
    var loAZ = "abcdefghijklmnopqrstuvwxyz";
    symbols+= loAZ.toUpperCase();
    symbols+= "[\\]^_`";
    symbols+= loAZ;
    symbols+= "{|}~";

  var valueStr = str.toLowerCase();
  var hex = "0123456789abcdef";
  var text = "";
  var i=0;
 
  for( i=0; i<valueStr.length; i=i+2 )
  {
    var char1 = valueStr.charAt(i);
    if ( char1 == ':' )
    {
      i++;
      char1 = valueStr.charAt(i);
    }
    var char2 = valueStr.charAt(i+1);
    var num1 = hex.indexOf(char1);
    var num2 = hex.indexOf(char2);
    var value = num1 << 4;
    value = value | num2;
 
    var valueInt = parseInt(value);
    var symbolIndex = valueInt - 32;
    var ch = '?';
    if ( symbolIndex >= 0 && value <= 126 )
    {
      ch = symbols.charAt(symbolIndex)
    }
    text += ch;
  }
  return text;
}



/**
*  Byte数组转Base64字符,原理同上
* @Param array Byte数组
* @return Base64字符串
**/
export function bytesToBase64(array) {
    if (array.length == 0) {
        return "";
    }
    var b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var result = "";
    // 给末尾添加的字符,先计算出后面的字符
    var d3 = array.length % 3;
    var endChar = "";
    if (d3 == 1) {
        var value = array[array.length - 1];
        endChar = b64Chars.charAt(value >> 2);
        endChar += b64Chars.charAt((value << 4) & 0x3F);
        endChar += "==";
    } else if (d3 == 2) {
        var value1 = array[array.length - 2];
        var value2 = array[array.length - 1];
        endChar = b64Chars.charAt(value1 >> 2);
        endChar += b64Chars.charAt(((value1 << 4) & 0x3F) + (value2 >> 4));
        endChar += b64Chars.charAt((value2 << 2) & 0x3F);
        endChar += "=";
    }

    var times = array.length / 3;
    var startIndex = 0;
    // 开始计算
    for (var i = 0; i < times - (d3 == 0 ? 0 : 1); i++) {
        startIndex = i * 3;

        var S1 = array[startIndex + 0];
        var S2 = array[startIndex + 1];
        var S3 = array[startIndex + 2];

        var s1 = b64Chars.charAt(S1 >> 2);
        var s2 = b64Chars.charAt(((S1 << 4) & 0x3F) + (S2 >> 4));
        var s3 = b64Chars.charAt(((S2 & 0xF) << 2) + (S3 >> 6));
        var s4 = b64Chars.charAt(S3 & 0x3F);
        // 添加到结果字符串中
        result += (s1 + s2 + s3 + s4);
    }

    return result + endChar;
}


/**
 * 将 (Base64) 字符串转换成 (10进制) 数据
 * @param base64String 字符串
 * @return Byte数组[0x00,0x00]
 */
export function base64ToBytes(base64String) {
    var result = new Array();
    // 所有(字节)转成(base64)前必须是(8位)二进制字节 转换流程  值 => ASCII对应码 => 00000000(二进制) => 一个字节(8位)至少转成两组二进制(分成两组6位的二进制位，不够在尾数补零) => 4位base64字符
    // 用base64String字符串模以4 的余数来判断是否是正规的base64
    if (base64String.length % 4 != 0 || base64String.length == 0) {
        return result;
    }
    var b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // 先将后面的字段转换成原来的Byte数组
    var len = base64String.length;
    var endBytes = new Array();
    if (base64String.charAt(len - 1) == "=") {
        if (base64String.charAt(len - 2) == "=") {                                // 有两个等号的情况
            var s1 = base64String.charAt(len - 4);                             // 后面的第一个字符
            var s2 = base64String.charAt(len - 3);                             // 后面的第二个字符
            var v1 = ((b64Chars.indexOf(s1) << 2) & 0xFF) + (b64Chars.indexOf(s2) >> 4); //这个就是最后面的一个字节

            endBytes[0] = v1;
        } else {                                                              // 只有一个等号的情况
            var s1 = base64String.charAt(len - 4);                             // 后面的第一个字符
            var s2 = base64String.charAt(len - 3);                             // 后面的第二个字符
            var s3 = base64String.charAt(len - 2);                             // 后面的第三个字符

            var v1 = ((b64Chars.indexOf(s1) << 2) & 0xFF) + (b64Chars.indexOf(s2) >> 4);       //这个就是最后面的第一个字节
            var v2 = ((b64Chars.indexOf(s2) << 4) & 0xFF) + (b64Chars.indexOf(s3) >> 2);       //这个就是最后面的第二个字节

            endBytes[0] = v1;
            endBytes[1] = v2;
        }
    }

    var times = base64String.length / 4;

    for (var i = 0; i < times - (endBytes.length == 0 ? 0 : 1); i++) {
        var startIndex = i * 4;
        var V1 = base64String.charAt(startIndex + 0);
        var V2 = base64String.charAt(startIndex + 1);
        var V3 = base64String.charAt(startIndex + 2);
        var V4 = base64String.charAt(startIndex + 3);

        result[i * 3 + 0] = ((b64Chars.indexOf(V1) << 2) & 0xFF) + (b64Chars.indexOf(V2) >> 4);
        result[i * 3 + 1] = ((b64Chars.indexOf(V2) << 4) & 0xFF) + (b64Chars.indexOf(V3) >> 2);
        result[i * 3 + 2] = ((b64Chars.indexOf(V3) << 6) & 0xFF) + b64Chars.indexOf(V4);
    }

    return result.concat(endBytes);
}


/**
 * Byte数组转Number
 * 将 二进制 转换成 十进制数字
 * @Param array Byte数组
 * @return Hex字符串
 **/
export function bytesToNumber(bytes) {
    var tmpbytes = bytes.concat();
    tmpbytes.reverse();
    return parseInt(bytesToHex(tmpbytes), 16);
}

/**
* 将Hex字符串转换成Byte数组
* 将(16进制)转换成(二进制)
* @param hex Hex字符串
* @return Byte数组[0x00,0x00]
*/
export function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

/**
*  数字数组转Hex字符串
*  将(十进制)转换成(16进制)
* @Param array Byte数组
* @return Hex字符串
**/
export function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

/**
* 将Hex字符串转换成Byte
* 将(16进制)转换成(二进制)
* @param hex Hex字符串
* @return Byte 0x00
*/
export function hexToByte(hex) {
    return parseInt(hex, 16);
}

/**
*  Byte转Hex字符串
*  将(二进制)转换成(16进制)
* @Param array Byte
* @return Hex字符串 0A
**/
export function byteToHex(byte) {
    var hex = []
    hex.push((byte >>> 4).toString(16));
    hex.push((byte & 0xF).toString(16));
    return hex.join("");
}