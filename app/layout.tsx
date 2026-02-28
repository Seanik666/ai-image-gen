export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <title>AI 图像生成器</title>
        <meta name="description" content="基于豆包 Seedream 的 AI 图像生成应用" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
