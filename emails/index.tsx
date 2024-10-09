import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
} from "@react-email/components";

interface ThankYouEmailProps {
  name: string;
  score: number;
}

interface EmailContactoRHProps {
  subject: string;
  message: string;
}

export function EmailContactoRH({ subject, message }: EmailContactoRHProps) {
  return (
    <Html lang="pt">
      <Head>
        <title>{subject}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Text style={paragraph}>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#007bff",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "4px",
  display: "inline-block",
  marginTop: "16px",
};
