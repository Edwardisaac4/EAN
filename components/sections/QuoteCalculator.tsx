'use client';

import React, { useState, useId, useMemo, useEffect } from 'react';
import {
  Plane,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Phone,
  Mail,
  UtensilsCrossed,
  Zap,
  Droplets,
  Star,
  FileText,
  ArrowRight,
  RotateCcw,
  Share2,
  Bookmark,
  Printer,
  X,
  Layers,
  Loader2,
} from 'lucide-react';
import GoldButton from '@/components/shared/GoldButton';
import SectionReveal from '@/components/shared/SectionReveal';
import {
  AIRCRAFT_DATASET,
  FleetAircraft,
  calculateEstimatedQuote,
  QuoteCalculationResult,
  USD_TO_NGN_RATE,
} from '@/lib/aircraftData';

// Saved Quote Item Interface
interface SavedQuote {
  id: string;
  date: string;
  aircraftName: string;
  locationName: string;
  totalUsd: number;
  totalNgn: number;
  clientName: string;
  company: string;
}

/**
 * Static EUR reference, not a live rate.
 *
 * It sat in `useState` with no setter, which read as though something would
 * update it — nothing ever did. There is no EUR feed in this codebase (the only
 * FX source is USD_TO_NGN_RATE, which is a naira rate and cannot derive this),
 * so the figure is a fixed reference and the UI labels every EUR total as
 * indicative rather than implying a quotable price.
 */
const EUR_PER_USD_INDICATIVE = 0.92;

/** Cap on locally persisted quotes, so the history cannot grow without bound. */
const MAX_SAVED_QUOTES = 20;

