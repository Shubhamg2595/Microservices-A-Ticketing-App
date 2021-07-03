const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1> you are signed in </h1>
  ) : (
    <h1> you are not signed in </h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  return {};
};

export default LandingPage;
