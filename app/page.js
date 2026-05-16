'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Step content
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'room',
    eyebrow: 'Project type',
    question: 'What room are you renovating?',
    helper: 'Tell us which space you have in mind.',
    type: 'single',
    options: [
      { value: 'Kitchen', desc: 'The heart of the home — cabinetry, counters, appliances.' },
      { value: 'Bathroom', desc: 'A spa-like retreat with tile, fixtures, and lighting.' },
      { value: 'Full Interior', desc: 'A whole-home transformation, room by room.' },
    ],
  },
  {
    id: 'size',
    eyebrow: 'Footprint',
    question: 'What’s the approximate size?',
    helper: 'A rough estimate is fine — we’ll refine it at your consultation.',
    type: 'single',
    options: [
      { value: 'Small (under 100 sq ft)', desc: 'Powder rooms, galley kitchens, compact spaces.' },
      { value: 'Medium (100–200 sq ft)', desc: 'Standard kitchens and primary baths.' },
      { value: 'Large (200+ sq ft)', desc: 'Open-plan kitchens, suites, larger interiors.' },
    ],
  },
  {
    id: 'scope',
    eyebrow: 'Scope of work',
    question: 'What level of renovation?',
    helper: 'This drives most of the cost. Be honest about your vision.',
    type: 'single',
    options: [
      {
        value: 'Cosmetic Refresh',
        desc: 'New paint, fixtures, hardware, and surface-level finishes.',
      },
      {
        value: 'Partial Remodel',
        desc: 'Layout stays — new cabinets, counters, tile, and fixtures.',
      },
      {
        value: 'Full Gut Renovation',
        desc: 'Everything torn out — new layout and full custom build.',
      },
    ],
  },
  {
    id: 'features',
    eyebrow: 'Must-haves',
    question: 'Which features matter most?',
    helper: 'Select all that apply.',
    type: 'multi',
    // options defined dynamically per room
  },
  {
    id: 'timeline',
    eyebrow: 'Timing',
    question: 'What’s your timeline?',
    helper: 'When would you ideally like to start construction?',
    type: 'single',
    options: [
      { value: 'Flexible (6+ months out)', desc: 'Planning ahead — the right approach.' },
      { value: 'Within 3–6 months', desc: 'A comfortable runway for design and permits.' },
      { value: 'ASAP (within 1–2 months)', desc: 'We’ll prioritize fast-tracked scheduling.' },
    ],
  },
  {
    id: 'location',
    eyebrow: 'Location',
    question: 'Where is the project?',
    helper: 'We serve homeowners across Central Florida.',
    type: 'single',
    options: [
      { value: 'Tampa Bay Area', desc: 'Tampa, St. Petersburg, Clearwater.' },
      { value: 'Orlando Area', desc: 'Orlando metro and surrounding communities.' },
      { value: 'Other Florida Location', desc: 'Reach out — we may still be able to help.' },
    ],
  },
];

const FEATURE_OPTIONS = {
  Kitchen: [
    'Custom Cabinetry',
    'Island or Peninsula',
    'Premium Countertops',
    'New Flooring',
    'Updated Lighting',
    'New Appliances',
    'Backsplash',
  ],
  Bathroom: [
    'Walk-in Shower',
    'Freestanding Tub',
    'Double Vanity',
    'Custom Tile Work',
    'Updated Lighting',
    'Heated Floors',
    'New Fixtures',
  ],
  'Full Interior': [
    'Multiple Rooms',
    'Open Concept Layout Changes',
    'Custom Built-ins',
    'New Flooring Throughout',
    'Lighting Package',
    'Full Paint & Finish',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Small components
// ─────────────────────────────────────────────────────────────────────────────

function Header({ currentStep, totalSteps }) {
  return (
    <header className="px-6 pt-8 pb-6 md:px-12 md:pt-10 md:pb-8">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[22px] font-medium tracking-tight text-ink md:text-[26px]">
            Revive
          </span>
          <span className="hidden h-3 w-px bg-line sm:block" />
          <span className="hidden text-[11px] font-medium uppercase tracking-eyebrow text-muted sm:block">
            Design &amp; Renovation
          </span>
        </div>
        <div className="tabular text-[11px] font-medium uppercase tracking-eyebrow text-muted">
          {String(Math.min(currentStep + 1, totalSteps)).padStart(2, '0')}
          <span className="mx-1.5 text-line">/</span>
          {String(totalSteps).padStart(2, '0')}
        </div>
      </div>
    </header>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="px-6 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="progress-track w-full">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="mb-5 text-[11px] font-medium uppercase tracking-eyebrow text-accent">{children}</p>
  );
}

function Question({ children }) {
  return (
    <h1 className="font-display text-[34px] font-medium leading-[1.08] tracking-tight text-ink md:text-[44px] lg:text-[52px]">
      {children}
    </h1>
  );
}

function Helper({ children }) {
  return <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted md:text-base">{children}</p>;
}

function RadioCard({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      className="option-card group flex w-full items-start gap-5 rounded-sm border border-line px-5 py-5 text-left md:px-6 md:py-6"
    >
      <span className="option-indicator mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-line bg-white">
        <span className="option-indicator-dot h-[7px] w-[7px] rounded-full bg-white" />
      </span>
      <span className="flex-1">
        <span className="block text-[16px] font-medium text-ink md:text-[17px]">{option.value}</span>
        {option.desc ? (
          <span className="mt-1 block text-[14px] leading-relaxed text-muted">{option.desc}</span>
        ) : null}
      </span>
    </button>
  );
}

function CheckboxChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      className="option-card group flex items-center gap-3 rounded-sm border border-line px-4 py-3 text-left"
    >
      <span className="option-indicator flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[2px] border border-line bg-white">
        <svg
          className="option-indicator-dot h-[10px] w-[10px] text-white"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 6.5 5 9.5 10 3" />
        </svg>
      </span>
      <span className="text-[14.5px] font-medium text-ink md:text-[15px]">{label}</span>
    </button>
  );
}

function BackButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-0"
    >
      <svg
        className="h-[14px] w-[14px] transition-transform group-hover:-translate-x-0.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="13" y1="8" x2="3" y2="8" />
        <polyline points="7 12 3 8 7 4" />
      </svg>
      <span>Back</span>
    </button>
  );
}

function ContinueButton({ onClick, disabled, label = 'Continue' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-primary inline-flex items-center gap-2.5 rounded-sm bg-ink px-7 py-3.5 text-[13.5px] font-medium tracking-wide text-cream"
      style={{ backgroundColor: disabled ? undefined : '#1A1714' }}
    >
      <span>{label}</span>
      <svg
        className="h-[14px] w-[14px]"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="8" x2="13" y2="8" />
        <polyline points="9 4 13 8 9 12" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading screen
// ─────────────────────────────────────────────────────────────────────────────

function LoadingScreen() {
  const phrases = [
    'Reviewing your selections',
    'Cross-referencing 2026 Florida market data',
    'Sizing the project scope',
    'Preparing your estimate',
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <Eyebrow>Working</Eyebrow>
      <h2 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink md:text-[44px]">
        Calculating your estimate
      </h2>
      <div className="mt-10 flex items-center gap-2">
        <span className="loading-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '0s' }} />
        <span className="loading-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '0.16s' }} />
        <span className="loading-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '0.32s' }} />
      </div>
      <p key={index} className="reveal mt-8 text-[13px] uppercase tracking-eyebrow text-muted">
        {phrases[index]}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Results screen
// ─────────────────────────────────────────────────────────────────────────────

function formatMoney(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

function ResultsScreen({ result, answers, onReset }) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-2 md:px-12">
      <div className="reveal delay-1">
        <Eyebrow>Your estimated range</Eyebrow>
      </div>

      <div className="reveal-price delay-2 mt-1">
        <p className="font-display text-[42px] font-medium leading-[1.04] tracking-tight text-ink sm:text-[58px] md:text-[76px] lg:text-[88px]">
          <span className="tabular">{formatMoney(result.lowEstimate)}</span>
          <span className="mx-3 text-muted">–</span>
          <span className="tabular">{formatMoney(result.highEstimate)}</span>
        </p>
      </div>

      <div className="reveal delay-3 mt-6 flex items-baseline gap-2 text-[15px] text-ink md:text-base">
        <span>As low as</span>
        <span className="tabular font-medium text-accent">
          {formatMoney(result.monthlyPayment)}
        </span>
        <span>/month with 0% financing for 24 months.</span>
      </div>

      <div className="reveal delay-4 mt-12 hairline" />

      <div className="reveal delay-4 mt-10 grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:gap-12">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-muted">What drives this</p>
          <p className="mt-3 max-w-prose text-[16px] leading-relaxed text-ink md:text-[17px]">
            {result.summary}
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-muted">Estimated duration</p>
          <p className="font-display mt-3 text-[26px] font-medium tracking-tight text-ink md:text-[30px]">
            {result.timeline}
          </p>
        </div>
      </div>

      <div className="reveal delay-5 mt-12 hairline" />

      <div className="reveal delay-5 mt-10">
        <p className="max-w-prose text-[15px] leading-relaxed text-muted md:text-base">
          {result.nextStep}
        </p>

        <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href="https://www.revivedesignandrenovation.com/schedule-a-consultation/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2.5 rounded-sm px-7 py-4 text-[13.5px] font-medium tracking-wide text-cream"
            style={{ backgroundColor: '#0171BB' }}
          >
            <span>Book Your Free Consultation</span>
            <svg
              className="h-[14px] w-[14px]"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="8" x2="13" y2="8" />
              <polyline points="9 4 13 8 9 12" />
            </svg>
          </a>
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] font-medium text-muted underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-ink"
          >
            Start over
          </button>
        </div>
      </div>

      <div className="reveal delay-6 mt-16 hairline" />

      <p className="reveal delay-6 mt-6 max-w-prose text-[12px] leading-relaxed text-muted">
        This is an approximate range based on typical Florida market pricing. Your final cost will be
        determined during your complimentary in-home consultation.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [answers, setAnswers] = useState({
    room: '',
    size: '',
    scope: '',
    features: [],
    timeline: '',
    location: '',
  });
  const [animKey, setAnimKey] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const scrollAnchor = useRef(null);

  const totalSteps = STEPS.length;
  const step = STEPS[stepIndex];
  const progress = (stepIndex + (result ? 1 : 0)) / totalSteps;

  // Reset features when room changes
  useEffect(() => {
    setAnswers((a) => ({ ...a, features: [] }));
  }, [answers.room]);

  // Scroll to top on step change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [stepIndex, isCalculating, result]);

  const canProceed = () => {
    if (step.id === 'features') return answers.features.length > 0;
    return Boolean(answers[step.id]);
  };

  const goNext = async () => {
    if (stepIndex < totalSteps - 1) {
      setDirection('forward');
      setStepIndex((i) => i + 1);
      setAnimKey((k) => k + 1);
      return;
    }
    // Submit
    setIsCalculating(true);
    setError(null);
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const goBack = () => {
    if (result) {
      setResult(null);
      setError(null);
      return;
    }
    if (stepIndex > 0) {
      setDirection('backward');
      setStepIndex((i) => i - 1);
      setAnimKey((k) => k + 1);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setStepIndex(0);
    setAnimKey((k) => k + 1);
    setAnswers({
      room: '',
      size: '',
      scope: '',
      features: [],
      timeline: '',
      location: '',
    });
  };

  const setSingle = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }));
  };

  const toggleFeature = (value) => {
    setAnswers((a) => {
      const exists = a.features.includes(value);
      return {
        ...a,
        features: exists ? a.features.filter((f) => f !== value) : [...a.features, value],
      };
    });
  };

  // Render
  return (
    <main className="grain relative min-h-screen">
      <Header
        currentStep={result ? totalSteps - 1 : isCalculating ? totalSteps - 1 : stepIndex}
        totalSteps={totalSteps}
      />
      <ProgressBar progress={result ? 1 : isCalculating ? (stepIndex + 0.95) / totalSteps : progress} />

      <div ref={scrollAnchor} />

      {/* ────────────────────────── Results ────────────────────────── */}
      {result ? (
        <ResultsScreen result={result} answers={answers} onReset={handleReset} />
      ) : isCalculating ? (
        <LoadingScreen />
      ) : (
        <div
          key={animKey}
          className={direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward'}
        >
          <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:px-12 md:pb-24 md:pt-16">
            <Eyebrow>{step.eyebrow}</Eyebrow>
            <Question>{step.question}</Question>
            <Helper>{step.helper}</Helper>

            {/* Options */}
            <div className="mt-10 md:mt-14">
              {step.type === 'single' && (
                <div className="flex flex-col gap-3">
                  {step.options.map((opt) => (
                    <RadioCard
                      key={opt.value}
                      option={opt}
                      selected={answers[step.id] === opt.value}
                      onClick={() => setSingle(step.id, opt.value)}
                    />
                  ))}
                </div>
              )}

              {step.type === 'multi' && (
                <div className="flex flex-wrap gap-2.5">
                  {(FEATURE_OPTIONS[answers.room] || []).map((label) => (
                    <CheckboxChip
                      key={label}
                      label={label}
                      selected={answers.features.includes(label)}
                      onClick={() => toggleFeature(label)}
                    />
                  ))}
                </div>
              )}
            </div>

            {error ? (
              <p className="mt-8 text-[13px] text-red-700">{error}</p>
            ) : null}

            {/* Footer actions */}
            <div className="mt-12 flex items-center justify-between md:mt-16">
              <BackButton onClick={goBack} disabled={stepIndex === 0} />
              <ContinueButton
                onClick={goNext}
                disabled={!canProceed()}
                label={stepIndex === totalSteps - 1 ? 'See my estimate' : 'Continue'}
              />
            </div>
          </section>
        </div>
      )}

      {/* ────────────────────────── Footer ────────────────────────── */}
      <footer className="px-6 pb-10 md:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between border-t border-line pt-6">
          <p className="text-[11px] uppercase tracking-eyebrow text-muted">
            Tampa &nbsp;·&nbsp; Orlando &nbsp;·&nbsp; Florida
          </p>
          <p className="text-[11px] uppercase tracking-eyebrow text-muted">
            Your AI Renovation Estimator
          </p>
        </div>
      </footer>
    </main>
  );
}
