import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../contexts/AuthContext";

// Denna rad måste vara utanför själva funktionen
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function UpgradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    console.log("Initiating subscription for user:", user?.uid);
    setLoading(true);

    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize. Check your VITE_STRIPE_PUBLISHABLE_KEY.");
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          plan: "Pro",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const session = await response.json();

      if (session.id) {
        await stripe.redirectToCheckout({
          sessionId: session.id,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-center">Uppgradera till Pro</h1>
        <p className="text-gray-600 mb-8 text-center">
          Få obegränsad tillgång till alla våra smarta näringsverktyg och AI-analyser.
        </p>
        
        <button 
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Laddar..." : "Bli Pro-medlem nu"}
        </button>
      </div>
    </div>
  );
}