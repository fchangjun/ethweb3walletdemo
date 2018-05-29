<template>
  <div class="hello">
     <button type="button" name="button" @click="createWallterBtn">创建钱包</button>
     <p>密码:{{this.wallterData[0].pass}}</p>
     <p>地址:{{this.wallterData[0].lowerCaseAddress}}</p>
     <p>校验地址:{{this.wallterData[0].CheckSumAddress}}</p>
     <p>地址:{{this.wallterData[0].path}}</p>
     <p>助记词:{{this.wallterData[0].mnemonic}}</p>
     <p>是否备份:{{this.wallterData[0].iscopy}}</p>
     <p>keystore:{{this.wallterData[0].keystore}}</p>
     <p v-if="!this.wallterData[0].iscopy"><button @click="copyWallet">备份钱包</button></p>
     <p>账户余额：{{balance}}</p>
     <p>
       <button type="button" name="button" @click="exportPrivateKey">导出私钥</button>
       <p>私钥：{{privateKey}}</p>
       <button type="button" name="button" @click="exportKeystore">导出keystore</button>
       <p>keystore:{{keystore}}</p>
     </p>
     <p>
       <button type="button" name="button" @click="importByPrivateKey">导入私钥</button>
       <button type="button" name="button" @click="importByKeyStore">导入keystore</button>
       <button type="button" name="button" @click="importBymnemonic">导入助记词</button>
     </p>
     <div class="">
       <h4>交易</h4>
       from:<input type="text" name="" v-model="from"><br>
       to:<input type="text" name="" v-model="to"><br>
       gasprice:<input type="text" name="" v-model="gasPrice">（gwei）<br>
       gasLimit:<input type="text" name="" v-model="gasLimit">(最小为21000)<br>
       eth:<input type="text" name="" v-model="eth"><br>
       <button type="button" name="button" @click="sendToken">发送交易</button>
     </div>
     <div class="">
       <h4>订单信息</h4>
       <table>
         <tr>
           <td>txid</td>
           <td>数量</td>
           <td>手续费</td>
           <td>from</td>
           <td>to</td>
           <td>区块哈希</td>
           <td>区块高度</td>
           <td>随机数</td>
         </tr>
         <tr v-for="(item,key) in orderData['0xD52f8E68542e7af8D0c14457af92090B6C9Ba317']">
           <td>{{item.hash}}</td>
           <td>{{item.value}}</td>
           <td>{{item.gasSpend}}</td>
           <td>{{item.from}}</td>
           <td>{{item.to}}</td>
           <td>{{item.blockHash}}</td>
           <td>{{item.blockNumber}}</td>

           <td>{{item.nonce}}</td>
           <hr>
         </tr>
       </table>
     </div>
  </div>
</template>

