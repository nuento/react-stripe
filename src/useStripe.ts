import { useContext } from "react";
import { StripeContext } from "./Context";

export function useStripe() {
  const stripe = useContext(StripeContext);

  return stripe;
}
