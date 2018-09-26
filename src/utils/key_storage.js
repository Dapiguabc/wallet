/* global localStorage */
const ethUtil = require('ethereumjs-util');
const btcNetworks = require('./bitcoin_networks');
const ethNetworks = require('./ethereum_networks');
const nodeCryptoJs = require('node-cryptojs-aes');
const sign = require('./sign');

const { CryptoJS, JsonFormatter } = nodeCryptoJs;

let password;

function getPrivateKeys() {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = localStorage.privKeys;
  if (keys === undefined) {
    return {};
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(keys, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
  } catch (e) {
    throw new Error('Decryption failed');
  }
}

function savePrivateKeys(keys) {
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(keys), password, { format: JsonFormatter }).toString();

  localStorage.setItem('privKeys', encrypted);
}

exports.unlockStorage = (pass) => {
  password = pass;
  try {
    getPrivateKeys();
  } catch (e) {
    password = undefined;
    if (e.message === 'Decryption failed') {
      throw new Error('Incorrect password');
    } else {
      throw e;
    }
  }
};

exports.lockStorage = () => {
  password = undefined;
};

exports.addKey = (networkSymbol, privateKey) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  let address;
  let key;

  if (ethNetworks.includes(networkSymbol)) {
    key = sign.getHexBuffer(privateKey);
    if (key.length === 0) {
      throw new Error('Invalid private key');
    }
    address = ethUtil.privateToAddress(key).toString('hex');
  } else if (networkSymbol in btcNetworks) {
    key = sign.getBitcoinKey(privateKey, btcNetworks[networkSymbol]);
    address = key.getAddress();
  } else {
    throw new Error(`${networkSymbol} network is not supported`);
  }
  const keys = getPrivateKeys();
  keys[networkSymbol] = keys[networkSymbol] || {};
  keys[networkSymbol][address] = privateKey;

  savePrivateKeys(keys);
  return address;
};

exports.getPrivateKey = (networkSymbol, address) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  if (keys[networkSymbol] === undefined || keys[networkSymbol][address] === undefined) {
    throw new Error('Key not found');
  }
  return keys[networkSymbol][address];
};

exports.removePrivateKey = (networkSymbol, address) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  if (keys[networkSymbol] === undefined || keys[networkSymbol][address] === undefined) {
    throw new Error('Key not found');
  }
  delete keys[networkSymbol][address];
  if (Object.keys(keys[networkSymbol]).length === 0) {
    delete keys[networkSymbol];
  }
  savePrivateKeys(keys);
};

exports.getAvailableKeys = () => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  return Object.keys(keys).sort().reduce((obj, key) => {
    obj[key] = Object.keys(keys[key]).sort(); // eslint-disable-line no-param-reassign
    return obj;
  }, {});
};

exports.getSupportedNetworks = () => Object.keys(btcNetworks).concat(ethNetworks).sort();