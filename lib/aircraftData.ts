export interface Aircraft {
  id: string;
  name: string;
  manufacturer: string;
  category: 'Light Jet' | 'Midsize Jet' | 'Super Midsize' | 'Heavy Jet' | 'Ultra Long Range' | 'Helicopter' | 'VIP Airliner' | 'Turboprop';
  mtowKg: number;
  mtowRange: string;
  maxPassengers: number;
  icao: string;
  rangeNm: number;
  baseHandlingFeeUsd: {
    domestic: number;
    international: number;
  };
  landingParkingFeeUsdPerDay: {
    domestic: number;
    international: number;
  };
  paxFeeUsdPerPax: number;
  popular?: boolean;
}

export interface QuoteCalculationInput {
  aircraftId: string;
  customAircraft?: Aircraft;
  location: 'lagos' | 'abuja';
  operation: 'domestic' | 'international';
  movement: 'weekday' | 'weekend';
  passengers: number;
  stay: 'same_day' | 'overnight';
  overnightNights?: number;
  addOns?: {
    vipLounge?: boolean;
    catering?: boolean;
    gpuPower?: boolean;
    waterService?: boolean;
  };
}

export interface QuoteItemBreakdown {
  label: string;
  amountUsd: number;
  detail?: string;
}

export interface QuoteCalculationResult {
  aircraft: Aircraft;
  locationName: string;
  operationName: string;
  movementName: string;
  stayName: string;
  passengers: number;
  breakdown: QuoteItemBreakdown[];
  totalUsd: number;
  totalNgn: number;
  fxRate: number;
}

