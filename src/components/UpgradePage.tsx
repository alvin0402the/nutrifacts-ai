import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../contexts/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function UpgradePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe kunde inte laddas");

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid }),
      });

      const session = await response.json();
      
      if (session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      } else {
        throw new Error("Kunde inte skapa betalsession");
      }
    } catch (error) {
      console.error(error);
      alert("Något gick fel vid betalningen. Försök igen!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Uppgradera till Pro</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Få obegränsad tillgång till alla våra smarta näringsverktyg och AI-analyser.
      </p>
      
      <div className="border rounded-xl p-8 shadow-lg bg-white max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-2">Månadsprenumeration</h2>
        <p className="text-4xl font-bold mb-6">299 kr <span className="text-sm font-normal text-gray-500">/mån</span></p>
        
        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Laddar..." : "Bli Pro nu"}
        </button>
      </div>
    </div>
  );
}