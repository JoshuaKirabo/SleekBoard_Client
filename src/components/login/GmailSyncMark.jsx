// The Gmail Sync mark beside its name on the login screen: Gmail's M on a white disc, with two sync arrows running
// round it. While syncing is on, the arrows turn one lap, rest, and turn again, so it reads as your board keeping up.
export default function GmailSyncMark({ syncing = true, className = "" })
  {
    return (
      <svg viewBox="-1 -1 26 26" className={className} aria-hidden="true">
        <g className={`gmail-sync-arrows ${syncing ? "is-syncing" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.07 4.93A10 10 0 0 0 2.34 14.59" />
          <path d="M3.37 11.77L2.34 14.59L0.04 12.66" />
          <path d="M4.93 19.07A10 10 0 0 0 21.66 9.41" />
          <path d="M20.63 12.23L21.66 9.41L23.96 11.34" />
        </g>

        <circle cx="12" cy="12" r="6.6" fill="#fff" />

        {/* Gmail's M, scaled from its own 88 by 66 box into the disc. */}
        <g transform="translate(8 9.25) scale(0.0909) translate(-52 -42)">
          <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
          <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
          <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
          <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
          <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
        </g>
      </svg>
    );
  }
