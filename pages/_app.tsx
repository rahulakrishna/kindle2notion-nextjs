import "../styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { Container } from "semantic-ui-react";
import Navbar from "../components/navbar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Container style={{ paddingTop: "16px" }}>
      <Navbar />
      <Component {...pageProps} />
    </Container>
  );
}

export default MyApp;
