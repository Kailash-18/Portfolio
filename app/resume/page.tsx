import type { Metadata } from "next";
import { ResumeRequest } from "../../components/resume/ResumeAccess";

export const metadata: Metadata = { title: "Request résumé access | Kailash Ambadipudi", robots: { index: false, follow: false } };

export default function ResumePage() { return <ResumeRequest />; }
