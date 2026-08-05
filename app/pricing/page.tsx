import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PricingCalculator from '@/components/pricing/PricingCalculator'

export const metadata: Metadata = {
  title: 'FBO & Ground Handling Pricing Portal | EAN Aviation',
  description:
    'Calculate instant ground handling rates, landing tariffs, passenger service charges, and executive add-on fees for business aviation at Lagos MMIA & Abuja NAIA.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PricingCalculator />
      </main>
      <Footer />
    </>
  )
}

