import './globals.css';

export const metadata = {
  title: 'I.R.D. Proxy System',
  description: 'Proxy inteligente para efootballhub.net',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
