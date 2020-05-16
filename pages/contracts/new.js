import React,{Component} from 'react';
import Layout from '../../components/Layout';
import {Form,Button,Input,Message} from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import {Router} from '../../routes';
import ipfs from '../../ipfs/ipfs';
import storehash from '../../ipfs/storehash';
import factoryMyProfile from '../../ethereum/factoryMyProfile';



class contractNew extends Component{
  state = {
    address:'',
    stringinfo:'',
    errorMsg:'',
    ipfsHash:'',
    buffer:'',
    ethAddress:'',
    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    loading:false,
    manager_Name:'',
    reciever_Name:''
  };

  captureFile =(event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  };
  convertToBuffer = async(reader) => {
    //file is converted to a buffer for upload to IPFS
      const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
      this.setState({buffer});
  };


  onSubmit=async (event)=>{
    event.preventDefault();
    this.setState({loading:true,errorMsg:''});
    try{
    var accMan=await factoryMyProfile.methods.getUsersAddress(this.state.manager_Name).call();
    var accRec=await factoryMyProfile.methods.getUsersAddress(this.state.reciever_Name).call();
    const accounts =await web3.eth.getAccounts();
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});
    if(this.state.manager_Name==""||this.state.receiver_Name==""||this.state.stringinfo==""||this.state.ipfsHash=="")
    {
      alert("Fill all information");
    }else
    if(accMan=="0x0000000000000000000000000000000000000000")
    {
      alert("Create Account First");
      Router.pushRoute('/CreateMyProfile/index');
    }else
    if(accRec=="0x0000000000000000000000000000000000000000")
    {
      alert("Receiver Not Found!!!\nCheck List of Users!!!");
      Router.pushRoute('/contracts/new');
    }else
    if(accRec==accMan){
      alert("Manager should not be receiver");
      Router.pushRoute('/contracts/new');
    }else
    if(accMan!=accounts[0])
    {
      alert("Sign in with same accounts");
      Router.pushRoute('/');
    }else {
      await factory.methods
      .createContract(accRec,this.state.stringinfo,this.state.ipfsHash,this.state.manager_Name,this.state.reciever_Name)
      .send({
        from:accounts[0]
      }).then(function(){
        Router.pushRoute('/');
      });
      var x= await factory.methods.getfilehash().call();
      console.log(x);
    }
    }catch(err){
    this.setState({errorMsg: err.message});
    }

    this.setState({loading:false});
  };
  onClick=async (event)=>{
    event.preventDefault();



    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err,ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash
      this.setState({ ipfsHash:ipfsHash[0].hash });
      console.log("hash"+this.state.ipfsHash);


      })


  };
  render(){
    return (
      <Layout >
        <h3>Create a Contract or Agreement</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMsg}>
          <Form.Field>
          <label>Manager Name</label>
          <Input
          value={this.state.manager_Name}
          onChange={event =>this.setState({manager_Name:event.target.value})}
          />

          <label>Receiver Name</label>
          <Input
          value={this.state.reciever_Name}
          onChange={event =>this.setState({reciever_Name:event.target.value})}
          />

          <label>Info about Contract</label>
          <Input
          value={this.state.stringinfo}
          onChange={event =>this.setState({stringinfo:event.target.value})}
          />
          {/* <Message error header="Oops!" content={this.state.errorMsg}/>  faltu error detoy*/}

          <label>Upload a Single File on IPFS</label>
          <Input type="file" onChange = {this.captureFile}></Input>
          <Button primary onClick={this.onClick}>Upload File</Button>
          <Button primary loading={this.state.loading}>Create!</Button>
          </Form.Field>
        </Form>
      </Layout>
    );
  }
}

export default contractNew;
