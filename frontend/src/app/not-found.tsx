import React from "react";

import Card from "@/components/UI/Card";

export default function Custom404() {
  return (
    <Card style={{width: "95%", maxWidth: "25rem", margin: "auto", marginTop: "10%"}}>
      <h1 style={{color: "var(--brand-900)"}}>Error 404</h1>
      <p>Page Not Found</p>
    </Card>
  );
}