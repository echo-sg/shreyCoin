const EC = require("elliptic").ec ;// creates public and private key, method to sign and method to verify sign.

// You can use any elliptic curve you want
const ec = new EC("secp256k1") ;// passing the ellypic curve (this one is same as that used in bitcoin)

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// Print the keys to the console
console.log();
console.log('Your public key :\n', publicKey);// 130 char

console.log();
console.log('Your private key :\n', privateKey); // 64 char