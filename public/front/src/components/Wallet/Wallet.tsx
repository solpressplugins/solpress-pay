import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
  BloctoWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinhubWalletAdapter,
  GlowWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  SafePalWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  SolletExtensionWalletAdapter,
  BraveWalletAdapter,
  BackpackWalletAdapter,
  WalletConnectWalletAdapter,
  TrustWalletAdapter,
  FractalWalletAdapter,
  ExodusWalletAdapter,
  CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import SolanaPay from "../../services/SolanaPay/SolanaPay.service";
import Payment from "../Payment/Payment";
import useSolpress from "../../hooks/useSolpress";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

function Wallet() {
  const { isTransactionDone } = useSolpress();
  const network = SolanaPay.getCluster();
  const endpoint = useMemo(() => SolanaPay.getNetworkURL(), []);
  const wallets = useMemo(
    () => [
      new BraveWalletAdapter(),
      new BitKeepWalletAdapter(),
      new BitpieWalletAdapter(),
      new BackpackWalletAdapter(),
      new WalletConnectWalletAdapter(
        {
          network,
          options: {
            relayUrl: 'wss://relay.walletconnect.com',
            projectId: '7d559cbe6af954c6b52b85198ad6d315',
            metadata: {
              name: 'Solpress Login',
              description: 'Solpress Login',
              url: 'https://github.com/solpressplugins/solpress-login-plugin',
              icons: ['https://avatars.githubusercontent.com/u/103013816?v=4&s=200'],
            },
          }
        }
      ),
      new TrustWalletAdapter(),
      new FractalWalletAdapter(),
      new ExodusWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new BloctoWalletAdapter({ network }),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinhubWalletAdapter(),
      new GlowWalletAdapter(),
      new LedgerWalletAdapter(),
      new MathWalletAdapter(),
      new SafePalWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
      new SolongWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TorusWalletAdapter({ params: { network } }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} >
        <WalletModalProvider>
          <Payment />
          {!isTransactionDone ? <WalletMultiButton /> : null}
          <WalletDisconnectButton />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default Wallet;
