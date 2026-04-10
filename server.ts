import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { userId, plan } = req.body;

      let unitAmount = 9900; // Default Pro
      let planName = "NutriFacts AI Pro Plan";

      if (plan === 'Elite') {
        unitAmount = 19900;
        planName = "NutriFacts AI Elite Plan";
      } else if (plan === 'Ultimate') {
        unitAmount = 29900;
        planName = "NutriFacts AI Ultimate Plan";
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "sek",
              product_data: {
                name: planName,
                description: `Unlock ${plan} nutritional insights and health reports.`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'Pro'}`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: {
          userId: userId,
          plan: plan || 'Pro'
        },
      });

      res.json({ id: session.id });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
