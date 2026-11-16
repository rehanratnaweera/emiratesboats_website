import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initLanguage } from './i18n'
import './index.css'

// Load the visitor's language first so the page never flashes English before switching.
void initLanguage().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
