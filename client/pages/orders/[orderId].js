import { useState, useEffect } from "react";
const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

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

  return <div>Time left to pay: {timeLeft} seconds</div>;
};

OrderShow.getInitialProps = async (context, client) => {
  const orderId = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
