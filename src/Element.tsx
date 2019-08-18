import React, { useRef, useContext, useEffect } from "react";
import { ElementsContext } from "./Elements";

export type StripeElementProps = {
  type?: stripe.elements.elementsType;
  options?: stripe.elements.ElementsOptions;
  onBlur?: stripe.elements.handler;
  onChange?: stripe.elements.handler;
  onFocus?: stripe.elements.handler;
  onReady?: stripe.elements.handler;
} & typeof defaultProps;

const defaultProps = {
  type: "card"
};

const StripeElement = ({
  type,
  options,
  onBlur,
  onChange,
  onFocus,
  onReady
}: StripeElementProps) => {
  const ref = useRef(null);
  const elements = useContext(ElementsContext);

  useEffect(() => {
    if (!elements) return;

    const element = elements[type];

    if (element) {
      element.mount(ref.current);
      onReady && element.on("ready", onReady);
      onChange && element.on("change", onChange);
      onFocus && element.on("focus", onFocus);
      onBlur && element.on("blur", onBlur);
    } else {
      elements.createElement(type, options);
    }
  });

  return <span ref={ref} />;
};

StripeElement.defaultProps = defaultProps;

export { StripeElement };
