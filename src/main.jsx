import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CustomerAuthProvider>
                                <App />
                          </CustomerAuthProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
)