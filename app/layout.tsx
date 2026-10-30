import './globals.css';
export const metadata = { title: 'Booksly | Trust before automation', description: 'A Singapore-first bookkeeping workspace for transactions, clarification and accountant review.' };
/**
 * Wrap every page in the shared English-language HTML document. The layout imports global CSS and exports the default page title and description; children is the current page content.
 */
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