<script>
var bip39=require("bip39");
var hdkey=require('ethereumjs-wallet/hdkey');
var ethwallet=require('ethereumjs-wallet');
var util=require('ethereumjs-util');
var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || "ws://192.168.1.109:8546");
console.log(web3.utils)
export default {
  name: 'HelloWorld',
  data () {
    return {
      orderData:{},
      balance:0,
      privateKey:'',
      keystore:'',
      from:'',
      to:'',
      gasPrice:'20',
      gasLimit:'210000',
      eth:'0.1',
      wallterData:[{
        pass:"",
        lowerCaseAddress:"",
        CheckSumAddress:"",
        path:"",
        mnemonic:'',
        iscopy:false,
        keystore:'',
      }]
    }
  },
  methods: {
    createWallterBtn () {
    this.wallterData[0].pass=prompt('请输入你的密码')
    this.createNewWallter();

    },
    createNewWallter(){
      let mnemonic=bip39.generateMnemonic();
      let seed=bip39.mnemonicToSeed(mnemonic);
      let hdWallet=hdkey.fromMasterSeed(seed);
      let key=hdWallet.derivePath("m/44'/60'/0'/0/0")
      let wallet=key.getWallet();
      let lowerCaseAddress = wallet.getAddressString()
      let CheckSumAddress = wallet.getChecksumAddressString()
      let keystore = wallet.toV3(this.wallterData[0].pass)
      this.wallterData[0].lowerCaseAddress=lowerCaseAddress
      this.wallterData[0].CheckSumAddress=CheckSumAddress
      this.wallterData[0].path="m/44'/60'/0'/0/0"
      this.wallterData[0].mnemonic=mnemonic
      this.wallterData[0].iscopy=false
      this.wallterData[0].keystore=keystore;
      console.log(this.wallterData)
      this.$storage.setStorage("wallterdata",this.wallterData);
    },
    copyWallet(){
      let pass=prompt("请输入密码")
      if(pass!=this.wallterData[0].pass)  {
        alert("密码错误")
        return false
      }
      let mnemonic=pass=prompt("请输入12个助记词")
      if(mnemonic!=this.wallterData[0].mnemonic){
        alert("助记词错误，请重试")
        return false;
      }else{
        alert("备份成功 将删除您的助记词")
         this.wallterData[0].iscopy=true
        this.wallterData[0].mnemonic="已删除"
        this.$storage.setStorage("wallterdata",this.wallterData);
      }

    },
    getBalance(){
      let address=this.wallterData[0].CheckSumAddress;
      // console.log(web3.eth.getBalance(address))
        web3.eth.getBalance(address).then((ret)=>{
          this.balance=web3.utils.fromWei(ret, 'ether');
        })
    },
    exportKeystore(){
      let wallet=this.checkPass()
      if (wallet) {

        this.keystore=this.wallterData[0].keystore;
      }
    },
    exportPrivateKey(){
      let wallet=this.checkPass()
      if (wallet) {
        let prikey = wallet.getPrivateKey().toString("hex")
        this.privateKey=prikey;
        return prikey;
      }

    },
    importBymnemonic(){
      let mnemonic=prompt("请输入助记词")
      let pass=prompt("请输入密码")
      let path=prompt("请输入path")
      let seed = bip39.mnemonicToSeed(mnemonic)
      let hdwallet = hdkey.fromMasterSeed(seed)
      let wallet = hdwallet.derivePath(path).getWallet()
      let keystore = wallet.toV3(pass)
      this.updateWalletByKeystore(keystore,pass)

    },
    importByPrivateKey(){
      let privatekey=new Buffer( prompt("请输入私钥"), 'hex' )
      let pass=prompt("请输入密码")
      let wallet = ethwallet.fromPrivateKey(privatekey)
      let keystore= wallet.toV3(pass)
      console.log(keystore)
      this.updateWalletByKeystore(keystore,pass)
    },
    importByKeyStore(){
      let keystore=prompt("请输入keystore")
      let pass=prompt("请输入密码")
      try{
        let wallet = ethwallet.fromV3(keystore, pass)
        let newkeystore = wallet.toV3(pass)
        console.log(keystore)
        this.updateWalletByKeystore(newkeystore,pass)
      }
      catch(e){
        alert("密码错误")
      }

    },
    checkPass(){
      let pass=prompt("请输入密码");
      let keystore=this.wallterData[0].keystore;
      try{
        let wallet = ethwallet.fromV3(keystore, pass)
        return wallet;
      }
      catch(e){
        alert("密码错误")
        return false
      }
    },
    updateWalletByKeystore(keystore,pass){
      try {
        let lowercaseaddress = "0x"+keystore.address
        if(!util.isValidAddress(lowercaseaddress)) return null
        let checksumaddress = util.toChecksumAddress(lowercaseaddress)
        let data=[{
          pass:pass,
          lowerCaseAddress:lowercaseaddress,
          CheckSumAddress:checksumaddress,
          path:"无",
          mnemonic:'无',
          iscopy:true,
          keystore:keystore
        }]
        this.$storage.setStorage("wallterdata",data);
      } catch (e) {
        return null
      }
    },
    sendToken(){
      // var key=this.exportPrivateKey()
      var privateKey = new Buffer("3e60da8f0a796adf4e0ea13bd4f76adfaa58e20a35716be999bfe8149bef5016", 'hex')
      let nonce = web3.eth.getTransactionCount(this.from)
      .then((nonce)=>{
              console.log(nonce)
              var rawTx = {
                 nonce: '0x'+ nonce.toString(16),
                gasPrice: web3.utils.fromDecimal(web3.utils.toWei(this.gasPrice, 'shannon')),//0000000000
                gasLimit: web3.utils.fromDecimal(this.gasLimit),
                from:this.from,
                to: this.to,
                value: web3.utils.fromDecimal(web3.utils.toWei(this.eth,"ether")),//web3.utils.toWei("0.1","ether"),
                data: ''
              }
              console.log(web3.utils.toWei(this.gasPrice, 'shannon'))
              console.log(rawTx);
              var tx = new Tx(rawTx);
              console.log(tx)
              tx.sign(privateKey);

              var serializedTx = tx.serialize();
              console.log(serializedTx);
              var transationHx='0x' + serializedTx.toString('hex')
              console.log(transationHx)
              web3.eth.sendSignedTransaction(transationHx)
              .on('transactionHash', (txid)=>{
                console.log(txid)
                this.createOrderData(txid);
              })
              // .on('receipt', (ret)=>{console.log('receipt')})
              // .on('confirmation', (ret)=>{console.log('confirmation')})
              .on('error', (err)=>{
                console.log('error:'+err)
              })

        }
      );

    },
  initOrderData(){
    if(this.$storage.getStorage("orderData")==null){
      this.$storage.setStorage("orderData",{})
    }
    this.orderData=this.$storage.getStorage("orderData");
    },
  createOrderData(tx){
    web3.eth.getTransaction(tx).then((data)=>{
      let orderData=this.$storage.getStorage("orderData")
      let price=web3.utils.fromWei(data.gasPrice, 'ether');
      let gasSpend=(price*data.gas).toString();
      let tmpdata={
        blockHash:data.blockHash,
        blockNumber:data.blockNumber,
        from:data.from,
        to:data.to,
        value:web3.utils.fromWei(data.value, 'ether'),
        nonce:data.nonce,
        input:data.input,
        hash:data.hash,
        gasSpend:gasSpend,
      }
      if (!orderData[data.from]) {
        orderData[data.from]={};
        orderData[data.from][data.hash]=tmpdata
      }else{
        orderData[data.from][data.hash]=tmpdata
      }
      this.$storage.setStorage("orderData",orderData);
      this.orderData=this.$storage.getStorage("orderData");
    });
  }
  },
  created:function(){
    var tx="0x767efb6649ed7ab218c4a2a59e304be953fed4d71c826e1426ab76b094a04604"
    this.createOrderData(tx);
     if(this.$storage.getStorage("wallterdata")==null){
       alert("请创建钱包")
     }else{
       this.wallterData=this.$storage.getStorage("wallterdata");
       this.getBalance();
     }
     this.initOrderData();

     var subscription = web3.eth.subscribe('pendingTransactions', function(error, result){
       console.log("这里是test")
        if (!error)
            console.log(result);
          })
          .on("data", function(transaction){
            console.log(555)
              console.log(transaction);
          });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table,tr,td{
  border: 1px solid red;
}
td{
  width: 10px;

}
</style>
