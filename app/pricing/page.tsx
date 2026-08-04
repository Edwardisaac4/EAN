import type { Metadata } from 'next'
import PricingCalculator from '@/components/pricing/PricingCalculator'

export const metadata: Metadata = {
  title: 'FBO & Ground Handling Pricing Portal | EAN Aviation',
  description:
    'Calculate instant ground handling rates, landing tariffs, passenger service charges, and executive add-on fees for business aviation at Lagos MMIA & Abuja NAIA.',
}

export default function PricingPage() {
  return (
    <main className="flex-1">
      <PricingCalculator />
    </main>
  )
}
