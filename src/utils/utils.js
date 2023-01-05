import { Toast } from "antd-mobile";
/****************设备号uuid*******************/
export function uuidForDevice(len, radix) {
  let visitUUID = window.localStorage.getItem("visitUUID");

  if (visitUUID) {
    return visitUUID;
  } else {
    let uuid = getMathuuid(32);
    window.localStorage.setItem("visitUUID", uuid);
    return uuid;
  }
}
function getMathuuid(len, radix) {
  let CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let chars = CHARS,
    uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data. At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
}
export function toast(content, duration = 2000, position = "bottom") {
  Toast.show({
    content,
    position,
    duration,
  });
}
