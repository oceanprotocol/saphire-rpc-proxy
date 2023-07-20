import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { ethers } from 'ethers';
import express from 'express';

const app = express();
app.use(express.json());

const provider = sapphire.wrap(new ethers.providers.JsonRpcBatchProvider(process.env.RPC));
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
    const { gas, ...txCall } = params[0];
    let callBlock = "latest"
    if (archiveNode){
      if (useBlockNo){
        const fullblock = await provider.getBlock(params[1]["blockHash"])
        callBlock = fullblock["number"]
      }
      else{
        callBlock = params[1]["blockHash"]
      }
    }
    const p1={ from: ethers.constants.AddressZero, ...txCall }
    
    try{
      result = await provider.call(p1, callBlock);
      res.status(200).json({ id, jsonrpc: '2.0', result }).end();
    }
    catch(error){
      console.error("*******************************\nFailed call for request "+id+":\n")
      console.log(req.body)
      console.log("\nArgs:\n")
      console.log(JSON.stringify(p1)+"\nBlock:"+callBlock+"\n Error:\n"+JSON.stringify(error)+"*******************************\n")
      res.status(500).json(error).end();
    }
  } else {
    result = await provider.send(method, params);
    res.status(200).json({ id, jsonrpc: '2.0', result }).end();
  }
});

app.listen(8080);
