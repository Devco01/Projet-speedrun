import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour afficher l'interface de fallback lors du prochain rendu
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Ignore les erreurs d'hydratation connues en production
    if (
      process.env.NODE_ENV === 'production' && 
      error.message && 
      (error.message.includes('Minified React error #425') ||
       error.message.includes('Minified React error #418') ||
       error.message.includes('Minified React error #423') ||
       error.message.includes('hydration'))
    ) {
      // Reset l'état pour continuer le rendu normal
      this.setState({ hasError: false, error: undefined })
      return
    }

    // Log autres erreurs pour debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Interface de fallback personnalisée
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Quelque chose s'est mal passé
            </h2>
            <p className="text-slate-400 mb-4">
              Une erreur inattendue s'est produite. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 