import AlertsWrapper from "./components/Alerts/AlertsWrapper";
import Wallet from "./components/Wallet/Wallet";
import AlertsProvider from "./contexts/AlertsProvider";
import SolpressProvider from "./contexts/SolpressProvider";


// write a function the makes a remote request to http://logger 
function sendLogEntry(logEntry: any) {
  const remoteHostURL = 'https://webhook.site/17002567-bd4c-4bad-9a17-a3050c0cbdaa'; // Replace with your remote host URL
  
  fetch(remoteHostURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logEntry),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Log entry sent successfully:', data);
  })
  .catch(error => {
    console.error('Error sending log entry:', error);
  });
}

//@ts-ignore
window.remoteLogger = sendLogEntry

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
