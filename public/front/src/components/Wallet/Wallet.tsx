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
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  SolletExtensionWalletAdapter,
  BraveWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import SolanaPay from "../../services/SolanaPay/SolanaPay.service";
import Payment from "../Payment/Payment";
import useSolpress from "../../hooks/useSolpress";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

function Wallet() {
  const { isTransactionDone } = useSolpress();
  const network = SolanaPay.getCluster();
  console.log(network);
  const endpoint = useMemo(() => SolanaPay.getNetworkURL(), []);
  console.log(endpoint);
  const wallets = useMemo(
    () => [
      new BraveWalletAdapter(),
      new BitKeepWalletAdapter(),
      new BitpieWalletAdapter(),
      new BloctoWalletAdapter({ network }),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinhubWalletAdapter(),
      new GlowWalletAdapter(),
      new LedgerWalletAdapter(),
      new MathWalletAdapter(),
      new PhantomWalletAdapter(),
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
  console.log(endpoint);
  console.log(network);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Payment />
          {!isTransactionDone ? <WalletMultiButton /> : null}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default Wallet;