export const AIRCRAFT_DATASET: Aircraft[] = [
  {
    id: 'embraer-legacy-650',
    name: 'Embraer Legacy 650',
    manufacturer: 'Embraer',
    category: 'Heavy Jet',
    mtowKg: 24300,
    mtowRange: '20,001 – 30,000 kg',
    maxPassengers: 14,
    icao: 'E35L',
    rangeNm: 3900,
    baseHandlingFeeUsd: { domestic: 1850, international: 2950 },
    landingParkingFeeUsdPerDay: { domestic: 320, international: 650 },
    paxFeeUsdPerPax: 45,
    popular: true,
  },
  {
    id: 'gulfstream-g650er',
    name: 'Gulfstream G650ER',
    manufacturer: 'Gulfstream',
    category: 'Ultra Long Range',
    mtowKg: 45360,
    mtowRange: '40,001 – 50,000 kg',
    maxPassengers: 19,
    icao: 'GLF6',
    rangeNm: 7500,
    baseHandlingFeeUsd: { domestic: 2400, international: 3800 },
    landingParkingFeeUsdPerDay: { domestic: 480, international: 950 },
    paxFeeUsdPerPax: 50,
    popular: true,
  },
  {
    id: 'gulfstream-g550',
    name: 'Gulfstream G550',
    manufacturer: 'Gulfstream',
    category: 'Ultra Long Range',
    mtowKg: 41277,
    mtowRange: '40,001 – 50,000 kg',
    maxPassengers: 16,
    icao: 'GLF5',
    rangeNm: 6750,
    baseHandlingFeeUsd: { domestic: 2200, international: 3500 },
    landingParkingFeeUsdPerDay: { domestic: 450, international: 900 },
    paxFeeUsdPerPax: 50,
    popular: true,
  },
  {
    id: 'bombardier-global-7500',
    name: 'Bombardier Global 7500',
    manufacturer: 'Bombardier',
    category: 'Ultra Long Range',
    mtowKg: 52163,
    mtowRange: '50,001 – 60,000 kg',
    maxPassengers: 19,
    icao: 'GL7T',
    rangeNm: 7700,
    baseHandlingFeeUsd: { domestic: 2700, international: 4200 },
    landingParkingFeeUsdPerDay: { domestic: 550, international: 1100 },
    paxFeeUsdPerPax: 55,
    popular: true,
  },
  {
    id: 'bombardier-global-6000',
    name: 'Bombardier Global 6000',
    manufacturer: 'Bombardier',
    category: 'Ultra Long Range',
    mtowKg: 45132,
    mtowRange: '40,001 – 50,000 kg',
    maxPassengers: 17,
    icao: 'GLEX',
    rangeNm: 6000,
    baseHandlingFeeUsd: { domestic: 2300, international: 3600 },
    landingParkingFeeUsdPerDay: { domestic: 470, international: 920 },
    paxFeeUsdPerPax: 50,
    popular: true,
  },
  {
    id: 'challenger-650',
    name: 'Bombardier Challenger 650',
    manufacturer: 'Bombardier',
    category: 'Heavy Jet',
    mtowKg: 21863,
    mtowRange: '20,001 – 30,000 kg',
    maxPassengers: 12,
    icao: 'CL60',
    rangeNm: 4000,
    baseHandlingFeeUsd: { domestic: 1800, international: 2850 },
    landingParkingFeeUsdPerDay: { domestic: 310, international: 620 },
    paxFeeUsdPerPax: 45,
    popular: true,
  },
  {
    id: 'challenger-350',
    name: 'Bombardier Challenger 350',
    manufacturer: 'Bombardier',
    category: 'Super Midsize',
    mtowKg: 18416,
    mtowRange: '15,001 – 20,000 kg',
    maxPassengers: 10,
    icao: 'CL35',
    rangeNm: 3200,
    baseHandlingFeeUsd: { domestic: 1550, international: 2400 },
    landingParkingFeeUsdPerDay: { domestic: 260, international: 510 },
    paxFeeUsdPerPax: 40,
    popular: true,
  },
  {
    id: 'falcon-7x',
    name: 'Dassault Falcon 7X',
    manufacturer: 'Dassault',
    category: 'Ultra Long Range',
    mtowKg: 31751,
    mtowRange: '30,001 – 40,000 kg',
    maxPassengers: 14,
    icao: 'FA7X',
    rangeNm: 5950,
    baseHandlingFeeUsd: { domestic: 2100, international: 3300 },
    landingParkingFeeUsdPerDay: { domestic: 420, international: 820 },
    paxFeeUsdPerPax: 45,
    popular: true,
  },
  {
    id: 'falcon-2000ex',
    name: 'Dassault Falcon 2000EX',
    manufacturer: 'Dassault',
    category: 'Heavy Jet',
    mtowKg: 19142,
    mtowRange: '15,001 – 20,000 kg',
    maxPassengers: 10,
    icao: 'F2TH',
    rangeNm: 3800,
    baseHandlingFeeUsd: { domestic: 1600, international: 2500 },
    landingParkingFeeUsdPerDay: { domestic: 270, international: 530 },
    paxFeeUsdPerPax: 40,
  },
  {
    id: 'hawker-800xp',
    name: 'Hawker 800XP / 900XP',
    manufacturer: 'Hawker Beechcraft',
    category: 'Midsize Jet',
    mtowKg: 12700,
    mtowRange: '10,001 – 15,000 kg',
    maxPassengers: 8,
    icao: 'H25B',
    rangeNm: 2700,
    baseHandlingFeeUsd: { domestic: 1300, international: 2050 },
    landingParkingFeeUsdPerDay: { domestic: 210, international: 420 },
    paxFeeUsdPerPax: 35,
    popular: true,
  },
  {
    id: 'citation-xls',
    name: 'Cessna Citation XLS+',
    manufacturer: 'Textron Aviation',
    category: 'Midsize Jet',
    mtowKg: 9163,
    mtowRange: '7,001 – 10,000 kg',
    maxPassengers: 9,
    icao: 'C56X',
    rangeNm: 2100,
    baseHandlingFeeUsd: { domestic: 1150, international: 1800 },
    landingParkingFeeUsdPerDay: { domestic: 180, international: 360 },
    paxFeeUsdPerPax: 35,
  },
  {
    id: 'phenom-300e',
    name: 'Embraer Phenom 300E',
    manufacturer: 'Embraer',
    category: 'Light Jet',
    mtowKg: 8150,
    mtowRange: '7,001 – 10,000 kg',
    maxPassengers: 8,
    icao: 'E55P',
    rangeNm: 2010,
    baseHandlingFeeUsd: { domestic: 1100, international: 1750 },
    landingParkingFeeUsdPerDay: { domestic: 170, international: 340 },
    paxFeeUsdPerPax: 30,
    popular: true,
  },
  {
    id: 'king-air-350',
    name: 'Beechcraft King Air 350i',
    manufacturer: 'Textron Aviation',
    category: 'Turboprop',
    mtowKg: 6804,
    mtowRange: '5,001 – 7,000 kg',
    maxPassengers: 9,
    icao: 'B350',
    rangeNm: 1800,
    baseHandlingFeeUsd: { domestic: 950, international: 1450 },
    landingParkingFeeUsdPerDay: { domestic: 140, international: 280 },
    paxFeeUsdPerPax: 25,
  },
  {
    id: 'airbus-h145',
    name: 'Airbus H145 Helicopter',
    manufacturer: 'Airbus Helicopters',
    category: 'Helicopter',
    mtowKg: 3700,
    mtowRange: '0 – 5,000 kg',
    maxPassengers: 8,
    icao: 'EC45',
    rangeNm: 350,
    baseHandlingFeeUsd: { domestic: 750, international: 1200 },
    landingParkingFeeUsdPerDay: { domestic: 110, international: 220 },
    paxFeeUsdPerPax: 25,
    popular: true,
  },
  {
    id: 'airbus-h125',
    name: 'Airbus H125 (Écureuil)',
    manufacturer: 'Airbus Helicopters',
    category: 'Helicopter',
    mtowKg: 2250,
    mtowRange: '0 – 3,000 kg',
    maxPassengers: 5,
    icao: 'AS50',
    rangeNm: 340,
    baseHandlingFeeUsd: { domestic: 600, international: 980 },
    landingParkingFeeUsdPerDay: { domestic: 90, international: 180 },
    paxFeeUsdPerPax: 20,
  },
  {
    id: 'boeing-bbj',
    name: 'Boeing BBJ 737 VIP',
    manufacturer: 'Boeing',
    category: 'VIP Airliner',
    mtowKg: 77564,
    mtowRange: '70,000+ kg',
    maxPassengers: 30,
    icao: 'B737',
    rangeNm: 6200,
    baseHandlingFeeUsd: { domestic: 3800, international: 5900 },
    landingParkingFeeUsdPerDay: { domestic: 850, international: 1650 },
    paxFeeUsdPerPax: 65,
  },
];

