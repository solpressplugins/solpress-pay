import { useContext } from "react";
import { SolpressContext } from "../contexts/SolpressProvider";

function useSolpress() {
  return useContext(SolpressContext);
}

export default useSolpress;
