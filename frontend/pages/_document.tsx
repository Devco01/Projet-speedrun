import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Intercepter les erreurs React AVANT l'hydratation
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0] && args[0].toString ? args[0].toString() : '';
                  
                  // Bloquer les erreurs React minifiées spécifiques
                  if (message.includes('Minified React error #425') || 
                      message.includes('Minified React error #418') || 
                      message.includes('Minified React error #423')) {
                    return; // Ne pas afficher
                  }
                  
                  // Afficher toutes les autres erreurs normalement
                  originalError.apply(console, args);
                };
                
                // Intercepter aussi les erreurs non capturées
                window.addEventListener('error', function(e) {
                  if (e.message && (
                    e.message.includes('Minified React error #425') ||
                    e.message.includes('Minified React error #418') ||
                    e.message.includes('Minified React error #423')
                  )) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </Head>
      <body className="bg-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 