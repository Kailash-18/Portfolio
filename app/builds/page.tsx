import type { Metadata } from "next";
import Builds from "../../components/Builds";

export const metadata: Metadata = {
  title: "What I Build | Kailash Ambadipudi",
  description: "Explore Kailash’s cloud infrastructure, Kubernetes delivery and security practice.",
};

export default function BuildsPage() {
  return <Builds />;
}
