import express from "express";
import cors from "cors";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createPaywall, evmPaywall } from "@x402/paywall";
import { config } from "./config.js";
import { freeTierMiddleware } from "./middleware/freeTier.js";
import { trackPayment } from "./middleware/trackPayment.js";
import { serviceHandler, serviceTryHandler } from "./routes/service.js";
import { servicesListHandler } from "./routes/services.js";
import { metricsHandler } from "./routes/metrics.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: config.frontendUrl, credentials: true }));

const facilitatorClient = new HTTPFacilitatorClient({ url: config.facilitatorUrl });

const paywall = createPaywall().withNetwork(evmPaywall).build();

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  "eip155:*",
  new ExactEvmScheme()
);

// --- Free routes (no payment) ---
app.get("/api/services", servicesListHandler);
app.get("/api/service/:id/try", freeTierMiddleware, serviceTryHandler);
app.get("/api/metrics/:id", metricsHandler);

// --- Paid routes (x402 MUSD payment) ---
app.use(
  paymentMiddleware(
    {
      "GET /api/service/:id": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.005",
            network: "eip155:31611",
            payTo: config.evmAddress,
          },
        ],
        description: "AI inference service — pay per request with MUSD",
        mimeType: "application/json",
      },
    },
    resourceServer,
    undefined,
    paywall
  )
);

app.get("/api/service/:id", trackPayment, serviceHandler);

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`CapCipCup backend listening on http://localhost:${config.port}`);
  console.log(`Receiving payments at: ${config.evmAddress}`);
  console.log(`Facilitator: ${config.facilitatorUrl}`);
  console.log(`Network: eip155:31611 (Mezo Testnet)`);
});
