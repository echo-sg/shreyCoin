const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec ;
const ec = new EC("secp256k1");

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress =fromAddress ;
        this.toAddress =toAddress ;
        this.amount  =amount  ;
    }// we just sign the hash of the transaction
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey){ // the key from keygenerator (object)
        //from address should be public key for transaction
        if(signingKey.getPublic("hex") !== this.fromAddress){
            throw new Error ("You cannot sign transactions of other wallets")
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx , "base64");
        this.signature = sig.toDER("hex");//special format
    }

    isValid(){
        if(this.fromAddress === null) return true; // this is because miningreward transaction is not signed but is still valid
        if(!this.signature || this.signature.length=== 0){ // if signature is not present or is empty 
            throw new Error ("No signature in this transaction");
        }
        // cheching whether keys match
        const publicKey = ec.keyFromPublic(this.fromAddress.address, "hex") // from address is a public key;
        return publicKey.verify(this.calculateHash(), this.signature) ;
        // we verify here that the hash has been verified with the signature
    }

}


class Block{
    constructor ( timestamp, transactions, previousHash =""){ 
        this.previousHash =previousHash ;
        this.timestamp = timestamp;
        this.transactions =transactions ;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){ // run the block through hashingfunction
        // for sha256 we need to install library crypto-js
        return SHA256(this.index +this.previousHash +this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
    }

    mineBlock( difficulty ){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce ++ ;
            this.hash = this.calculateHash();
        }
        console.log(`block mined + ${this.hash}`);
    } 
    hasValidTransactions(){
        for(const tx of this.transactions){ // looping through all the transactions of the block
            if (!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenisisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenisisBlock(){
        return new Block("01/01/2017",[],'0')
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){// if i mine this block send money to this address
        let block = new Block(Date.now(), this.pendingTransactions); // creating new block and adding all pending transactions
        block.mineBlock(this.difficulty);

        console.log("block succesfully mined !");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null,miningRewardAddress,this.miningReward)// giving reward and resetting array
        ];// this is in pending area and will be sent only during the next block of transactions
    }

    addTransaction(transaction){

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
          }
      
          // Verify the transactiion
          if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
          }
    
          this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){ // we need to go through all the transactions involving the address and finally calculating the total
        //kisi particular address ka balance hai isliye sab transactions ka total kar rahe hai..
        // we can note here that there is no transfer of real money .
        //sirf gar maine bheja hai to trans.amount kam hoga else badh jaayega..

        let balance = 0;
        for ( const block of this.chain){
            for(const trans of block.transactions){ 
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }// if we are the from address we are sending money (money is being deducted) 
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){ //to check the integrity of the blockchain
        for(let i = 1; i<this.chain.length ; i++) // first blovk of index 0 i.e. genisis block ko check karne ki zaroorat nahi hai isliye loop i=1 se start
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
            // blochchain me agar change ho bhi raha hai to wo purana hash hi dikayega jo usne initially calculate kiya tha.. here we check whether it is what it is actually supposed to be ?!
                return false ;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                // ye tab ke liye hai jb unlinked block blockchain  me aa gaya ho..
                return false ;
            }
        }
        return true;
    }
}

module.exports.Blockchain =Blockchain ;
module.exports.Transaction =Transaction ;