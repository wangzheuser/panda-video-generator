import { Metadata } from "next";

export const metadata: Metadata = {
  title: "自动化向导 · Panda Video Generator",
  description:
    "分步自动化流程（STEP1 文稿 → STEP2 TTS → STEP3 渲染；后续可再接发布）。",
};

export default function ScriptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
