import { useState, useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";
const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    //  this is done to make sure timer starts as soon as we are redirected to this page
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      // this is done to make sure timer stops as soon as we move away from this page.
      clearInterval(timerId);
    };
  }, [order]);

  if (timerId < 0) {
    return <div> Order Expired </div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IzP2uSDDtBxywmAl5jUChLnjUJ7rFfPEMeWUsg7spVIHX2Uc49wlcvvYlEIE2iLqsNZU5SUzhlkr3Mp9LaIERdR00vn3WK9Cr"
        amount={order.ticket.price}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const orderId = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
