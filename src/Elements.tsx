import React from "react";
import { StripeContext } from "./Stripe";

export type StripeElementsProps = {
  options?: stripe.elements.ElementsCreateOptions;
  children: (value: StripeElementsValue) => React.ReactNode;
};

export type StripeElementsState = {
  createElement: (
    type: stripe.elements.elementsType,
    options?: stripe.elements.ElementsOptions
  ) => void;
} & {
  [T in stripe.elements.elementsType]?: stripe.elements.Element;
};

export type StripeElementsValue = {
  stripe: stripe.Stripe | null;
  createToken: (tokenOptions?: stripe.TokenOptions) => Promise<stripe.Token>;
};

export const StripeElementsContext = React.createContext<StripeElementsState>({
  createElement: () => {}
});

export class StripeElements extends React.Component<
  StripeElementsProps,
  StripeElementsState
> {
  static contextType = StripeContext;

  context!: React.ContextType<typeof StripeContext>;
  elements!: stripe.elements.Elements;

  state: StripeElementsState = {
    createElement: (type, options) => {
      if (!this.context) return;
      if (!this.elements)
        this.elements = this.context.elements(this.props.options);
      this.setState(prevState => ({
        ...prevState,
        [type]: this.elements.create(type, options)
      }));
    }
  };

  async createToken(tokenOptions?: stripe.TokenOptions): Promise<stripe.Token> {
    const { card, cardCvc, cardExpiry, cardNumber } = this.state;

    if (!card && !cardCvc && !cardExpiry && !cardNumber) {
      throw new Error(
        "Elements must contain card or cardCvc, cardExpiry and cardNumber "
      );
    }

    let element: stripe.elements.Element;

    if (card) element = card;
    else if (cardCvc && cardExpiry && cardNumber) element = cardNumber;
    else throw new Error("Elements form does not contain required elements");

    const res = await this.context!.createToken(element, tokenOptions);

    if ("error" in res) throw res.error;

    return res.token!;
  }

  render() {
    return (
      <StripeElementsContext.Provider value={this.state}>
        {this.props.children({
          stripe: this.context,
          createToken: this.createToken
        })}
      </StripeElementsContext.Provider>
    );
  }
}
