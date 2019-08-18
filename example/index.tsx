import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { Formik, Form, Field } from "formik";

import { StripeElement, StripeProvider, withElements } from "../.";

const App = () => {
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => (
          <div>
            Home <Link to="/checkout">Checkout</Link>
          </div>
        )}
      ></Route>
      <Route path="/checkout" component={Checkout}></Route>
    </Switch>
  );
};

const Checkout = ({ match: { url } }) => {
  return (
    <StripeProvider apiKey={process.env.STRIPE_KEY}>
      Checkout
      <Switch>
        <Route
          exact
          path={`${url}`}
          render={() => <Link to={`${url}/payment`}>Payment</Link>}
        ></Route>
        <Route path={`${url}/payment`} component={Payment}></Route>
      </Switch>
    </StripeProvider>
  );
};

const Payment = withElements()(({ elements }) => {
  const initialValues = {};

  const handleSubmit = async values => {
    try {
      const token = await elements.createToken();
      console.log(token);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        <StripeElement />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