export const USD_TO_NGN_RATE = 1550; // Current estimated rate

export function getAircraftById(id: string): Aircraft {
  const found = AIRCRAFT_DATASET.find((a) => a.id === id);
  return found || AIRCRAFT_DATASET[0];
}

export function searchAircraft(query: string): Aircraft[] {
  if (!query || query.trim() === '') return AIRCRAFT_DATASET;
  const q = query.toLowerCase().trim();
  return AIRCRAFT_DATASET.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.manufacturer.toLowerCase().includes(q) ||
      a.icao.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
  );
}

export function calculateEstimatedQuote(input: QuoteCalculationInput): QuoteCalculationResult {
  const aircraft = input.customAircraft || getAircraftById(input.aircraftId);
  const isIntl = input.operation === 'international';
  const isWeekend = input.movement === 'weekend';
  const isOvernight = input.stay === 'overnight';
  const nights = isOvernight ? Math.max(1, input.overnightNights || 1) : 0;
  const paxCount = Math.max(1, Math.min(input.passengers, aircraft.maxPassengers * 2));

  // 1. Base Ramp & FBO Handling Fee
  const baseHandling = isIntl
    ? aircraft.baseHandlingFeeUsd.international
    : aircraft.baseHandlingFeeUsd.domestic;
  
  // Weekend surcharge (10% on handling for weekend operations)
  const weekendSurcharge = isWeekend ? Math.round(baseHandling * 0.1) : 0;

  // 2. Airport Landing & Navigation Estimate
  const landingFee = isIntl ? Math.round(aircraft.mtowKg * 0.022) : Math.round(aircraft.mtowKg * 0.012);

  // 3. Overnight Parking Fee
  const dailyParkingRate = isIntl
    ? aircraft.landingParkingFeeUsdPerDay.international
    : aircraft.landingParkingFeeUsdPerDay.domestic;
  const parkingTotal = isOvernight ? dailyParkingRate * nights : 0;

  // 4. Passenger Handling & Security Fee
  const paxHandlingTotal = paxCount * aircraft.paxFeeUsdPerPax;

  const breakdown: QuoteItemBreakdown[] = [
    {
      label: `FBO Ground Handling (${input.operation === 'domestic' ? 'Domestic' : 'International'})`,
      amountUsd: baseHandling,
      detail: `${aircraft.category} rate tier (${aircraft.mtowRange})`,
    },
  ];

  if (weekendSurcharge > 0) {
    breakdown.push({
      label: 'Weekend Operations Surcharge (10%)',
      amountUsd: weekendSurcharge,
      detail: 'Ramp staffing & priority coordination',
    });
  }

  breakdown.push({
    label: 'Airport Landing & Navigation (Est.)',
    amountUsd: landingFee,
    detail: `Calculated on ${aircraft.mtowKg.toLocaleString()} kg MTOW`,
  });

  if (parkingTotal > 0) {
    breakdown.push({
      label: `Overnight Hangar / Parking (${nights} ${nights === 1 ? 'night' : 'nights'})`,
      amountUsd: parkingTotal,
      detail: `$${dailyParkingRate}/night for ${input.location === 'lagos' ? 'Lagos MMIA' : 'Abuja DNAA'}`,
    });
  }

  breakdown.push({
    label: `Passenger VIP Facilitation (${paxCount} ${paxCount === 1 ? 'pax' : 'pax'})`,
    amountUsd: paxHandlingTotal,
    detail: `$${aircraft.paxFeeUsdPerPax}/passenger`,
  });

  // 5. Add-ons
  if (input.addOns?.vipLounge) {
    const loungeTotal = paxCount * 75;
    breakdown.push({
      label: 'EAN Executive VIP Terminal Pass',
      amountUsd: loungeTotal,
      detail: `$75/guest access including private suite & bar`,
    });
  }

  if (input.addOns?.catering) {
    const cateringEst = paxCount * 120;
    breakdown.push({
      label: 'Wings™ Executive In-Flight Catering (Est.)',
      amountUsd: cateringEst,
      detail: 'Freshly prepared 3-course gourmet flight meals',
    });
  }

  if (input.addOns?.gpuPower) {
    breakdown.push({
      label: 'GPU Ground Power Unit Support (2 hrs)',
      amountUsd: 250,
      detail: 'Aircraft power & cabin pre-cooling',
    });
  }

  if (input.addOns?.waterService) {
    breakdown.push({
      label: 'Potable Water & Lavatory Servicing',
      amountUsd: 180,
      detail: 'Full replenishment & sanitation',
    });
  }

  const totalUsd = breakdown.reduce((sum, item) => sum + item.amountUsd, 0);
  const totalNgn = totalUsd * USD_TO_NGN_RATE;

  return {
    aircraft,
    locationName: input.location === 'lagos' ? 'Murtala Muhammed Int\'l Airport, Lagos (MMIA)' : 'Nnamdi Azikiwe Int\'l Airport, Abuja (DNAA)',
    operationName: input.operation === 'domestic' ? 'Domestic Flight' : 'International Flight',
    movementName: input.movement === 'weekday' ? 'Weekday Schedule' : 'Weekend Schedule',
    stayName: isOvernight ? `${nights} Night${nights > 1 ? 's' : ''} Overnight` : 'Same-day Turnaround',
    passengers: paxCount,
    breakdown,
    totalUsd,
    totalNgn,
    fxRate: USD_TO_NGN_RATE,
  };
}
