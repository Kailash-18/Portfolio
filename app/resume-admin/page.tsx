import type { Metadata } from "next";
import { ResumeOwner } from "../../components/ResumeAccess";

export const metadata: Metadata = { title: "Review résumé requests | Kailash Ambadipudi", robots: { index: false, follow: false } };

export default function OwnerPage() { return <ResumeOwner />; }
