import { TransactionRequest } from '@ethersproject/providers';
import {
  ChainEventListener,
  chainIds,
  ContractMetadata,
  contractMetadataMapping,
  ContractType,
  EthereumNetwork,
  IProviderAdapter,
  localhostNetwork,
  networkRegistry,
  transactionErrorCodes,
} from 'valtest-com-try-new-build-v';
import { ethers, providers, Signer, utils } from 'ethers';
import { Connector } from 'wagmi';
import { type WalletClient } from '@wagmi/core';
import { connect, disconnect, getAccount, signMessage, switchNetwork, watchAccount, watchNetwork } from 'wagmi/actions';



export class ProviderAdapter implements IProviderAdapter {
  private connector: Connector;

  public chainId: number | undefined;

  private originalProvider: providers.Provider | undefined;

  private fetchProvider: providers.Provider | undefined;

  private signer: Signer | undefined;

  private chainEventListener?: ChainEventListener;

  private unsubscribeFns: Array<() => unknown> = [];

  constructor(connector: Connector) {
    this.connector = connector;
  }

  async init(chainId?: number) {
    // init chainId
    if (chainId) this.chainId = chainId;
    // init providers
    this.originalProvider = await this.connector.getProvider();
    this.fetchProvider = this.createFetchProvider() ?? this.originalProvider;
    if (this.fetchProvider === this.originalProvider) console.warn('fetchProvider not available');
    // init signer
    const walletClient: WalletClient = await this.connector.getWalletClient();
    this.signer = await this.walletClientToSigner(walletClient, this.chainId!);
  }

  async disconnectFromConnector() {
    this.release();
    await disconnect(); // metamask does not support programmic disconnect
  }

  async connectToConnector(connector: Connector): Promise<number> {
    const { isConnected } = getAccount();
    if (isConnected) await this.disconnectFromConnector();
    try {
      const connectResult = await connect({ connector });
      return connectResult.chain.id;
    } catch (err) {
      throw new Error(transactionErrorCodes.CONNECTION_FAILED); // for a consistent error message
    }
  }

  async waitForTransaction(transactionHash: string, confirmations: number): Promise<boolean> {
    const txReceipt = await this.fetchProvider?.waitForTransaction(transactionHash, confirmations);
    if (txReceipt?.status) return true;
    throw Error(transactionErrorCodes.TRANSACTION_NOT_CONFIRMED);
  }

