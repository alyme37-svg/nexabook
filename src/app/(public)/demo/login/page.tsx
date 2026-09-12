import type { Metadata } from "next";

import { DemoLoginPage } from "@/features/demo-login/demo-login-page";

export const metadata: Metadata = {
  title: "Demo login",
  description: "Enter the NexaBook sample workspace.",
};

export default function Page() {
  return <DemoLoginPage />;
}
