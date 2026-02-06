import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
    </Routes>
  )
}

export default App
