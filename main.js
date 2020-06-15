const SHA256 = require("crypto-js/sha256");

class Block{
    constructor (index, timestamp, data, previousHash =""){ 
        // index== where blocks sits on chain, timestamp== hen was block created, data== any additional data to be stored on blockchain
        this.index = index;
        this.timestamp = timestamp;
        this.data =data ;
        this.previousHash =previousHash ;
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
        this.difficulty = 5;
    }

    createGenisisBlock(){
        return new Block(0,"01/01/2017","Genisis block",0)
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash= this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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
console.log("mining block 1");
shreyCoin.addBlock(new Block(1,"10/1/2017",{amount:4}));
console.log("mining block 2");
shreyCoin.addBlock(new Block(3,"15/2/2017",{amount:400}));

