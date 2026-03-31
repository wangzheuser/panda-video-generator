import "../../styles/global.css";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "熊猫视频自动化引擎 - Panda Video Generator",
  description:
    "全自动化的视频内容生成与发布平台：网页提取、一键成片（Edge TTS + Remotion）与 Playwright 多平台网页端上传，各平台相近流程、独立脚本。",
  verification: {
    other: {
      "msvalidate.01": "FFFE3E3280889E0058410FD735227147",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
