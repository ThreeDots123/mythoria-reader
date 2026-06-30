"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { readerDiscordAuthenticateRoute } from "@/routes/server";
import { Spinner } from "@/components/ui/spinner";

export default function DiscordAuthButton({
  isLoading,
  setIsLoading,
  action = "login",
}: {
  isLoading: {
    state: boolean;
    src: "email" | "discord" | "google";
  };
  setIsLoading: (loading: {
    state: boolean;
    src: "email" | "discord" | "google";
  }) => void;
  action?: "login" | "register";
}) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleDiscordAuth = async () => {
    setIsLoading({ state: true, src: "discord" });
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const params: {
        redirect?: string;
        action?: string;
      } = {};

      // Add redirect query parameter if it exists
      if (redirect) {
        params.redirect = redirect;
      }

      // Add action parameter
      params.action = action;

      // Encode state parameter using browser-compatible method
      const state = btoa(JSON.stringify(params));
      const url = `${baseUrl}${readerDiscordAuthenticateRoute}?state=${state}`;

      // For OAuth redirects, create a form and submit it
      // This ensures the browser properly navigates to Discord
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      form.style.display = "none";

      // Add CSRF token if needed (the backend should handle this)
      document.body.appendChild(form);
      form.submit();

      // Note: The form submission will navigate away, so we don't need to clean up
      // or set loading to false, as the page will redirect
    } catch (error) {
      console.error("Discord authentication error:", error);
      setIsLoading({ state: false, src: "email" });
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="bg-card text-xs"
      disabled={isLoading.state}
      onClick={handleDiscordAuth}
    >
      {isLoading.state && isLoading.src === "discord" ? (
        <>
          <Spinner className="mr-2" />
          Signing in...
        </>
      ) : (
        <>
          <FaDiscord className="size-4" />
          Continue with Discord
        </>
      )}
    </Button>
  );
}
