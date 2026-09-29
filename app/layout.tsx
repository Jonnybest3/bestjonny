import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Earn3X — Task Marketplace', description: 'Earn3X connects clients with workers for genuine, client-funded tasks.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <header className="nav"><div className="container" style={{display:'flex',width:'100%',alignItems:'center',justifyContent:'space-between'}}>
      <Link className="brand" href="/">Earn<span>3X</span></Link>
      <nav className="navlinks"><Link href="/plans">Plans</Link><Link href="/login">Login</Link><Link className="btn" href="/register">Get started</Link></nav>
    </div></header>
    {children}
    <footer className="footer"><div className="container">© 2026 Earn3X. A task marketplace for genuine client-funded work. Earnings are not guaranteed.</div></footer>
  </body></html>;
}
