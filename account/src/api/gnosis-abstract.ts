import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { createPublicClient, getContract, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";

dotenv.config();

const bundlerUrl = "https://api.pimlico.io/v1/sepolia/rpc?apikey=API_KEY";

export const publicClient = createPublicClient({
  transport: http("https://rpc.ankr.com/eth_sepolia"),
});

export const paymasterClient = createPimlicoPaymasterClient({
  transport: http("https://api.pimlico.io/v2/sepolia/rpc?apikey=API_KEY"),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
});

export const pimlicoBundlerClient = createPimlicoBundlerClient({
  transport: http(bundlerUrl),
  entryPoint: ENTRYPOINT_ADDRESS_V06,
});

const createSafe = async () => {
  const signer = privateKeyToAccount("0xPRIVATE_KEY");

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    signer: signer,
    safeVersion: "1.4.1",
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain: sepolia,
    bundlerTransport: http(
      "https://api.pimlico.io/v1/sepolia/rpc?apikey=API_KEY"
    ),
    middleware: {
      gasPrice: async () =>
        (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
      sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
    },
  });
};

const paySafe = async (smartclient: any) => {
  const txHash = await smartclient.sendTransaction({
    to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    value: 0,
    data: "0x1234",
  });
};
