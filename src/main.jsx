import { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh bg-cream text-text-dark">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="font-heading text-2xl font-semibold">Eroare aplicație</div>
              <div className="mt-2 text-sm text-text-muted">
                A apărut o eroare JavaScript care a blocat randarea paginii.
              </div>
              <pre className="mt-4 overflow-auto rounded-xl bg-cream p-4 text-xs text-text-dark">
{String(this.state.error?.message || this.state.error)}
              </pre>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>,
)
