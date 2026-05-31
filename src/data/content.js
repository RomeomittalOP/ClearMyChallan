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
  { id: 'submit', label: 'Submit Case' },
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
    title: 'Upload RC & Challan',
    desc: 'Drag-and-drop your Registration Certificate and Challan as JPG, PNG or PDF (max 20 MB each). Encrypted upload.'
  },
  {
    n: '02',
    title: 'Share Contact Details',
    desc: 'Enter your full name, mobile number and email so our advocate can reach you with the quote and updates.'
  },
  {
    n: '03',
    title: 'Advocate Reviews Within 24 Hours',
    desc: 'A licensed advocate manually reviews your case and gets back to you with a transparent quoted price.'
  },
  {
    n: '04',
    title: 'Pay the Quoted Price',
    desc: 'Once you approve the quote, pay securely via UPI / card / netbanking. Status auto-updates to "Payment Received".'
  },
  {
    n: '05',
    title: 'Case Processed & Disposed',
    desc: 'Your assigned advocate handles the entire process — no court visit. Disposal in 20–25 days, or full refund.'
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

// ---------------------------------------------------------------------
// Legal policies. These are reasonable, ClearMyChallan-specific defaults
// written to be reviewed and customised by your legal counsel before
// launch — they are NOT a substitute for advice from a qualified lawyer.
// `legalLastUpdated` is shown in the UI so users can spot revisions.
// ---------------------------------------------------------------------
export const legalLastUpdated = '29 May 2026'

export const legalSections = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    intro:
      'This Privacy Policy explains what personal information ClearMyChallan collects, how it is used, and how it is protected when you use our website and services.',
    blocks: [
      {
        h: 'Information we collect',
        p: [
          'Account details you provide — name, email address, phone number and optional vehicle registration data.',
          'Challan details fetched from authorised Indian e-Challan and Parivahan provider APIs solely to display your pending challans.',
          'Payment metadata returned by Razorpay (order id, payment id, status). We never store full card numbers, UPI PINs or bank credentials.',
          'Minimal technical logs (request timestamps, user agent, IP) used for security and rate-limiting.'
        ]
      },
      {
        h: 'How we use your information',
        p: [
          'To look up and display the challans associated with the registration number you provide.',
          'To assign a verified advocate to your case and keep you updated on its progress.',
          'To process payments and issue refunds where applicable under our Refund Policy.',
          'To comply with applicable Indian law and respond to lawful requests from authorities.'
        ]
      },
      {
        h: 'Encryption and retention',
        p: [
          'All data in transit is protected by TLS. Sensitive fields are encrypted at rest.',
          'Once a challan is disposed (or a request is cancelled), your case data is automatically and permanently deleted from our active systems. Backups roll off within 30 days.',
          'Anonymised, aggregated analytics may be retained to improve the service.'
        ]
      },
      {
        h: 'Third-party processors',
        p: [
          'Razorpay (payment processing) — see razorpay.com/privacy.',
          'Licensed challan-data aggregators authorised to query Parivahan / state e-Challan portals.',
          'Cloud hosting providers used to operate the platform.',
          'We do not sell, rent or share your personal information for marketing.'
        ]
      },
      {
        h: 'Your rights',
        p: [
          'You may request access, correction or deletion of your personal data at any time by writing to help@clearmychallan.co.in.',
          'You can withdraw consent for non-essential processing. Withdrawal does not affect cases already in disposal.',
          'You may raise grievances with our Grievance Officer (contact details below).'
        ]
      },
      {
        h: 'Grievance Officer',
        p: [
          'Name: Grievance Officer, ClearMyChallan Technologies Pvt. Ltd.',
          'Email: grievance@clearmychallan.co.in · Phone: +91 8000727771',
          'Response time: within 30 days of receiving your complaint.'
        ]
      }
    ]
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    intro:
      'By using ClearMyChallan you agree to the following terms. Please read them carefully before submitting any challan for resolution.',
    blocks: [
      {
        h: 'Eligibility',
        p: [
          'You must be at least 18 years old and the registered owner of the vehicle, or be authorised by the owner to act on their behalf.',
          'You agree to provide accurate, current and complete information about yourself and the challan.'
        ]
      },
      {
        h: 'The service',
        p: [
          'ClearMyChallan is a technology platform that connects users with independent, licensed advocates who handle the resolution of vehicle challans before the relevant authority or court.',
          'ClearMyChallan Technologies Pvt. Ltd. is not a law firm and does not itself practise law. The advocate-client relationship, when formed, is between you and the assigned advocate.',
          'Disposal timelines are estimates based on historical performance. Most cases close in 20–25 days but actual durations may vary due to court schedules and authority response times.'
        ]
      },
      {
        h: 'Pricing and payment',
        p: [
          'Resolution prices are calculated per city as published on the Pricing section and shown to you before payment. The price displayed is the all-inclusive amount you pay us.',
          'Payments are processed by Razorpay. All sums are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.',
          'A booking is confirmed only after payment is captured and verified.'
        ]
      },
      {
        h: 'User obligations',
        p: [
          'Submit only challans that are legitimately associated with a vehicle you own or are authorised to act for.',
          'Provide any documents reasonably requested by the assigned advocate (e.g. RC copy, ID proof) within the requested time.',
          'Do not use the platform to obstruct justice, evade lawful fines arising from grievous offences, or harass any individual.'
        ]
      },
      {
        h: 'Limitation of liability',
        p: [
          'Our aggregate liability for any claim arising out of or relating to the service is limited to the amount you paid us for that specific case.',
          'We are not liable for indirect, incidental, consequential or punitive damages, or for outcomes determined solely by judicial discretion.',
          'Nothing in these terms limits liability where such limitation is prohibited by Indian law.'
        ]
      },
      {
        h: 'Governing law',
        p: [
          'These terms are governed by the laws of India. Subject to the dispute-resolution process below, the courts at Delhi shall have exclusive jurisdiction.',
          'Disputes will first be attempted to be resolved through good-faith discussions with our Grievance Officer.'
        ]
      },
      {
        h: 'Changes',
        p: [
          'We may update these terms from time to time. Material changes will be highlighted on this page and the "last updated" date will be revised. Continued use of the service after a change constitutes acceptance.'
        ]
      }
    ]
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    intro:
      'ClearMyChallan stands behind its disposal timeline with a clear, time-bound refund guarantee.',
    blocks: [
      {
        h: 'The 25-day guarantee',
        p: [
          'If your challan is not disposed within 25 calendar days from the date of payment confirmation, you are entitled to a full refund of the amount paid to us.',
          'The 25-day clock starts only after you have submitted all documents reasonably requested by the assigned advocate.'
        ]
      },
      {
        h: 'How to request a refund',
        p: [
          'Write to refund@clearmychallan.co.in from the email used at signup, with your case reference number.',
          'Refunds are initiated within 3 business days of approval and typically credit back to the original payment method within 5–10 business days.'
        ]
      },
      {
        h: 'Exclusions',
        p: [
          'Refunds will not be granted where (a) the challan was already disposed within the timeline, (b) the user supplied false or incomplete information that materially affected the case, or (c) the case was withdrawn by the user before the advocate began acting.',
          'Government / court fees that have already been paid to authorities on your behalf are non-refundable.'
        ]
      },
      {
        h: 'Partial refunds',
        p: [
          'For multi-challan requests, if some challans are disposed and others are not within 25 days, refunds are issued on a pro-rata basis for the unresolved challans.'
        ]
      }
    ]
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    intro:
      'Please read this disclaimer carefully — it explains what ClearMyChallan is, and what it is not.',
    blocks: [
      {
        h: 'Not a law firm',
        p: [
          'ClearMyChallan Technologies Pvt. Ltd. is a technology platform. It is not a law firm and does not provide legal advice or legal representation.',
          'Advocates accessed through the platform are independent professionals enrolled with their respective State Bar Councils. The advocate-client relationship is between you and the assigned advocate.'
        ]
      },
      {
        h: 'No guaranteed outcome beyond stated timelines',
        p: [
          'Beyond the explicit 25-day refund guarantee, we do not guarantee any specific judicial outcome, reduction in fine, or particular interaction with any authority.'
        ]
      },
      {
        h: 'Information accuracy',
        p: [
          'Challan information is fetched from authorised public-facing APIs. While we work hard to keep displayed data accurate, we cannot guarantee that upstream data is always real-time or complete.',
          'You are responsible for verifying that the challans you submit are accurate before paying.'
        ]
      },
      {
        h: 'Third-party links',
        p: [
          'Our website may link to third-party services (e.g. Razorpay, government portals). We are not responsible for the content, accuracy or privacy practices of those third parties.'
        ]
      }
    ]
  }
]
