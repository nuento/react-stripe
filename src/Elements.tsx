import React from "react";
import { StripeContext } from "./Stripe";

export type ElementsProps = {
  options?: stripe.elements.ElementsCreateOptions;
  children: (value: ElementsValue) => React.ReactNode;
};

export type ElementsState = {
  createElement: (
    type: stripe.elements.elementsType,
    options?: stripe.elements.ElementsOptions
  ) => void;
} & {
  [T in stripe.elements.elementsType]?: stripe.elements.Element;
};

export type ElementsValue = {
  stripe: stripe.Stripe | null;
  createToken: (tokenOptions?: stripe.TokenOptions) => Promise<stripe.Token>;
  handleCardPayment: (
    clientSecret: string,
    options?: stripe.HandleCardPaymentOptions
  ) => Promise<stripe.paymentIntents.PaymentIntent>;
};

export type WithElementsProps = {
  elements: ElementsValue;
};

export const ElementsContext = React.createContext<ElementsState>({
  createElement: () => {}
});

export class StripeElements extends React.Component<
  ElementsProps,
  ElementsState
> {
  static contextType = StripeContext;

  context!: React.ContextType<typeof StripeContext>;
  elements!: stripe.elements.Elements;

  state: ElementsState = {
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

  getElement() {
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

    return element;
  }

  createToken = (tokenOptions?: stripe.TokenOptions): Promise<stripe.Token> =>
    new Promise((resolve, reject) => {
      const element = this.getElement();

      this.context!.createToken(element, tokenOptions).then(res => {
        if ("error" in res) {
          return reject(res.error);
        }

        resolve(res.token);
      });
    });

  handleCardPayment = (
    clientSecret: string,
    options?: stripe.HandleCardPaymentOptions
  ): Promise<stripe.paymentIntents.PaymentIntent> =>
    new Promise((resolve, reject) => {
      const element = this.getElement();

      this.context!.handleCardPayment(clientSecret, element, options).then(
        res => {
          if ("error" in res) {
            return reject(res.error);
          }

          resolve(res.paymentIntent);
        }
      );
    });

  render() {
    return (
      <ElementsContext.Provider value={this.state}>
        {this.props.children({
          stripe: this.context,
          createToken: this.createToken,
          handleCardPayment: this.handleCardPayment
        })}
      </ElementsContext.Provider>
    );
  }
}

export function withElements(options?: stripe.elements.ElementsCreateOptions) {
  return function<T extends WithElementsProps = WithElementsProps>(
    WrappedComponent: React.ComponentType<T>
  ) {
    const displayName =
      WrappedComponent.displayName || WrappedComponent.name || "Component";

    return class ComponentWithElements extends React.Component<
      Optionalize<T, WithElementsProps>
    > {
      static displayName = `withElements(${displayName})`;

      public render() {
        return (
          <StripeElements options={options}>
            {elements => (
              <WrappedComponent {...(this.props as T)} elements={elements} />
            )}
          </StripeElements>
        );
      }
    };
  };
}
