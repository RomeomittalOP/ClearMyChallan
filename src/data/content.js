import {
  ShieldCheck,
  Scale,
  Clock,
  Smartphone,
  BadgeIndianRupee,
  RotateCcw
} from 'lucide-react'

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'search', label: 'Check Challan' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'how', label: 'How it Works' },
  { id: 'safety', label: 'Data Safety' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' }
]

export const features = [
  {
    icon: BadgeIndianRupee,
    title: 'Resolution From 60%',
    desc: 'Resolve eligible challans at prices starting as low as 60% of the original fine amount.'
  },
  {
    icon: Scale,
    title: 'Advocate Assisted',
    desc: 'Every case is handled by a licensed, verified advocate — you never have to visit court.'
  },
  {
    icon: Clock,
    title: 'Disposed in 20–25 Days',
    desc: 'Most cases are disposed within 20 to 25 days, with status updates at every step.'
  },
  {
    icon: RotateCcw,
    title: 'Refund Guarantee',
    desc: 'If your challan is not disposed within 25 days, the amount is fully refunded.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Encrypted',
    desc: 'Your data is encrypted in transit and automatically deleted after disposal.'
  },
  {
    icon: Smartphone,
    title: 'Fully Online',
    desc: 'No queues, no agents. Submit, track and resolve everything from your phone.'
  }
]

export const steps = [
  {
    n: '01',
    title: 'Enter Vehicle Number',
    desc: 'Drop in your registration number to instantly fetch all pending challans.'
  },
  {
    n: '02',
    title: 'See Transparent Pricing',
    desc: 'View the fine, the city-based resolution price and what you actually pay — upfront.'
  },
  {
    n: '03',
    title: 'Pay a Flat Resolution Fee',
    desc: 'Choose what you want resolved and pay one fixed, transparent amount.'
  },
  {
    n: '04',
    title: 'Advocate Handles It',
    desc: 'A verified advocate is assigned and processes your case — no court visit needed.'
  },
  {
    n: '05',
    title: 'Disposed in 20–25 Days',
    desc: 'Track progress to disposal. Not resolved in 25 days? Full refund.'
  }
]

export const stats = [
  { value: 48200, suffix: '+', label: 'Challans Resolved' },
  { value: 12, suffix: 'Cr+', label: 'Saved by Users (₹)' },
  { value: 25, suffix: ' Days', label: 'Max Disposal Time' },
  { value: 100, suffix: '%', label: 'Refund if Unresolved' }
]

export const safetyPoints = [
  {
    icon: ShieldCheck,
    title: 'User Data Encrypted',
    desc: 'All personal and vehicle information is encrypted in transit and at rest.'
  },
  {
    icon: Scale,
    title: 'Challan Info Protected',
    desc: 'Challan records are accessible only to the advocate assigned to your case.'
  },
  {
    icon: RotateCcw,
    title: 'Deleted After Disposal',
    desc: 'Once your challan is disposed, your data is automatically and permanently deleted.'
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First Processing',
    desc: 'We never sell or share your data. Processing is limited strictly to your case.'
  }
]

export const trustBadges = [
  'Secure Data Handling',
  'Encrypted Information',
  'Data Deleted After Disposal',
  'Advocate Assisted Process'
]

export const faqs = [
  {
    q: 'How long does disposal take?',
    a: 'Usually 20–25 days from the time payment is confirmed and your documents are received.'
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. All information is encrypted and automatically deleted after your challan is disposed.'
  },
  {
    q: "What if my challan isn't resolved?",
    a: 'If your challan is not disposed within 25 days, you receive a full refund of the amount paid.'
  },
  {
    q: 'Do I need to visit court?',
    a: 'No. Our advocate-assisted process handles everything on your behalf — no court visit required.'
  }
]

export const testimonials = [
  {
    name: 'Rohan Mehta',
    role: 'Fleet Owner, Delhi',
    quote:
      'I had 14 challans pending. ClearMyChallan cleared everything within the promised window and the pricing was exactly what was shown upfront.',
    initial: 'R'
  },
  {
    name: 'Priya Sharma',
    role: 'IT Professional, Noida',
    quote:
      'The flat city-based pricing is genuinely transparent. The advocate kept me updated and I never had to step into a court.',
    initial: 'P'
  },
  {
    name: 'Aarav Iyer',
    role: 'Cab Operator, Gurugram',
    quote:
      'No queues, no agents. I picked my challans, saw the exact price, paid once, and it was disposed in under a month.',
    initial: 'A'
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Manager, Ghaziabad',
    quote:
      'What sold me was the refund guarantee and that my data is deleted after the case. Felt safe and professional throughout.',
    initial: 'S'
  }
]

// ---------------------------------------------------------------------
// Pricing table (mirrors backend services/pricingCalculator.js).
// `regions` group cities that share the same rule for clean display.
// ---------------------------------------------------------------------
export const pricingTable = [
  {
    region: 'Delhi',
    cities: ['Delhi'],
    highlight: true,
    rules: [{ label: 'All challans', detail: 'Flat 60% of the fine amount' }]
  },
  {
    region: 'Faridabad / Palwal / Gurugram',
    cities: ['Faridabad', 'Palwal', 'Gurugram'],
    rules: [
      { label: 'Below ₹2,000', detail: 'Fine amount + ₹500 service fee' },
      { label: 'Above ₹5,000', detail: 'Flat 80% of the fine amount' }
    ]
  },
  {
    region: 'Noida',
    cities: ['Noida'],
    rules: [{ label: 'All challans', detail: 'Flat 50% of the fine amount' }]
  },
  {
    region: 'Ghaziabad',
    cities: ['Ghaziabad'],
    rules: [{ label: 'All challans', detail: 'Flat 50% of the fine amount' }]
  },
  {
    region: 'Mathura / Agra / Aligarh',
    cities: ['Mathura', 'Agra', 'Aligarh'],
    rules: [
      { label: 'Below ₹2,000', detail: 'Fine amount + ₹500 service fee' },
      { label: 'Above ₹2,000', detail: 'Flat 70% of the fine amount' }
    ]
  },
  {
    region: 'Bulandshahr / Shamli / Meerut',
    cities: ['Bulandshahr', 'Shamli', 'Meerut'],
    rules: [
      { label: 'Below ₹2,000', detail: 'Fine amount + ₹500 service fee' },
      { label: 'Above ₹2,000', detail: 'Flat 65% of the fine amount' }
    ]
  },
  {
    region: 'Lucknow / Kanpur',
    cities: ['Lucknow', 'Kanpur'],
    rules: [
      { label: 'Below ₹2,000', detail: 'Fine amount + ₹500 service fee' },
      { label: 'Above ₹2,000', detail: 'Flat 65% of the fine amount' }
    ]
  }
]
