Saphire RPC Proxy

Original source code: https://github.com/oasisprotocol/sapphire-paratime/tree/main/integrations/graph

ENV:
 - set ARCHIVE_NODE="true" if your RPC is archieve node. If this is false, every blockHash/No will be translated to 'latest'
 - set USE_BLOCK_NO="true" if your RPC does not support EIP-1898. Then we will resolve blockHash -> blockNo and use that in eth_call (insecure, see https://eips.ethereum.org/EIPS/eip-1898)