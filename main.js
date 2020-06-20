 const {Blockchain, Transaction} = require("./blockchain") ;
 const EC = require("elliptic").ec ;
 const ec = new EC("secp256k1");
 


 const myKey = ec.keyFromPrivate("d8f51526397e0185c9b614aed2f166803fb2fcbe867d76ae05ae28e683fd7e8d")
 const myWalletAddress = myKey.getPublic("hex");

const shreyCoin = new Blockchain();

const tx1= new Transaction(myWalletAddress,'public key goes here',10);
tx1.signTransaction(myKey);
shreyCoin.addTransaction(tx1);

console.log("\n starting miner");
shreyCoin.minePendingTransactions(myWalletAddress);
console.log("\n balance of aarya is ", shreyCoin.getBalanceOfAddress(myWalletAddress));
 
 