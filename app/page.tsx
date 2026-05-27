import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'CRE Data — Commercial Real Estate Intelligence',
  description: 'AI-powered market signals for commercial real estate brokers, developers, and lenders.',
};

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">

      {/* Nav */}
      <nav className="landing-nav fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-400/20 flex items-center justify-center">
              <span className="text-teal-400 font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-slate-100 tracking-tight">CRE Data</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-slate-400 hover:text-slate-200 text-sm transition-colors hidden sm:inline font-medium">Features</a>
            <a href="#pricing" className="text-slate-400 hover:text-slate-200 text-sm transition-colors hidden sm:inline font-medium">Pricing</a>
            <Link href="/sign-in" className="text-slate-400 hover:text-slate-200 text-sm transition-colors font-medium">Sign in</Link>
            <Link href="/sign-up" className="px-4 py-2 bg-teal-400 text-navy-950 font-bold text-sm rounded-lg hover:bg-teal-300 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1 text-xs text-teal-400 font-semibold mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Live · Updated nightly from public data sources
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-slate-100">
            Know which markets are{' '}
            <span className="text-teal-400">moving</span>{' '}
            before your competition does
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl">
            CRE Data scores every zip code across permit velocity, vacancy shifts, and lease expirations — then uses AI to tell you what it means and who should be paying attention.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <Link href="/sign-up" className="px-7 py-3.5 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-colors text-center text-base">
              Start 7-day free trial
            </Link>
            <a href="#features" className="px-7 py-3.5 bg-navy-800 border border-navy-700 text-slate-300 font-semibold rounded-xl hover:bg-navy-700 transition-colors text-center text-base">
              See how it works →
            </a>
          </div>
          <p className="text-slate-600 text-sm mt-5">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Signal Feed Preview */}
      <section className="px-6 pb-24 max-w-6xl mx-auto" id="features">
        <div className="mb-10">
          <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Signal Feed</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-3 text-slate-100">Your watchlist, scored and interpreted</h2>
          <p className="text-slate-400 max-w-xl">Every zip code in your watchlist gets a composite signal score updated nightly. Drill in to see exactly which sub-signals are driving the number.</p>
        </div>

        {/* Expanded mock card */}
        <div className="rounded-2xl border border-orange-500/30 bg-navy-900 p-5 sm:p-6 mb-3 ring-1 ring-teal-400/10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📊</span>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-teal-400 text-lg">10001</span>
                  <span className="text-slate-400 text-sm">Composite</span>
                  <span className="text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">↑12.3% 30d</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed max-w-lg">Strong tenant improvement surge signals active lease renewals in Midtown West.</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => <div key={i} className="w-3 h-2 rounded-sm bg-orange-400"/>)}
                  <div className="w-3 h-2 rounded-sm bg-navy-700"/>
                </div>
                <span className="font-mono font-bold text-2xl text-slate-100">78</span>
              </div>
              <span className="text-orange-400 text-sm font-medium">Elevated</span>
              <span className="text-slate-500 text-xs">1 day ago</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-700 space-y-4">
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Analysis</h4>
              <p className="text-slate-300 text-sm leading-relaxed">Permit volume is 45% above baseline driven almost entirely by TI permits. Vacancy is tightening down 1.8pp over 90 days. Two known expirations inside 6 months.</p>
            </div>
            <div>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Sub-scores</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
                {[
                  ['Permit Volume', 82, '#3B82F6'],
                  ['Permit Value', 75, '#3B82F6'],
                  ['Permit Type', 90, '#10B981'],
                  ['Permit Momentum', 71, '#3B82F6'],
                  ['Vacancy Level', 65, '#F59E0B'],
                  ['Vacancy Direction', 80, '#10B981'],
                  ['Lease Density', 55, '#F59E0B'],
                  ['Lease Timing', 70, '#3B82F6'],
                ].map(([label, val, color]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{label as string}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color as string }} />
                      </div>
                      <span className="font-mono text-xs text-slate-300 w-6 text-right">{val as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>AI Confidence: <span className="text-slate-300 font-mono">85/100</span></span>
              <span>·</span>
              <span>Data completeness: 90%</span>
            </div>
          </div>
        </div>

        {/* Collapsed cards */}
        {[
          { zip: '60601', score: 71, band: 'Elevated', change: '+8.1%', icon: '🏢', desc: 'Absorption accelerating in River North — vacancy down 2.4pp this quarter.' },
          { zip: '77001', score: 84, band: 'High', change: '+19.4%', icon: '🏗️', desc: 'New construction permits surging 3× baseline — developer confidence in Energy Corridor.' },
        ].map(z => (
          <div key={z.zip} className="rounded-xl border border-navy-700 bg-navy-900 p-5 mb-3 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{z.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-teal-400 text-lg">{z.zip}</span>
                    <span className="text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">↑{z.change} 30d</span>
                  </div>
                  <p className="text-slate-400 text-sm">{z.desc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="font-mono font-bold text-2xl text-slate-100">{z.score}</span>
                <span className={`text-sm font-medium ${z.score >= 80 ? 'text-red-400' : 'text-orange-400'}`}>{z.band}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Feature grid */}
      <section className="px-6 py-20 border-t border-navy-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-100">Everything in one platform</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From raw permit data to AI-written market narratives — no spreadsheets, no manual research.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: '🗺️', title: 'Signal Map',
                desc: "Visualize signal strength across every tracked zip. Click any bubble for a full score breakdown.",
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs font-mono space-y-1.5">
                    {[['10001 NYC','84','text-red-400'],['77001 HOU','78','text-orange-400'],['60601 CHI','71','text-orange-400'],['90210 LA','58','text-amber-400']].map(([z,s,c])=>(
                      <div key={z} className="flex justify-between"><span className="text-teal-400">{z}</span><span className={c}>{s} ●</span></div>
                    ))}
                  </div>
                ),
              },
              {
                icon: '📋', title: 'Lease Expiration Radar',
                desc: "SEC 10-K sourced lease expirations clustered by quarter. Know who's coming to market before they do.",
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs space-y-2">
                    {[['Q3 2026','2 exp','180K sqft','text-red-400'],['Q4 2026','5 exp','420K sqft','text-orange-400'],['Q1 2027','3 exp','290K sqft','text-amber-400']].map(([q,n,sf,c])=>(
                      <div key={q} className="flex items-center justify-between">
                        <span className={`font-mono font-bold ${c}`}>{q}</span>
                        <span className="text-slate-500">{n}</span>
                        <span className="text-slate-300">{sf}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                icon: '🤖', title: 'AI Signal Analyst',
                desc: 'Ask questions in plain English. Full context on your watched markets, answers with data citations.',
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs space-y-2">
                    <div className="bg-navy-800 rounded px-2.5 py-1.5 text-slate-400">Which of my zips has the strongest lease momentum?</div>
                    <div className="bg-teal-400/10 border border-teal-400/10 rounded px-2.5 py-1.5 text-slate-300">10001 leads with lease timing score of 70 and 2 known expirations inside Q3...</div>
                  </div>
                ),
              },
              {
                icon: '🔍', title: 'Zip Code Explorer',
                desc: 'Deep dive on any zip: full score history, permit filings table, and an AI-written market narrative.',
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs space-y-2">
                    {[['Signal Score','78','text-orange-400'],['Permit filings (90d)','14','text-slate-300'],['Vacancy trend','−1.8pp','text-emerald-400'],['Leases expiring <6mo','2','text-red-400']].map(([l,v,c])=>(
                      <div key={l} className="flex justify-between"><span className="text-slate-500">{l}</span><span className={`font-mono ${c}`}>{v}</span></div>
                    ))}
                  </div>
                ),
              },
              {
                icon: '📡', title: 'Permit Pulse',
                desc: 'Live permit filings from city open data APIs. Filter by type, value, and contractor.',
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs space-y-1.5">
                    {[['New Construction','$4.5M','🏗️'],['Tenant Improvement','$850K','🔨'],['Demolition','$120K','⚠️']].map(([t,v,i])=>(
                      <div key={t} className="flex items-center gap-2">
                        <span>{i}</span><span className="text-slate-400 flex-1">{t}</span><span className="font-mono text-teal-400">{v}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                icon: '🔔', title: 'Score Alerts',
                desc: 'Get notified by email when a zip crosses your threshold. Set it and let the data come to you.',
                preview: (
                  <div className="mt-4 rounded-lg bg-navy-950 border border-navy-700 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-400 flex-shrink-0">!</div>
                      <div>
                        <div className="text-slate-300 font-medium">Alert: 10001 hit 78</div>
                        <div className="text-slate-500">Score crossed threshold of 65</div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ].map(f => (
              <div key={f.title} className="bg-navy-900 border border-navy-800 rounded-2xl p-5 hover:border-teal-400/20 transition-colors">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-slate-100 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                {f.preview}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="px-6 py-12 border-t border-navy-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-600 text-xs uppercase tracking-widest mb-6">Powered by public data sources</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-sm font-medium">
            {['City Open Data APIs','US Census Bureau','FRED (Federal Reserve)','SEC EDGAR 10-Ks','Anthropic Claude AI'].map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="text-teal-400 text-xs">✓</span>{s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 border-t border-navy-800" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-100">Simple, transparent pricing</h2>
            <p className="text-slate-400">7-day free trial on all plans. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Starter', price: 149, zips: 5,  csv: false, alerts: false, api: false, seats: 1, highlight: false },
              { name: 'Pro',     price: 399, zips: 50, csv: true,  alerts: true,  api: false, seats: 1, highlight: true  },
              { name: 'Team',    price: 799, zips: -1, csv: true,  alerts: true,  api: true,  seats: 5, highlight: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-6 border transition-all ${plan.highlight ? 'border-teal-400/50 bg-teal-400/5 ring-1 ring-teal-400/20' : 'border-navy-700 bg-navy-900'}`}>
                {plan.highlight && (
                  <div className="text-xs text-teal-400 font-semibold bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded-full inline-block mb-3">Most popular</div>
                )}
                <div className="font-semibold text-slate-200 mb-1">{plan.name}</div>
                <div className="font-mono text-3xl font-bold text-slate-100 mb-4">
                  ${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  {[
                    [`${plan.zips === -1 ? 'Unlimited' : plan.zips} zip codes`, true],
                    ['CSV export', plan.csv],
                    ['Email alerts', plan.alerts],
                    ['API access', plan.api],
                    [`${plan.seats} seat${plan.seats > 1 ? 's' : ''}`, true],
                  ].map(([label, enabled]) => (
                    <li key={label as string} className={`flex items-center gap-2 ${enabled ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className={enabled ? 'text-teal-400' : 'text-slate-700'}>{enabled ? '✓' : '✕'}</span>
                      {label as string}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block w-full py-2.5 text-sm font-semibold rounded-xl text-center transition-colors ${plan.highlight ? 'bg-teal-400 text-navy-950 hover:bg-teal-300' : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-navy-700'}`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 border-t border-navy-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100">Start seeing the market clearly</h2>
          <p className="text-slate-400 mb-8">7-day free trial. No credit card. Full access from day one.</p>
          <Link href="/sign-up" className="inline-block px-8 py-3.5 bg-teal-400 text-navy-950 font-bold rounded-xl hover:bg-teal-300 transition-colors text-lg">
            Get started free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-navy-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-400/20 flex items-center justify-center">
              <span className="text-teal-400 text-xs font-bold">C</span>
            </div>
            <span className="text-slate-500 text-sm">CRE Data</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600 text-xs">
            <span>© 2026 CRE Data</span>
            <Link href="/sign-in" className="hover:text-slate-400 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-slate-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
