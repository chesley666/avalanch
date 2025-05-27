import { InjectedConnector } from '@web3-react/injected-connector'

export const injected = new InjectedConnector({
  supportedChainIds: [43112, 43114, 20250527], // 修正为与config.js中一致的myava L1网络的链ID 20250527
});