export default function QuoteCalculator() {
  const searchId = useId();
  const nameId = useId();
  const emailId = useId();
  const companyId = useId();
  const phoneId = useId();

  // App Workspace Tabs State
  const [appMode, setAppMode] = useState<'calculator' | 'fleet' | 'tariff'>('calculator');
  const [currency, setCurrency] = useState<'USD' | 'NGN' | 'EUR'>('USD');

  // Interactive Flight Configurator State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [location, setLocation] = useState<'lagos' | 'abuja'>('lagos');
  const [operation, setOperation] = useState<'domestic' | 'international'>('international');
  const [movement, setMovement] = useState<'weekday' | 'weekend'>('weekday');
  const [passengers, setPassengers] = useState<number>(4);
  const [stay, setStay] = useState<'same_day' | 'overnight'>('same_day');
  const [overnightNights, setOvernightNights] = useState<number>(1);
  const [addOns, setAddOns] = useState<{ vipLounge: boolean; catering: boolean; gpuPower: boolean; waterService: boolean }>({
    vipLounge: true,
    catering: false,
    gpuPower: true,
    waterService: false,
  });

  // Lead Collection & Pricing Reveal State
  const [isPriceRevealed, setIsPriceRevealed] = useState<boolean>(false);
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [submitError, setSubmitError] = useState<string>('');

  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [quoteReferenceId, setQuoteReferenceId] = useState<string>('');

  // Rehydrates the saved-quote history after mount. The toolbar renders
  // "Saved (n)" before any interaction, so the count has to reach state — but
  // localStorage cannot be read during render without the client HTML
  // disagreeing with the server's, so an effect is the only hydration-safe
  // place for it. That is the narrow case set-state-in-effect exists to allow.
  //
  // No ref ID is minted here: handleRevealPrice always generates a fresh one
  // before flipping isPriceRevealed, and every reader of quoteReferenceId sits
  // behind that flag, so a mount-time value was overwritten before it could
  // ever be displayed — while its Math.random() was a hydration hazard.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ean_saved_quotes_v1');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      if (raw) setSavedQuotes(JSON.parse(raw) as SavedQuote[]);
    } catch {
      // Ignore unreadable or malformed storage.
    }
  }, []);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  // Live API Aircraft List & Selection State
  const [apiAircraftList, setApiAircraftList] = useState<FleetAircraft[]>(AIRCRAFT_DATASET);
  const [selectedAircraft, setSelectedAircraft] = useState<FleetAircraft>(AIRCRAFT_DATASET[0]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Live API Search Fetcher
  useEffect(() => {
    let isMounted = true;
    const fetchLiveAircraft = async () => {
      if (!searchQuery.trim()) {
        setApiAircraftList(AIRCRAFT_DATASET);
        return;
      }
      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/aircraft/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.data || data.aircraft)) {
            const items = (data.data || data.aircraft) as Record<string, unknown>[];
            const mapped: FleetAircraft[] = items.map(item => {
              const existingId = String(item.id || '');
              const curated = AIRCRAFT_DATASET.find(a => a.id === existingId || a.name.toLowerCase() === String(item.name || '').toLowerCase());
              if (curated) return curated;

              const mtowKg = item.mtow_kg !== undefined && item.mtow_kg !== null ? Number(item.mtow_kg) : (item.mtowKg ? Number(item.mtowKg) : null);
              const rawCategory = item.category ? String(item.category) : undefined;
              const rawPax = item.pax_max !== undefined && item.pax_max !== null ? Number(item.pax_max) : (item.maxPassengers ? Number(item.maxPassengers) : undefined);

              const validCategories = ['Light Jet', 'Midsize Jet', 'Super Midsize', 'Heavy Jet', 'Ultra Long Range', 'Helicopter', 'VIP Airliner', 'Turboprop'] as const;
              let category: FleetAircraft['category'] = 'Midsize Jet';
              if (rawCategory && validCategories.includes(rawCategory as typeof validCategories[number])) {
                category = rawCategory as FleetAircraft['category'];
              } else if (mtowKg && mtowKg > 0) {
                if (mtowKg <= 10000) category = 'Light Jet';
                else if (mtowKg <= 15000) category = 'Midsize Jet';
                else if (mtowKg <= 20000) category = 'Super Midsize';
                else if (mtowKg <= 30000) category = 'Heavy Jet';
                else if (mtowKg <= 60000) category = 'Ultra Long Range';
                else category = 'VIP Airliner';
              }
              let maxPassengers = rawPax && rawPax > 0 ? rawPax : 8;
              if (!rawPax || rawPax <= 0) {
                if (category === 'Light Jet') maxPassengers = 7;
                else if (category === 'Midsize Jet') maxPassengers = 8;
                else if (category === 'Super Midsize') maxPassengers = 10;
                else if (category === 'Heavy Jet') maxPassengers = 13;
                else if (category === 'Ultra Long Range') maxPassengers = 16;
                else if (category === 'VIP Airliner') maxPassengers = 25;
                else if (category === 'Turboprop') maxPassengers = 8;
                else if (category === 'Helicopter') maxPassengers = 6;
              }

              let baseHandlingFeeUsd = { domestic: 1300, international: 2050 };
              let landingParkingFeeUsdPerDay = { domestic: 210, international: 420 };
              let paxFeeUsdPerPax = 35;

              if (mtowKg && mtowKg > 0) {
                if (mtowKg <= 5000) {
                  baseHandlingFeeUsd = { domestic: 850, international: 1350 };
                  landingParkingFeeUsdPerDay = { domestic: 120, international: 240 };
                  paxFeeUsdPerPax = 25;
                } else if (mtowKg <= 10000) {
                  baseHandlingFeeUsd = { domestic: 1100, international: 1750 };
                  landingParkingFeeUsdPerDay = { domestic: 170, international: 340 };
                  paxFeeUsdPerPax = 30;
                } else if (mtowKg <= 15000) {
                  baseHandlingFeeUsd = { domestic: 1300, international: 2050 };
                  landingParkingFeeUsdPerDay = { domestic: 210, international: 420 };
                  paxFeeUsdPerPax = 35;
                } else if (mtowKg <= 20000) {
                  baseHandlingFeeUsd = { domestic: 1550, international: 2400 };
                  landingParkingFeeUsdPerDay = { domestic: 260, international: 510 };
                  paxFeeUsdPerPax = 40;
                } else if (mtowKg <= 30000) {
                  baseHandlingFeeUsd = { domestic: 1850, international: 2950 };
                  landingParkingFeeUsdPerDay = { domestic: 320, international: 650 };
                  paxFeeUsdPerPax = 45;
                } else if (mtowKg <= 60000) {
                  baseHandlingFeeUsd = { domestic: 2300, international: 3600 };
                  landingParkingFeeUsdPerDay = { domestic: 470, international: 920 };
                  paxFeeUsdPerPax = 50;
                } else {
                  baseHandlingFeeUsd = { domestic: 3800, international: 5900 };
                  landingParkingFeeUsdPerDay = { domestic: 850, international: 1650 };
                  paxFeeUsdPerPax = 65;
                }
              }

              return {
                id: String(item.id || `custom-${item.name}`),
                name: String(item.name || 'Aircraft'),
                manufacturer: String(item.manufacturer || 'General Aviation'),
                category,
                mtowKg: mtowKg ?? 12000,
                mtowRange: mtowKg ? `${mtowKg.toLocaleString()} kg` : 'Standard MTOW',
                maxPassengers,
                icao: String(item.icao_code || item.icao || 'AVIA'),
                rangeNm: Number(item.range_nm || item.rangeNm || 2500),
                baseHandlingFeeUsd,
                landingParkingFeeUsdPerDay,
                paxFeeUsdPerPax,
              };
            });
            setApiAircraftList(mapped);
          }
        }
      } catch (err) {
        console.warn('Error fetching live aircraft search:', err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    const timer = setTimeout(fetchLiveAircraft, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Filtered aircraft dataset based on Category filter
  const filteredAircraft = useMemo(() => {
    let list = apiAircraftList;
    if (selectedCategoryFilter !== 'All') {
      list = list.filter((a) => a.category === selectedCategoryFilter);
    }
    return list;
  }, [apiAircraftList, selectedCategoryFilter]);

  const effectivePassengers = useMemo(() => {
    return selectedAircraft ? Math.min(passengers, selectedAircraft.maxPassengers) : passengers;
  }, [passengers, selectedAircraft]);

  const quoteResult: QuoteCalculationResult = useMemo(() => {
    return calculateEstimatedQuote({
      aircraftId: selectedAircraft.id,
      customAircraft: selectedAircraft,
      location,
      operation,
      movement,
      passengers: effectivePassengers,
      stay,
      overnightNights,
      addOns,
    });
    // `passengers` is deliberately absent: the quote reads effectivePassengers,
    // which is already memoised on `passengers`, so listing both just recomputed
    // the quote twice for one keystroke.
  }, [selectedAircraft, location, operation, movement, effectivePassengers, stay, overnightNights, addOns]);

  // Formatter for currency display
  const formatMoney = (usdAmount: number) => {
    if (currency === 'NGN') {
      const ngn = usdAmount * USD_TO_NGN_RATE;
      return `₦${ngn.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }
    if (currency === 'EUR') {
      // 'en-EU' is not a valid BCP 47 tag — there is no "EU" region for a
      // locale, so Intl fell back to the default and the grouping was whatever
      // the visitor's browser happened to use. de-DE is a real euro locale.
      const eur = usdAmount * EUR_PER_USD_INDICATIVE;
      return `€${eur.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`;
    }
    return `$${usdAmount.toLocaleString('en-US')}`;
  };

  // Lead Collection & Gate Unlock
  const handleRevealPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.fullName.trim() || !leadForm.email.trim()) {
      setSubmitError('Please enter your full name and business email to unlock pricing.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const randomSuffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.floor(100 + Math.random() * 900).toString();
    const newRefId = `EAN-QT-${new Date().getFullYear()}-${randomSuffix}`;
    setQuoteReferenceId(newRefId);

    try {
      // Post lead payload to backend endpoint
      const res = await fetch('/api/pricing/quote', {
        method: 'POST',
        body: JSON.stringify({
          aircraftId: selectedAircraft.id,
          location,
          operation,
          movement,
          passengers: effectivePassengers,
          stay,
          overnightNights,
          addOns,
          contact: leadForm,
        }),
      });

      if (!res.ok) {
        throw new Error(`Quote calculation server returned status ${res.status}`);
      }

      // Save to saved quotes history
      const newSavedItem: SavedQuote = {
        id: newRefId,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        aircraftName: quoteResult.aircraft.name,
        locationName: quoteResult.locationName,
        totalUsd: quoteResult.totalUsd,
        totalNgn: quoteResult.totalNgn,
        clientName: leadForm.fullName,
        company: leadForm.company || 'Private Client',
      };

      const updatedSaved = [newSavedItem, ...savedQuotes].slice(0, MAX_SAVED_QUOTES);
      setSavedQuotes(updatedSaved);
      try {
        localStorage.setItem('ean_saved_quotes_v1', JSON.stringify(updatedSaved));
      } catch (storageErr) {
        // A quota error (or Safari private mode) must not abort the reveal — the
        // lead has already been submitted and the quote is held in state.
        console.warn('Could not persist saved quotes:', storageErr);
      }

      setIsPriceRevealed(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setSubmitError('Failed to process submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

// Pre-filled WhatsApp link generator
const getWhatsAppShareUrl = () => {
  const text = encodeURIComponent(
    `Hello EAN Aviation Flight Desk,\n\nI would like to confirm ground handling & support for:\n` +
    `• Ref ID: ${quoteReferenceId}\n` +
    `• Aircraft: ${quoteResult.aircraft.name} (${quoteResult.aircraft.mtowRange})\n` +
    `• Station: ${quoteResult.locationName}\n` +
    `• Flight: ${quoteResult.operationName} (${quoteResult.movementName})\n` +
    `• Passengers: ${quoteResult.passengers} Pax | Stay: ${quoteResult.stayName}\n` +
    `• Estimated Handling Total: ${formatMoney(quoteResult.totalUsd)}\n\n` +
    `Company: ${leadForm.company || 'Private Client'}\nName: ${leadForm.fullName} (${leadForm.email})`
  );
  return `https://wa.me/2348033221100?text=${text}`;
};

// Share URL Generator
const handleShareLink = async () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/pricing?aircraft=${selectedAircraft.id}&location=${location}&op=${operation}&pax=${passengers}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  } catch (err) {
    console.error('Failed to copy share link:', err);
  }
};

return (
  <section id="pricing-portal" className="relative w-full bg-linear-to-b from-ean-burgundy-night via-ean-black to-ean-black-accent text-ean-text-light py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden font-ui">

    {/* Background Radial Ambiance */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-137.5 bg-ean-gold/5 blur-[160px] pointer-events-none rounded-full" />
    <div className="absolute bottom-10 right-10 w-150 h-150 bg-ean-burgundy-rich/25 blur-[180px] pointer-events-none rounded-full" />

    <div className="relative z-10 max-w-ean mx-auto space-y-8">

      {/* APP TOOLBAR & NAVIGATION SHELL */}
      <SectionReveal>
        <div className="bg-linear-to-r from-ean-black-accent via-ean-burgundy-deep/40 to-ean-black-accent border border-ean-gold/25 p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* Header Badge & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-ean-gold to-amber-600 flex items-center justify-center text-ean-burgundy-night shadow-[0_0_20px_rgba(169,137,90,0.4)] shrink-0 font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-widest text-ean-gold uppercase">
                  EAN Aviation Rates Portal • Lagos & Abuja
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-light text-ean-text-light tracking-wide">
                Pricing & FBO Ground Support Desk
              </h1>
            </div>
          </div>

          {/* App Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Segmented View Mode Tabs */}
            <div className="inline-flex p-1 bg-ean-black-pure/80 border border-ean-gold/20">
              <button
                onClick={() => setAppMode('calculator')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${appMode === 'calculator' ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md' : 'text-ean-muted-light hover:text-ean-text-light'
                  }`}
              >
                <Calculator className="w-3.5 h-3.5" /> Quote Builder
              </button>
              <button
                onClick={() => setAppMode('fleet')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${appMode === 'fleet' ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md' : 'text-ean-muted-light hover:text-ean-text-light'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" /> Fleet Specs
              </button>
              <button
                onClick={() => setAppMode('tariff')}
                className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${appMode === 'tariff' ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md' : 'text-ean-muted-light hover:text-ean-text-light'
                  }`}
              >
                <FileText className="w-3.5 h-3.5" /> Rate Matrix
              </button>
            </div>

            {/* Currency Selector */}
            <div className="inline-flex p-1 bg-ean-black-pure/80 border border-ean-gold/20">
              {(['USD', 'NGN', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${currency === curr ? 'bg-ean-gold/20 text-ean-gold border border-ean-gold/40' : 'text-ean-muted-light hover:text-ean-text-light'
                    }`}
                >
                  {curr === 'USD' ? '$ USD' : curr === 'NGN' ? '₦ NGN' : '€ EUR'}
                </button>
              ))}
            </div>

            {/* Saved Quotes Drawer */}
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="px-3 py-1.5 bg-ean-black-accent border border-ean-gold/20 hover:border-ean-blue/50 text-ean-muted-light hover:text-ean-blue-light text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-ean-gold" />
              Saved ({savedQuotes.length})
            </button>

            {/* Share Link */}
            <button
              onClick={handleShareLink}
              className="p-2 bg-ean-black-accent border border-ean-gold/20 hover:border-ean-blue/50 text-ean-muted-light hover:text-ean-blue-light transition-all cursor-pointer relative"
              title="Share Quote Link"
            >
              <Share2 className="w-4 h-4 text-ean-gold" />
              {copiedLink && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-ean-gold text-ean-burgundy-night text-[10px] font-bold whitespace-nowrap shadow-lg">
                  Copied!
                </span>
              )}
            </button>

          </div>

        </div>
      </SectionReveal>

      {/* WORKSPACE MODE 1: QUOTE BUILDER & GATED LEAD FORM */}
      {appMode === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT FORM CONFIGURATOR (7 cols) */}
          <div className="lg:col-span-7 bg-linear-to-b from-ean-black-accent/90 to-ean-burgundy-deep/60 border border-ean-gold/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">

            {/* Header Step Label */}
            <div className="flex items-center justify-between border-b border-ean-gold/15 pb-4">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-ean-gold uppercase">Step 1 of 2</span>
                <h2 className="font-display text-2xl font-semibold text-ean-text-light">Configure Flight Parameters</h2>
              </div>
              <span className="text-xs text-ean-gold bg-ean-black-pure/60 px-3 py-1 rounded-full border border-ean-gold/20">
                Approved EAN Rate Card
              </span>
            </div>

            {/* 1. Aircraft Selector Combobox */}
            <div className="space-y-3 relative">
              <label className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center justify-between">
                <span>Select Aircraft Model</span>
                <span className="text-[11px] text-ean-muted-light font-normal">Mapped by MTOW Weight Category</span>
              </label>

              {/* Selected Aircraft Card Header */}
              <button
                type="button"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-ean-black-pure/80 hover:bg-ean-black-accent border border-ean-gold/30 hover:border-ean-blue/60 p-4 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-inner text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-linear-to-br from-ean-gold/20 to-amber-500/10 border border-ean-gold/40 flex items-center justify-center text-ean-gold shrink-0">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ean-text-light text-base">{selectedAircraft.name}</p>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-ean-gold/20 text-ean-gold border border-ean-gold/30">
                        {selectedAircraft.category}
                      </span>
                    </div>
                    <p className="text-xs text-ean-muted-light mt-0.5">
                      MTOW: {selectedAircraft.mtowKg.toLocaleString()} kg ({selectedAircraft.mtowRange}) • Max {selectedAircraft.maxPassengers} Pax
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-ean-gold transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popup Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-linear-to-b from-ean-black-accent via-ean-burgundy-dark to-ean-black-pure border border-ean-gold/40 shadow-2xl overflow-hidden max-h-96 flex flex-col backdrop-blur-2xl">

                  {/* Search & Category Filter Header */}
                  <div className="p-3 border-b border-ean-gold/20 space-y-2 bg-ean-black-pure/90">
                    <div className="relative">
                      <label htmlFor={searchId} className="sr-only">Search aircraft models</label>
                      <Search className="w-4 h-4 text-ean-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id={searchId}
                        type="text"
                        placeholder="Search model, ICAO code (e.g., GLF6), or manufacturer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-ean-black-pure/90 border border-ean-gold/20 pl-9 pr-4 py-2 text-xs text-ean-text-light placeholder-ean-muted-light focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30"
                      />
                    </div>

                    {/* Filter Category Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto max-w-full pb-1">
                      {[
                        { id: 'All', label: `All (${apiAircraftList.length})` },
                        { id: 'Ultra Long Range', label: `Ultra Long Range (${apiAircraftList.filter(a => a.category === 'Ultra Long Range').length})` },
                        { id: 'Heavy Jet', label: `Heavy Jet (${apiAircraftList.filter(a => a.category === 'Heavy Jet').length})` },
                        { id: 'Super Midsize', label: `Super Midsize (${apiAircraftList.filter(a => a.category === 'Super Midsize').length})` },
                        { id: 'Midsize Jet', label: `Midsize Jet (${apiAircraftList.filter(a => a.category === 'Midsize Jet').length})` },
                        { id: 'Light Jet', label: `Light Jet (${apiAircraftList.filter(a => a.category === 'Light Jet').length})` },
                        { id: 'Turboprop', label: `Turboprop (${apiAircraftList.filter(a => a.category === 'Turboprop').length})` },
                        { id: 'Helicopter', label: `Helicopter (${apiAircraftList.filter(a => a.category === 'Helicopter').length})` },
                        { id: 'VIP Airliner', label: `VIP Airliner (${apiAircraftList.filter(a => a.category === 'VIP Airliner').length})` },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat.id)}
                          className={`px-2.5 py-0.5 text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategoryFilter === cat.id
                            ? 'bg-ean-gold text-ean-burgundy-night font-bold'
                            : 'bg-ean-black-accent border border-ean-border-dark text-ean-muted-light hover:text-ean-text-light hover:border-ean-gold/30'
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aircraft Count Header */}
                  <div className="px-3 py-1.5 bg-ean-black-pure/70 border-b border-ean-gold/10 flex items-center justify-between text-[11px] text-ean-gold">
                    <span>Showing {filteredAircraft.length} aircraft models</span>
                    <span className="text-[10px] text-ean-muted-light">Scroll to view all models</span>
                  </div>

                  {/* Aircraft Scrollable List */}
                  <div className="overflow-y-auto divide-y divide-ean-border-dark p-2 space-y-1 max-h-80">
                    {isLoadingApi ? (
                      <div className="flex items-center justify-center gap-2 p-6">
                        <Loader2 className="w-4 h-4 text-ean-gold animate-spin" />
                        <span className="text-xs text-ean-muted-light">Searching aircraft…</span>
                      </div>
                    ) : filteredAircraft.length === 0 ? (
                      <p className="p-4 text-xs text-ean-muted-light text-center">No aircraft matching criteria</p>
                    ) : (
                      filteredAircraft.map((ac) => (
                        <button
                          key={ac.id}
                          onClick={() => {
                            setSelectedAircraft(ac);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left p-3 flex items-center justify-between hover:bg-ean-gold/10 transition-colors cursor-pointer ${selectedAircraft.id === ac.id ? 'bg-ean-gold/15 border border-ean-gold/40' : ''
                            }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ean-text-light text-xs">{ac.name}</span>
                              {ac.popular && (
                                <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-ean-gold/20 text-ean-gold border border-ean-gold/30">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-ean-muted-light mt-0.5">
                              {ac.manufacturer} • {ac.category} • Max {ac.maxPassengers} pax • ICAO: {ac.icao}
                            </p>
                          </div>
                          <span className="text-xs text-ean-gold font-medium">
                            {ac.mtowRange}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Structured Form Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">

              {/* Station */}
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ean-gold" /> FBO Station
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-ean-black-pure/80 border border-ean-gold/20">
                  <button
                    type="button"
                    onClick={() => setLocation('lagos')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${location === 'lagos'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Lagos (MMIA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocation('abuja')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${location === 'abuja'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Abuja (DNAA)
                  </button>
                </div>
              </div>

              {/* Operation */}
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                  <GlobeIcon className="w-3.5 h-3.5 text-ean-gold" /> Operation Type
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-ean-black-pure/80 border border-ean-gold/20">
                  <button
                    type="button"
                    onClick={() => setOperation('domestic')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${operation === 'domestic'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Domestic
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('international')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${operation === 'international'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    International
                  </button>
                </div>
              </div>

              {/* Movement */}
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ean-gold" /> Schedule Day
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-ean-black-pure/80 border border-ean-gold/20">
                  <button
                    type="button"
                    onClick={() => setMovement('weekday')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${movement === 'weekday'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Weekday
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovement('weekend')}
                    className={`py-2.5 text-xs font-semibold transition-all cursor-pointer ${movement === 'weekend'
                      ? 'bg-ean-gold text-ean-burgundy-night font-bold shadow-md'
                      : 'text-ean-muted-light hover:text-ean-text-light'
                      }`}
                  >
                    Weekend (+10%)
                  </button>
                </div>
              </div>

              {/* Passengers Counter */}
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-ean-gold" /> Passengers
                </span>
                <div className="flex items-center bg-ean-black-pure/80 border border-ean-gold/20 p-1 justify-between">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-10 h-9 bg-ean-black-accent hover:bg-ean-gold/20 hover:text-ean-gold border border-ean-border-dark text-ean-text-light font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-semibold text-ean-text-light text-xs">{passengers} Passengers</span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(selectedAircraft.maxPassengers, passengers + 1))}
                    className="w-10 h-9 bg-ean-black-accent hover:bg-ean-gold/20 hover:text-ean-gold border border-ean-border-dark text-ean-text-light font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Turnaround & Overnight Stay */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ean-gold" /> Turnaround & Stay Duration
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStay('same_day')}
                  className={`p-3.5 border text-left transition-all cursor-pointer flex items-center justify-between ${stay === 'same_day'
                    ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]'
                    : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-gold/30'
                    }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-ean-text-light">Same-Day Turnaround</p>
                    <p className="text-[11px] text-ean-muted-light">No overnight parking required</p>
                  </div>
                  {stay === 'same_day' && <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStay('overnight')}
                  className={`p-3.5 border text-left transition-all cursor-pointer flex items-center justify-between ${stay === 'overnight'
                    ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]'
                    : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-gold/30'
                    }`}
                >
                  <div>
                    <p className="font-semibold text-xs text-ean-text-light">Overnight Layover</p>
                    <p className="text-[11px] text-ean-muted-light">Includes ramp parking & security</p>
                  </div>
                  {stay === 'overnight' && <CheckCircle2 className="w-4 h-4 text-ean-gold shrink-0" />}
                </button>
              </div>

              {stay === 'overnight' && (
                <div className="flex items-center justify-between bg-ean-black-pure/80 border border-ean-gold/20 p-3">
                  <span className="text-xs text-ean-muted-light">Overnight Parking Nights:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOvernightNights(Math.max(1, overnightNights - 1))}
                      className="w-7 h-7 bg-ean-black-accent text-ean-text-light font-bold flex items-center justify-center cursor-pointer border border-ean-border-dark hover:border-ean-blue/50 hover:text-ean-blue-light"
                    >
                      -
                    </button>
                    <span className="font-bold text-ean-gold text-xs">{overnightNights} {overnightNights === 1 ? 'Night' : 'Nights'}</span>
                    <button
                      type="button"
                      onClick={() => setOvernightNights(overnightNights + 1)}
                      className="w-7 h-7 bg-ean-black-accent text-ean-text-light font-bold flex items-center justify-center cursor-pointer border border-ean-border-dark hover:border-ean-blue/50 hover:text-ean-blue-light"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Executive Add-on Services */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-ean-gold" /> Executive Add-on Services
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <label className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${addOns.vipLounge ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]' : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-blue/50'
            }`}>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={addOns.vipLounge}
                onChange={(e) => setAddOns({ ...addOns, vipLounge: e.target.checked })}
                className="accent-ean-gold w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-xs text-ean-text-light flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-ean-gold" /> EAN VIP Terminal Pass
                </p>
                <p className="text-[11px] text-ean-muted-light">$75 / guest</p>
              </div>
            </div>
          </label>

          <label className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${addOns.catering ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]' : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-blue/50'
            }`}>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={addOns.catering}
                onChange={(e) => setAddOns({ ...addOns, catering: e.target.checked })}
                className="accent-ean-gold w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-xs text-ean-text-light flex items-center gap-1">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-ean-gold" /> Wings™ Gourmet Catering
                </p>
                <p className="text-[11px] text-ean-muted-light">$120 / guest est.</p>
              </div>
            </div>
          </label>

          <label className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${addOns.gpuPower ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]' : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-blue/50'
            }`}>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={addOns.gpuPower}
                onChange={(e) => setAddOns({ ...addOns, gpuPower: e.target.checked })}
                className="accent-ean-gold w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-xs text-ean-text-light flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-ean-gold" /> GPU Ground Power (2 hrs)
                </p>
                <p className="text-[11px] text-ean-muted-light">$250 flat rate</p>
              </div>
            </div>
          </label>

          <label className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${addOns.waterService ? 'bg-linear-to-r from-ean-gold/15 to-ean-burgundy-deep/30 border-ean-gold text-ean-text-light shadow-[0_0_12px_rgba(169,137,90,0.15)]' : 'bg-ean-black-pure/60 border-ean-border-dark text-ean-muted-light hover:border-ean-blue/50'
            }`}>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={addOns.waterService}
                onChange={(e) => setAddOns({ ...addOns, waterService: e.target.checked })}
                className="accent-ean-gold w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-xs text-ean-text-light flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-ean-gold" /> Potable Water & Lavatory
                </p>
                <p className="text-[11px] text-ean-muted-light">$180 service fee</p>
              </div>
            </div>
          </label>

              </div>
            </div>

  </div>

            {/* RIGHT GATED CARD: BLURRED PRICE + LEAD CAPTURE OVERLAY (5 cols) */ }
<div className="lg:col-span-5 space-y-6">

  {/* Target Aircraft Spec Card */}
  <div className="bg-linear-to-br from-ean-burgundy-mid via-ean-black-accent to-ean-burgundy-dark border border-ean-gold/30 p-6 shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-ean-gold/10 rounded-full blur-2xl pointer-events-none" />
    <div className="relative z-10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-ean-gold uppercase">
          Target Aircraft Spec
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-ean-gold/20 text-ean-gold text-xs font-medium border border-ean-gold/30">
          {quoteResult.aircraft.category}
        </span>
      </div>

      <h3 className="font-display text-2xl sm:text-2xl font-light text-ean-text-light tracking-wide">{quoteResult.aircraft.name}</h3>

      <div className="text-xs text-ean-muted-light space-y-1.5 pt-1 border-t border-ean-border-dark">
        <p className="flex items-center justify-between">
          <span>Maximum Take-Off Weight:</span>
          <strong className="text-ean-text-light">{quoteResult.aircraft.mtowKg.toLocaleString()} kg</strong>
        </p>
        <p className="flex items-center justify-between">
          <span>Station:</span>
          <strong className="text-ean-text-light">{quoteResult.locationName}</strong>
        </p>
        <p className="flex items-center justify-between">
          <span>Flight & Schedule:</span>
          <strong className="text-ean-text-light">{quoteResult.operationName} • {quoteResult.movementName}</strong>
        </p>
        <p className="flex items-center justify-between">
          <span>Passengers & Stay:</span>
          <strong className="text-ean-text-light">{quoteResult.passengers} Pax • {quoteResult.stayName}</strong>
        </p>
      </div>
    </div>
  </div>

  {/* GATED PRICING CONTAINER */}
  <div className="bg-linear-to-b from-ean-black-accent/90 via-ean-burgundy-deep/60 to-ean-black-pure border border-ean-gold/30 p-6 backdrop-blur-xl shadow-2xl relative space-y-6 overflow-hidden">

    {/* STATE A: PRICE UNLOCKED */}
    {isPriceRevealed ? (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

        <div className="flex items-center justify-between border-b border-ean-border-dark pb-4">
          <div className="flex items-center gap-2 text-ean-gold text-xs font-semibold uppercase tracking-wider">
            <Unlock className="w-4 h-4" /> Ref: {quoteReferenceId}
          </div>
          <button
            onClick={() => setIsPriceRevealed(false)}
            className="text-xs text-ean-muted-light hover:text-ean-text-light flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-ean-gold" /> Re-calculate
          </button>
        </div>

        {/* Total Price Display */}
        <div className="bg-linear-to-r from-ean-gold/25 via-ean-burgundy-accent/30 to-ean-black-accent border border-ean-gold/40 p-5 text-center space-y-1 shadow-lg">
          <p className="text-xs text-ean-gold uppercase font-semibold tracking-widest">
            Total Estimated Handling Fee
          </p>
          <p className="font-display text-2xl sm:text-3xl font-light text-ean-text-light tracking-tight">
            {formatMoney(quoteResult.totalUsd)}
          </p>
          <p className="text-xs text-ean-muted-light pt-1">
            FX Reference Rate: ₦{USD_TO_NGN_RATE.toLocaleString()}/$ USD
            {currency === 'EUR' && ` · €${EUR_PER_USD_INDICATIVE}/$ USD (indicative)`}
          </p>
        </div>

        {/* Itemized Fee Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ean-gold uppercase tracking-wider">
            Itemized Fee Breakdown
          </p>
          <div className="divide-y divide-ean-gold/15 bg-ean-black-pure/80 border border-ean-gold/20 p-4 space-y-2 text-xs">
            {quoteResult.breakdown.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ean-text-light">{item.label}</p>
                  {item.detail && <p className="text-[11px] text-ean-muted-light">{item.detail}</p>}
                </div>
                <span className="font-semibold text-ean-gold whitespace-nowrap">{formatMoney(item.amountUsd)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)] cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-current" />
            Request Official Quote on WhatsApp
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="w-full bg-ean-black-accent hover:bg-ean-gold/20 border border-ean-gold/20 hover:border-ean-gold/40 text-ean-text-light font-medium text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-ean-gold" /> Formal PDF Quote
            </button>

            <a
              href={`mailto:handling@ean.aero?subject=Official%20Quote%20Request%20[${quoteReferenceId}]&body=Hello%20EAN%20Operations,%0A%0AHere%20are%20the%20quote%20details%20for%20${encodeURIComponent(quoteResult.aircraft.name)}:`}
              className="w-full bg-ean-black-accent hover:bg-ean-gold/20 border border-ean-gold/20 hover:border-ean-gold/40 text-ean-text-light font-medium text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
            >
              <Mail className="w-3.5 h-3.5 text-ean-gold" /> Email Desk
            </a>
          </div>
        </div>

      </div>
    ) : (

      /* STATE B: BLURRED COST UNDERLAY WITH OVERLAY LEAD COLLECTION FORM */
      <div className="relative space-y-6 min-h-95">

        {/* Blurred Cost Underlay */}
        <div className="space-y-4 filter blur-md select-none opacity-20 pointer-events-none">
          <div className="bg-ean-gold/15 border border-ean-gold/30 p-5 text-center">
            <p className="text-xs text-ean-gold uppercase">Estimated Cost</p>
            <p className="font-display text-3xl font-bold text-ean-text-light">$4,850 USD</p>
          </div>
          <div className="space-y-2 bg-ean-black-pure/80 border border-ean-gold/20 p-4 text-xs">
            <div className="flex justify-between"><span>Base FBO Handling</span><span>$1,850</span></div>
            <div className="flex justify-between"><span>Landing & Navigation</span><span>$320</span></div>
            <div className="flex justify-between"><span>VIP Passenger Facilitation</span><span>$180</span></div>
          </div>
        </div>

        {/* HIGH-CONTRAST LEAD COLLECTION OVERLAY */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center bg-linear-to-b from-ean-black-accent/98 via-ean-burgundy-night/98 to-ean-black-pure/98 border border-ean-gold/40 p-6 space-y-4 backdrop-blur-xl shadow-2xl">

          <div className="flex items-center gap-3 border-b border-ean-gold/20 pb-3">
            <div className="w-9 h-9 bg-linear-to-br from-ean-gold to-amber-600 flex items-center justify-center text-ean-burgundy-night shrink-0 shadow-[0_0_15px_rgba(169,137,90,0.4)]">
              <Lock className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ean-text-light">Enter details to reveal cost</h3>
              <p className="text-[11px] text-ean-muted-light">Instant access to itemized rate card & PDF breakdown.</p>
            </div>
          </div>

          <form onSubmit={handleRevealPrice} className="space-y-3 text-xs">

            <div>
              <label htmlFor={nameId} className="block text-ean-muted-light mb-1 font-medium">
                Full Name *
              </label>
              <input
                id={nameId}
                type="text"
                required
                placeholder="Captain / Operations Manager Name"
                value={leadForm.fullName}
                onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                className="w-full bg-ean-black-pure/80 border border-ean-gold/20 px-3.5 py-2.5 text-ean-text-light placeholder-ean-muted-light/60 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30"
              />
            </div>

            <div>
              <label htmlFor={emailId} className="block text-ean-muted-light mb-1 font-medium">
                Business Email *
              </label>
              <input
                id={emailId}
                type="email"
                required
                placeholder="ops@charter-company.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full bg-ean-black-pure/80 border border-ean-gold/20 px-3.5 py-2.5 text-ean-text-light placeholder-ean-muted-light/60 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label htmlFor={companyId} className="block text-ean-muted-light mb-1 font-medium">
                  Company / Operator
                </label>
                <input
                  id={companyId}
                  type="text"
                  placeholder="e.g. ExecuJet / Private"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="w-full bg-ean-black-pure/80 border border-ean-gold/20 px-3.5 py-2.5 text-ean-text-light placeholder-ean-muted-light/60 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30"
                />
              </div>

              <div>
                <label htmlFor={phoneId} className="block text-ean-muted-light mb-1 font-medium">
                  Phone / WhatsApp
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full bg-ean-black-pure/80 border border-ean-gold/20 px-3.5 py-2.5 text-ean-text-light placeholder-ean-muted-light/60 focus:outline-none focus:border-ean-blue focus:ring-1 focus:ring-ean-blue/30"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5">
                {submitError}
              </p>
            )}

            <GoldButton
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-xs font-bold uppercase tracking-wider shadow-[0_4px_25px_rgba(169,137,90,0.4)] mt-2"
            >
              {isSubmitting ? 'Unlocking Quote...' : 'Reveal Rate Estimate'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </GoldButton>

          </form>

        </div>

      </div>
    )}

  </div>

  {/* Accreditation Footer Card */}
  <div className="p-4 bg-ean-black-accent/70 border border-ean-gold/20 flex items-center gap-3">
    <ShieldCheck className="w-8 h-8 text-ean-gold shrink-0" />
    <p className="text-xs text-ean-muted-light leading-snug">
      EAN Aviation is Nigeria&apos;s premier FBO operator at MMIA Lagos, operating under NCAA and IS-BAO international aviation standards.
    </p>
  </div>

</div>

          </div >
        )
}

{/* WORKSPACE MODE 2: FLEET SPECS EXPLORER */ }
{
  appMode === 'fleet' && (
    <div className="bg-linear-to-b from-ean-black-accent/90 to-ean-burgundy-deep/60 border border-ean-gold/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ean-gold/15 pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ean-text-light">Business Aircraft Fleet Explorer</h2>
          <p className="text-xs text-ean-muted-light mt-1">
            Explore aircraft weight categories, MTOW ranges, passenger limits, and nautical mile ranges.
          </p>
        </div>
        <span className="text-xs text-ean-gold font-semibold bg-ean-gold/10 px-3 py-1.5 rounded-full border border-ean-gold/30">
          {AIRCRAFT_DATASET.length} Aircraft Models Pre-Mapped
        </span>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AIRCRAFT_DATASET.map((ac) => (
          <div
            key={ac.id}
            className={`p-5 border transition-all duration-300 space-y-4 flex flex-col justify-between ${selectedAircraft.id === ac.id
              ? 'bg-linear-to-br from-ean-gold/15 via-ean-burgundy-accent/20 to-ean-black-accent border-ean-gold shadow-[0_4px_25px_rgba(169,137,90,0.25)]'
              : 'bg-ean-black-pure/70 border-ean-border-dark hover:border-ean-gold/40'
              }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-ean-gold/20 text-ean-gold text-[11px] font-semibold">
                  {ac.category}
                </span>
                <span className="font-mono text-xs text-ean-muted-light">ICAO: {ac.icao}</span>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-ean-text-light">{ac.name}</h3>
                <p className="text-xs text-ean-muted-light">{ac.manufacturer}</p>
              </div>

              <div className="divide-y divide-ean-border-dark text-xs text-ean-muted-light pt-2">
                <div className="py-1.5 flex justify-between">
                  <span>MTOW Weight:</span>
                  <strong className="text-ean-text-light">{ac.mtowKg.toLocaleString()} kg</strong>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>Max Passenger Capacity:</span>
                  <strong className="text-ean-text-light">{ac.maxPassengers} Passengers</strong>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>Range:</span>
                  <strong className="text-ean-text-light">{ac.rangeNm.toLocaleString()} NM</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAircraft(ac);
                setAppMode('calculator');
              }}
              className="w-full mt-4 py-2.5 bg-ean-black-accent hover:bg-ean-gold hover:text-ean-burgundy-night text-ean-text-light border border-ean-gold/20 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-ean-gold" /> Calculate Quote for this Aircraft
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

{/* WORKSPACE MODE 3: TARIFF RATE MATRIX */ }
{
  appMode === 'tariff' && (
    <div className="bg-linear-to-b from-ean-black-accent/90 to-ean-burgundy-deep/60 border border-ean-gold/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ean-gold/15 pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ean-text-light">EAN Approved Tariff Matrix</h2>
          <p className="text-xs text-ean-muted-light mt-1">
            Base rate categories per Maximum Take-Off Weight (MTOW) tier for FBO ramp handling at Lagos MMIA & Abuja.
          </p>
        </div>
        <button
          onClick={() => setAppMode('calculator')}
          className="px-4 py-2 bg-ean-gold text-ean-burgundy-night text-xs font-bold shadow-md hover:bg-ean-gold-light transition-all cursor-pointer self-start sm:self-auto"
        >
          ← Switch to Calculator
        </button>
      </div>

      {/* Tariff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-ean-gold/20 text-ean-gold uppercase tracking-wider font-semibold bg-ean-black-pure/80">
              <th className="py-4 px-4">Aircraft Model</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">MTOW Weight Tier</th>
              <th className="py-4 px-4">Domestic Base</th>
              <th className="py-4 px-4">Intl Base</th>
              <th className="py-4 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ean-border-dark">
            {AIRCRAFT_DATASET.map((ac) => (
              <tr key={ac.id} className="hover:bg-ean-gold/10 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-ean-text-light flex items-center gap-2">
                  <Plane className="w-3.5 h-3.5 text-ean-gold" />
                  {ac.name}
                </td>
                <td className="py-3.5 px-4 text-ean-muted-light">{ac.category}</td>
                <td className="py-3.5 px-4 text-ean-text-light font-mono">{ac.mtowKg.toLocaleString()} kg</td>
                <td className="py-3.5 px-4 text-ean-gold font-semibold">{formatMoney(ac.baseHandlingFeeUsd.domestic)}</td>
                <td className="py-3.5 px-4 text-ean-gold font-semibold">{formatMoney(ac.baseHandlingFeeUsd.international)}</td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      setSelectedAircraft(ac);
                      setAppMode('calculator');
                    }}
                    className="text-xs text-ean-gold font-semibold hover:underline"
                  >
                    Calculate →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

      </div >

  {/* SAVED QUOTES DRAWER */ }
{
  isSavedDrawerOpen && (
    <div className="fixed inset-0 z-50 bg-ean-black/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-linear-to-b from-ean-black-accent via-ean-burgundy-dark to-ean-black-pure border-l border-ean-gold/30 h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-ean-gold/20 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-ean-gold" />
            <h3 className="font-display text-xl font-semibold text-ean-text-light">Saved Quote History</h3>
          </div>
          <button
            onClick={() => setIsSavedDrawerOpen(false)}
            className="p-1.5 text-ean-muted-light hover:text-ean-text-light cursor-pointer"
          >
            <X className="w-5 h-5 text-ean-gold" />
          </button>
        </div>

        {savedQuotes.length === 0 ? (
          <p className="text-xs text-ean-muted-light text-center py-10">
            No saved quotes yet. Submit a quote request on the calculator to save quote history.
          </p>
        ) : (
          <div className="space-y-4">
            {savedQuotes.map((q) => (
              <div key={q.id} className="p-4 bg-ean-black/40 border border-ean-border-dark space-y-2 text-xs">
                <div className="flex items-center justify-between text-ean-gold font-semibold">
                  <span>{q.id}</span>
                  <span className="text-[11px] text-ean-muted-light">{q.date}</span>
                </div>
                <p className="font-semibold text-ean-text-light text-sm">{q.aircraftName}</p>
                <p className="text-ean-muted-light">{q.company} • {q.clientName}</p>
                <div className="pt-2 border-t border-ean-border-dark flex items-center justify-between">
                  <span className="font-bold text-ean-text-light text-sm">{formatMoney(q.totalUsd)}</span>
                  <button
                    onClick={() => {
                      setQuoteReferenceId(q.id);
                      setIsSavedDrawerOpen(false);
                      setIsPrintModalOpen(true);
                    }}
                    className="text-ean-gold hover:underline font-semibold"
                  >
                    View PDF →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

{/* FORMAL PRINTABLE PDF QUOTE MODAL */ }
{
  isPrintModalOpen && (
    <div className="fixed inset-0 z-50 bg-ean-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-slate-900 p-8 space-y-6 shadow-2xl relative my-8">
        <button
          onClick={() => setIsPrintModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Letterhead Header */}
        <div className="flex items-start justify-between border-b border-slate-900 pb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 uppercase tracking-wide">EAN AVIATION LIMITED</h2>
            <p className="text-xs text-slate-600">First Approved FBO & Hangar Terminal • Murtala Muhammed Int&apos;l Airport, Lagos</p>
            <p className="text-xs text-slate-600">Email: handling@ean.aero | Web: ean.aero</p>
          </div>
          <div className="text-right text-xs">
            <span className="px-3 py-1 bg-slate-900 text-ean-text-light font-bold inline-block">FORMAL QUOTE</span>
            <p className="mt-2 font-semibold text-slate-800">Ref: {quoteReferenceId}</p>
            <p className="text-slate-500">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Client & Flight Specs Table */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-200">
          <div>
            <p className="font-bold text-slate-500 uppercase text-[10px]">Client / Operator</p>
            <p className="font-bold text-slate-900 text-sm">{leadForm.company || 'Private Executive Client'}</p>
            <p className="text-slate-700">{leadForm.fullName || 'Valued Client'}</p>
            <p className="text-slate-600">{leadForm.email || 'N/A'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase text-[10px]">Flight Operations Detail</p>
            <p className="font-bold text-slate-900 text-sm">{quoteResult.aircraft.name} ({quoteResult.aircraft.mtowKg.toLocaleString()} kg MTOW)</p>
            <p className="text-slate-700">Station: {quoteResult.locationName}</p>
            <p className="text-slate-600">{quoteResult.operationName} • {quoteResult.movementName} • {quoteResult.passengers} Pax</p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-ean-text-light font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quoteResult.breakdown.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    {item.detail && <p className="text-[11px] text-slate-500">{item.detail}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">${item.amountUsd.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Block */}
        <div className="bg-slate-900 text-ean-text-light p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Total Estimated Cost</p>
            <p className="text-[11px] text-slate-400">≈ ₦{quoteResult.totalNgn.toLocaleString()} NGN</p>
          </div>
          <p className="font-display text-2xl font-bold text-amber-400">${quoteResult.totalUsd.toLocaleString()} USD</p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-[11px] text-slate-500 max-w-md">
            This document serves as an official rate estimate from EAN Aviation. Final invoicing is subject to official flight permits and actual aircraft weight confirmation.
          </p>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-900 text-ean-text-light font-semibold text-xs flex items-center gap-2 hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

      </div>
    </div>
  )
}

    </section >
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