  async signMessage(message: string): Promise<string> {
    const signature = await signMessage({ message });
    if (!signature) throw new Error(transactionErrorCodes.SIGNING_FAILED); // coinbase wallet returns undefined in some cases.
    if (signature.includes('error')) throw new Error(transactionErrorCodes.SIGNATURE_UNSUPPORTED_PERSONAL_SIGN);
    return signature;
  }

  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    // TODO: Avoid type casting
    return (this.signer as providers.JsonRpcSigner)._signTypedData(domain, types, value);
  }

  getSelectedNetwork = (): EthereumNetwork | undefined => {
    if (!this.chainId) throw new Error('Illegal state: no chaindId');
    return networkRegistry[this.chainId];
  };

  async switchNetwork(network: EthereumNetwork) {
    return switchNetwork({ chainId: network.chainId });
  }

  private createFetchProvider() {
    try {
      const network = networkRegistry[this.chainId!];
      const fetchRpcUrl = network?.fetchRpcUrl;
      if (!fetchRpcUrl) {
        return undefined;
      }
      return fetchRpcUrl.includes('wss')
        ? new providers.WebSocketProvider(fetchRpcUrl)
        : new providers.StaticJsonRpcProvider(fetchRpcUrl);
    } catch (err: any) {
      console.log('create Fetch Provider error', err);
      return undefined;
    }
  }

  async getAddress(): Promise<string> {
    const { address } = getAccount();
    if (!address) {
      throw new Error('IllegalState');
    }
    return utils.getAddress(address);
  }

  setChainEventListener(chainEventListener: ChainEventListener): void {
    this.chainEventListener = chainEventListener;

    if (this.chainEventListener) {
      this.unsubscribeFns.push(
        watchAccount((_data) => {
          if (!this.chainEventListener) {
            console.warn('chainEventListener is not set');
            return;
          }
          this.chainEventListener.onAccountChanged();
        }),
      );
      this.unsubscribeFns.push(
        watchNetwork((data) => {
          if (!this.chainEventListener) {
            console.warn('chainEventListener is not set');
            return;
          }
          this.chainEventListener.onChainChanged(data.chain?.id);
        }),
      );
    }
  }

  onAccountChanged(): Promise<unknown> {
    return this.init();
  }

  onChainChanged(chainId?: number): Promise<unknown> {
    return this.init(chainId);
  }

  release(): void {
    this.removeListeners();
  }

  private removeListeners() {
    this.unsubscribeFns.forEach((unsubscribeFn) => unsubscribeFn());
    this.unsubscribeFns = [];
  }

  getContractMetadata(contractType: ContractType, chainId?: number): ContractMetadata {
    const resultChainId = chainId ?? this.chainId;

    if (!resultChainId) {
      throw new Error('No chainId provided in context');
    }
    const network = networkRegistry[resultChainId];
    if (!network) {
      throw new Error(transactionErrorCodes.UNSUPPORTED_NETWORK);
    }
    const getContractMetadataFn = contractMetadataMapping[contractType];
    if (!getContractMetadataFn) {
      throw new Error(`Unsupported contractType: ${contractType}`);
    }
    return getContractMetadataFn(network.contractData);
  }

  getContract(contractType: ContractType, contractAddress = undefined, chainId?: number): ethers.Contract {
    const contractMetadata: ContractMetadata = this.getContractMetadata(contractType, chainId);
    if (!contractMetadata.abi) {
      throw new Error(`No ABI configured for contractType: ${contractType}`);
    }
    if (contractMetadata.address && contractAddress) {
      throw new Error(`Overriding address is not supported for contractType: ${contractType}`);
    }
    const resultContractAddress = contractMetadata.address ?? contractAddress;
    if (!resultContractAddress) {
      throw new Error(`No contractAddress configured for contractType: ${contractType}`);
    }
    return new ethers.Contract(resultContractAddress, contractMetadata.abi);
  }

  getContractWithSigner(contract: ContractType, contractAddress = undefined): ethers.Contract {
    if (!this.signer) throw new Error('IllegalState: no signer');

    return this.getContract(contract, contractAddress).connect(this.signer);
  }

  getContractWithFetcher(contract: ContractType, contractAddress = undefined): ethers.Contract {
    if (!this.fetchProvider) throw new Error('fetchProvider not initialized');

    return this.getContract(contract, contractAddress).connect(this.fetchProvider);
  }

  getContractWithFetcherForEthereum(contract: ContractType, contractAddress = undefined): ethers.Contract {
    const chainIdForRpcUrl =
      this.chainId === chainIds.localhost && localhostNetwork === chainIds.ethMainnet
        ? chainIds.localhost
        : chainIds.ethMainnet;

    return this.getContract(contract, contractAddress).connect(
      new ethers.providers.StaticJsonRpcProvider(networkRegistry[chainIdForRpcUrl].fetchRpcUrl),
    );
  }

  async sendTransaction(tx: TransactionRequest) {
    if (!this.signer) throw new Error('IllegalState: no signer');

    const resp = await this.signer.sendTransaction(tx);

    return resp;
  }

  async patchExternalProvider(connector: Connector) {
    const provider = await connector.getProvider();
    let externalProvider;
    if (provider instanceof ethers.providers.Web3Provider) externalProvider = provider.provider;
    else externalProvider = provider;
    if ('isWalletConnect' in externalProvider) {
      const chainId = await connector.getChainId();
      externalProvider.http = externalProvider.setHttpProvider?.(chainId);
    }
  }

  async connectAndPatchProvider(connector: Connector): Promise<number> {
    const chainId = await this.connectToConnector(connector);
    await this.patchExternalProvider(connector);
    return chainId;
  }

  isPermitterAvailable() {
    const network = this.getSelectedNetwork();
    return !!network?.contractData?.permitterAddress;
  }

  async getGasPrice(): Promise<bigint> {
    const price = await this.fetchProvider?.getGasPrice();
    if (!price) throw Error('Could not fetch gas price in getGasPrice');
    return price.toBigInt();
  }

  async walletClientToSigner(walletClient: WalletClient, chainId: number) {
    const { account, transport } = walletClient;
    const network = {
      chainId,
      name: '',
    };
    const provider = new providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
  }
}
