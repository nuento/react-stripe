import React from "react";

export const StripeContext = React.createContext<stripe.Stripe | null>(null);
