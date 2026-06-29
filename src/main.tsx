import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import 'react-quill-new/dist/quill.snow.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
