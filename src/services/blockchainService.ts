import { JsonRpcProvider, Wallet, TransactionReceipt, hexlify, toUtf8Bytes } from 'ethers';
import { logger } from '@/shared/utils/logger';

let provider: JsonRpcProvider | null = null;
let signer: Wallet | null = null;

export async function initializeBlockchainConnection(
  rpcUrl: string,
  privateKey: string
): Promise<{ provider: JsonRpcProvider; signer: Wallet }> {
  try {
    provider = new JsonRpcProvider(rpcUrl);
    signer = new Wallet(privateKey, provider);
    await provider.getBlockNumber();
    logger.info('Blockchain connection established', { rpcUrl });
    return { provider, signer };
  } catch (error) {
    logger.error('Failed to initialize blockchain connection', error);
    throw error;
  }
}

export async function recordOnBlockchain(message: string): Promise<TransactionReceipt> {
  if (!signer) {
    throw new Error('Blockchain not initialized');
  }
  try {
    const tx = await signer.sendTransaction({
      to: signer.address,
      value: 0n,
      data: hexlify(toUtf8Bytes(message))
    });
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    logger.info('Transaction confirmed', receipt);
    return receipt;
  } catch (error) {
    logger.error('Failed to record on blockchain', error);
    throw error;
  }
}
