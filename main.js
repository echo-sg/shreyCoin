const SHA256 = require("crypto-js/sha256");

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress =fromAddress ;
        this.toAddress =toAddress ;
        this.amount  =amount  ;
    }
}


class Block{
    constructor ( timestamp, transactions, previousHash =""){ 
        this.previousHash =previousHash ;
        this.timestamp = timestamp;
        this.transactions =transactions ;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){ // run the block through hashingfunction
        // for sha256 we need to install library crypto-js
        return SHA256(this.index +this.previousHash +this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
    }

    mineBlock( difficulty ){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
            this.nonce ++ ;
            this.hash = this.calculateHash();
        }
        console.log("block mined "+ this.hash);
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
        return new Block("01/01/2017","Genisis block",0)
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

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){ // we need to go through all the transactions involving the address and finally calculating the total
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

let shreyCoin = new Blockchain();

shreyCoin.createTransaction(new Transaction("address1","address2",100));
shreyCoin.createTransaction(new Transaction("address2","address1",10));

console.log("\n starting miner");
shreyCoin.minePendingTransactions("aaryaaddress");
console.log("\n balance of aarya is ", shreyCoin.getBalanceOfAddress("aaryaaddress"));
console.log("\n starting miner agaain");
shreyCoin.minePendingTransactions("aaryaaddress");
console.log("\n balance of aarya is finally now ", shreyCoin.getBalanceOfAddress("aaryaaddress"));