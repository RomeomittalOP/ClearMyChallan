import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Search, Loader2, Car, KeyRound, Lock } from 'lucide-react'
import { lookupChallans } from '../services/challan.service.js'
import { mockChallans } from '../data/challans.js'
import { extractError } from '../services/api.js'

export default function ChallanSearch({ searchState, setSearchState }) {
  const [vehicle, setVehicle] = useState('DL10CA1234')
  const [chassis, setChassis] = useState('')

  const scrollToResults = () =>
    setTimeout(
      () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }),
      80
    )

  const onSearch = async (e) => {
    e?.preventDefault()
    if (!vehicle.trim()) return

    setSearchState({ status: 'loading', vehicle, results: [], source: null, error: null })

    try {
      const data = await lookupChallans(vehicle.trim().toUpperCase(), chassis)
      setSearchState({
        status: 'done',
        vehicle: data.vehicleNumber,
        results: data.challans,
        source: data.source,
        error: data.providerError || null
      })
      if (data.providerError) toast('Provider busy — showing cached data', { icon: '⚠️' })
      scrollToResults()
    } catch (err) {
      // Backend unreachable → local demo fallback so the page still works.
      setSearchState({
        status: 'done',
        vehicle: vehicle.trim().toUpperCase(),
        results: mockChallans,
        source: 'offline-mock',
        error: extractError(err, 'Backend unreachable')
      })
      toast('Showing offline demo data', { icon: '🔌' })
      scrollToResults()
    }
  }

  const isLoading = searchState.status === 'loading'

  return (
    <section id="search" className="relative py-14 md:py-20 bg-surface-soft border-y border-line">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-9"
        >
          <span className="eyebrow">Instant Lookup</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            Check your challans in seconds
          </h2>
          <p className="mt-3 text-ink-500">
            Enter your vehicle number to see every pending challan and the exact
            resolution price for your city — upfront.
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card p-5 sm:p-6 lg:p-7 max-w-4xl mx-auto"
        >
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Vehicle Number
              </label>
              <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                  placeholder="e.g. DL10CA1234"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent font-mono tracking-[0.18em] text-base sm:text-lg outline-none text-navy placeholder:text-ink-400/60"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Chassis / RC (optional)
              </label>
              <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={chassis}
                  onChange={(e) => setChassis(e.target.value)}
                  placeholder="Last 5 of chassis"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex items-end">
              <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3.5">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scanning
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Search
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            Encrypted lookup. We never store your registration data — it&apos;s
            deleted after disposal.
          </div>
        </motion.form>
      </div>
    </section>
  )
}
