import AlertsWrapper from "./components/Alerts/AlertsWrapper";
import Wallet from "./components/Wallet/Wallet";
import AlertsProvider from "./contexts/AlertsProvider";
import SolpressProvider from "./contexts/SolpressProvider";

//@ts-ignore

function App() {
  return (
    <div className="App">
      <SolpressProvider>
        <AlertsProvider>
          <AlertsWrapper />
          <Wallet />
        </AlertsProvider>
      </SolpressProvider>
    </div>
  );
}

export default App;
