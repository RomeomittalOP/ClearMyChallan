import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import TrustBar from './components/TrustBar.jsx'
import ChallanSearch from './components/ChallanSearch.jsx'
import ChallanResults from './components/ChallanResults.jsx'
import Pricing from './components/Pricing.jsx'
import WhyChooseUs from './components/WhyChooseUs.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Stats from './components/Stats.jsx'
import DataSafety from './components/DataSafety.jsx'
import Testimonials from './components/Testimonials.jsx'
import FAQ from './components/FAQ.jsx'
import AdvocateContact from './components/AdvocateContact.jsx'
import Footer from './components/Footer.jsx'
import FloatingSupport from './components/FloatingSupport.jsx'
import BackgroundOrbs from './components/ui/BackgroundOrbs.jsx'

export default function App() {
  // status: 'idle' | 'loading' | 'done'
  const [searchState, setSearchState] = useState({
    status: 'idle',
    vehicle: '',
    results: [],
    source: null,
    error: null
  })

  return (
    <AuthProvider>
      <div className="relative min-h-screen">
        <BackgroundOrbs />
        <Navbar />
        <main className="relative z-10">
          <Hero />
          <TrustBar />
          <ChallanSearch searchState={searchState} setSearchState={setSearchState} />
          <ChallanResults searchState={searchState} />
          <Pricing />
          <WhyChooseUs />
          <HowItWorks />
          <Stats />
          <DataSafety />
          <Testimonials />
          <FAQ />
          <AdvocateContact />
        </main>
        <Footer />
        <FloatingSupport />

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#0B1B3F',
              border: '1px solid #E4E9F2',
              borderRadius: '14px',
              boxShadow: '0 10px 30px -12px rgba(15,40,100,0.18)',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } }
          }}
        />
      </div>
    </AuthProvider>
  )
}
