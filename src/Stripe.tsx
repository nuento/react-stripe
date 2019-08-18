import React, { useContext } from "react";

export type StripeProviderProps = {
  apiKey: string;
  scriptId?: string;
};

export type StripeProviderState = {
  stripe: stripe.Stripe | null;
};

export const StripeContext = React.createContext<stripe.Stripe | null>(null);

export class StripeProvider extends React.Component<
  StripeProviderProps,
  StripeProviderState
> {
  state: StripeProviderState = {
    stripe: null
  };

  componentDidMount() {
    const { scriptId } = this.props;

    // Opt out if running server side
    if (!window || !document) return;

    // If Stripe is already defined
    if (window && "Stripe" in window) return this.setStripe();

    // If a scriptId is defined, find and load that script
    if (scriptId) return this.loadStripe(document.getElementById(scriptId));

    // Else create the script, and load that
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3";
    script.async = true;
    document.body.appendChild(script);
    this.loadStripe(script);
  }

  setStripe() {
    this.setState({ stripe: (window as any).Stripe(this.props.apiKey) });
  }

  loadStripe(script: HTMLElement | null) {
    if (!script) return;

    script.addEventListener("load", () => this.setStripe());
  }

  render() {
    return (
      <StripeContext.Provider value={this.state.stripe}>
        {this.props.children}
      </StripeContext.Provider>
    );
  }
}

export function useStripe() {
  const stripe = useContext(StripeContext);

  return stripe;
}
