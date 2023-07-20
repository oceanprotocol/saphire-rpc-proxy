import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { ethers } from 'ethers';
import express from 'express';

const app = express();
app.use(express.json());

//const provider = sapphire.wrap(new ethers.providers.JsonRpcBatchProvider(process.env.RPC));
const provider = new ethers.providers.JsonRpcBatchProvider(process.env.RPC);
const archiveNode = process.env.ARCHIVE_NODE ==='true' ? true: false
const useBlockNo = process.env.USE_BLOCK_NO === 'true' ? true: false
console.log("Starting with archiveNode:"+archiveNode+" and useBlockNo:"+useBlockNo)
app.post('/', async (req, res) => {
  if (req.body.jsonrpc !== '2.0') {
    res.status(405).end();
    return;
  }

  let result;
  let { id, method, params } = req.body;
  if (method === 'eth_call') {
    //const { gas, ...txCall } = params[0];
    let gas=null
    let to=null
    let data=null
    let blockHash=null
    for (const param of params){
      if ("gas" in param && gas===null)
        gas = param['gas']
      if ("to" in param && to===null)
        to = param['to']
      if ("data" in param && data===null)
        data = param['data']
      if ("blockHash" in param && blockHash===null)
        blockHash = param['blockHash']
    }
    let callBlock = "latest"
    if (archiveNode){
      if (useBlockNo){
        const fullblock = await provider.getBlock(blockHash)
        callBlock = fullblock["number"]
      }
      else{
        callBlock = blockHash
      }
    }
    const p1={ from: ethers.constants.AddressZero, to: to, data: data }
    try{
      result = await provider.call(p1, callBlock);
      res.status(200).json({ id, jsonrpc: '2.0', result }).end();
    }
    catch(error){
      console.error("*******************************\nFailed call for request "+id+":\n")
      console.log(req.body)
      console.log("\nArgs:\n")
      console.log(p1)
      console.log("\nBlock:"+callBlock+"\n Error:\n")
      console.log(error)
      console.log("*******************************\n")
      res.status(500).json(error).end();
    }
  } else {
    result = await provider.send(method, params);
    res.status(200).json({ id, jsonrpc: '2.0', result }).end();
  }
});

app.listen(8080);
