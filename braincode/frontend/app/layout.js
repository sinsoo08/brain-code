import "./globals.css";

export const metadata = {
  title: "브레인 코드",
  description: "발달장애 아동을 위한 인지 훈련 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* ✅ 폰트 로드 전까지 텍스트 숨기지 않고 fallback 폰트 유지 */}
        <style>{`
          html { font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}