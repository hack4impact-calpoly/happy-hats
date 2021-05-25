import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer/Footer";

function withNavbarAndFooter(WrappedComponent) {
  function WithNavbarAndFooter(props) {
    return (
      <>
        <Navbar />
        <WrappedComponent {...props} />
        <Footer />
      </>
    );
  }

  return WithNavbarAndFooter;
}

export default withNavbarAndFooter;
