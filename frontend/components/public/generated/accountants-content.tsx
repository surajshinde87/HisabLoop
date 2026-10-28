import { ContactForm } from "@/components/public/contact-form";

export function AccountantsContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {" "}
        <section className="relative overflow-hidden pt-space-2xl pb-space-2xl bg-surface-container-low">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-secondary-fixed filter blur-3xl opacity-30"></div>
            {" "}
            <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-primary-fixed filter blur-3xl opacity-40"></div>
          </div>
          {" "}
          <div className="relative max-w-7xl mx-auto px-margin">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              {" "}
              <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-lowest shadow-sm mb-space-lg">
                <span className="material-symbols-outlined text-secondary text-sm">
                  {"verified_user"}
                </span>
                {" "}
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  {" Dedicated CA Portal \u00b7 Purpose-Built For Indian Accounting Firms "}
                </span>
              </div>
              {" "}
              {" "}
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight text-center mb-space-md">
                {" Cleaner expense records."}
                <br />
                {" "}
                <span className="text-secondary">
                  {"Smoother client workflows."}
                </span>
              </h1>
              {" "}
              {" "}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl text-center leading-relaxed mb-space-xl">
                {" Help your MSME clients organize expense receipts via WhatsApp, automatically verify 15-digit GSTINs, safeguard Input Tax Credit (ITC), and export audit-ready ledgers into Tally Prime or Zoho Books \u2014 without chasing shoe-boxes or messy WhatsApp groups. "}
              </p>
              {" "}
              {" "}
              <div className="flex flex-col sm:flex-row items-center gap-space-md justify-center w-full max-w-md mb-space-2xl">
                <a className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm transition-all duration-200" href="#partner-form">
                  <span className="material-symbols-outlined text-base mr-2">
                    {"dashboard"}
                  </span>
                  {" Explore the CA Workspace "}
                </a>
                {" "}
                <a className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-label-lg text-label-lg shadow-sm transition-all duration-200" href="#partner-form">
                  <span className="material-symbols-outlined text-base mr-2">
                    {"assignment_ind"}
                  </span>
                  {" Register as a CA Partner "}
                </a>
              </div>
              {" "}
              {" "}
              <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md items-center">
                  <div className="flex items-center justify-center gap-2 text-left">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      {"check_circle"}
                    </span>
                    {" "}
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">
                      {"Complimentary CA Seat"}
                      <br />
                      <span className="text-on-surface-variant font-normal">
                        {"on all Growth Plans"}
                      </span>
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-center justify-center gap-2 text-left">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      {"sync_alt"}
                    </span>
                    {" "}
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">
                      {"1-Click Sync"}
                      <br />
                      <span className="text-on-surface-variant font-normal">
                        {"Tally Prime XML & Zoho"}
                      </span>
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-center justify-center gap-2 text-left">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      {"policy"}
                    </span>
                    {" "}
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">
                      {"Sec 17(5) Segregation"}
                      <br />
                      <span className="text-on-surface-variant font-normal">
                        {"Automated blocked ITC"}
                      </span>
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-center justify-center gap-2 text-left">
                    <span className="material-symbols-outlined text-secondary text-lg">
                      {"lock"}
                    </span>
                    {" "}
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">
                      {"Immutable Scans"}
                      <br />
                      <span className="text-on-surface-variant font-normal">
                        {"Zero client data tampering"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-surface">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="max-w-3xl mx-auto text-center mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-2">
                {" The Month-End Bottleneck "}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-sm">
                {" Stop spending 30% of your billable hours sorting crumpled paper vouchers. "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" External CAs and bookkeepers spend days untangling chaotic client receipts before filing GSTR-2B, 3B, and computing tax liabilities. "}
              </p>
            </div>
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-xl">
                      {"receipt_long"}
                    </span>
                  </div>
                  {" "}
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs font-semibold">
                    {"Missing & Faded Invoices"}
                  </h3>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {" Thermal taxi slips, petrol bills, and toll chits fade within weeks, resulting in unverified expenses and disallowances during statutory assessments. "}
                  </p>
                </div>
                {" "}
                <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl">
                  <span className="font-label-sm text-label-sm text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {"warning"}
                    </span>
                    {" Disallowance Risk: High "}
                  </span>
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-xl">
                      {"fact_check"}
                    </span>
                  </div>
                  {" "}
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs font-semibold">
                    {"Mismatched GSTINs"}
                  </h3>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {" Clients submit bills with wrong state prefixes or invalid supplier numbers, triggering GSTR-2B mismatches and disputed ITC claims. "}
                  </p>
                </div>
                {" "}
                <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {"tune"}
                    </span>
                    {" 15-Digit Master Verification "}
                  </span>
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-xl">
                      {"block"}
                    </span>
                  </div>
                  {" "}
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs font-semibold">
                    {"Blocked Credits (Sec 17(5))"}
                  </h3>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {" Manually screening every voucher for food, club memberships, or personal conveyances consumes senior audit associates' valuable hours. "}
                  </p>
                </div>
                {" "}
                <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl">
                  <span className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {"shield"}
                    </span>
                    {" Automated Isolation "}
                  </span>
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-xl">
                      {"table_rows"}
                    </span>
                  </div>
                  {" "}
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs font-semibold">
                    {"Messy Spreadsheets"}
                  </h3>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {" Endless email threads and late-night calls to directors just to discover who spent \u20b93,400 at an ambiguous local enterprise merchant. "}
                  </p>
                </div>
                {" "}
                <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {"chat"}
                    </span>
                    {" WhatsApp Inflow Feeds "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="max-w-3xl mb-space-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-2">
                {" Multi-Client Architecture "}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-xs">
                {" One cockpit to supervise all your client businesses. "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" Toggle between 5, 20, or 100+ client firms with individual tenant isolation, read-only audit controls, and real-time data completeness metrics. "}
              </p>
            </div>
            {" "}
            {" "}
            <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
              {" "}
              <div className="bg-surface-container p-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-2 bg-surface-container-lowest px-space-sm py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-base">
                      {"domain"}
                    </span>
                    {" "}
                    <span className="font-label-md text-label-md text-primary font-semibold">
                      {"Deshmukh & Co. CA Partner Hub"}
                    </span>
                  </div>
                  {" "}
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                    {" 24 Active Firm Tenancies "}
                  </span>
                </div>
                {" "}
                {" "}
                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-sm">
                      {"search"}
                    </span>
                    {" "}
                    <input className="h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none w-48 sm:w-64 shadow-sm" placeholder="Search clients, GSTIN..." readOnly type="text" defaultValue="Filter: All Clients (Active)" />
                  </div>
                  {" "}
                  <div className="bg-surface-container-lowest h-9 px-3 rounded-lg flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm shadow-sm">
                    <span className="material-symbols-outlined text-sm text-outline">
                      {"calendar_today"}
                    </span>
                    {" "}
                    <span>
                      {"Q3 FY 2025-26"}
                    </span>
                  </div>
                </div>
              </div>
              {" "}
              {" "}
              <div className="grid grid-cols-2 md:grid-cols-4 p-space-md gap-space-md bg-surface-container-low">
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    {"Total Client Ledgers"}
                  </span>
                  {" "}
                  <span className="font-headline-md text-headline-md text-primary font-bold">
                    {"24 Active"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-secondary block mt-0.5">
                    {"100% cloud synced"}
                  </span>
                </div>
                {" "}
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    {"Q3 Reviewed Inflow"}
                  </span>
                  {" "}
                  <span className="font-headline-md text-headline-md text-primary font-bold">
                    {"\u20b918,42,850"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                    {"1,248 vouchers tagged"}
                  </span>
                </div>
                {" "}
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    {"Eligible ITC Recovered"}
                  </span>
                  {" "}
                  <span className="font-headline-md text-headline-md text-secondary font-bold">
                    {"\u20b92,84,310"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-secondary block mt-0.5">
                    {"GSTR-2B reconciled"}
                  </span>
                </div>
                {" "}
                <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                    {"Sec 17(5) Flagged"}
                  </span>
                  {" "}
                  <span className="font-headline-md text-headline-md text-error font-bold">
                    {"\u20b938,200"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                    {"Isolated from claim"}
                  </span>
                </div>
              </div>
              {" "}
              {" "}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      <th className="py-space-sm px-space-md">
                        {"Client Legal Name & GSTIN"}
                      </th>
                      <th className="py-space-sm px-space-md">
                        {"Pending Review"}
                      </th>
                      <th className="py-space-sm px-space-md">
                        {"Data Completeness"}
                      </th>
                      <th className="py-space-sm px-space-md">
                        {"Last Export Timestamp"}
                      </th>
                      <th className="py-space-sm px-space-md text-right">
                        {"Audit & Export Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-md px-space-md">
                        <div className="font-headline-sm text-headline-sm text-primary font-semibold">
                          {"Shinde Agro Traders"}
                        </div>
                        {" "}
                        <div className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {"GSTIN: 27AABCS1284K1ZD"}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {" 42 Unreviewed "}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div className="bg-secondary h-full rounded-full" style={{"width": "96%"}}></div>
                          </div>
                          {" "}
                          <span className="font-label-sm text-label-sm text-secondary font-semibold">
                            {"96% High"}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md text-on-surface-variant font-body-sm text-body-sm">
                        {" Yesterday, 5:20 PM "}
                      </td>
                      <td className="py-space-md px-space-md text-right space-x-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-sm">
                            {"visibility"}
                          </span>
                          {" Open "}
                        </button>
                        {" "}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-sm">
                            {"download"}
                          </span>
                          {" Tally XML "}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-md px-space-md">
                        <div className="font-headline-sm text-headline-sm text-primary font-semibold">
                          {"Kulkarni Electronics LLP"}
                        </div>
                        {" "}
                        <div className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {"GSTIN: 27AABCK8901L1ZT"}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {" 11 Unreviewed "}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div className="bg-secondary h-full rounded-full" style={{"width": "92%"}}></div>
                          </div>
                          {" "}
                          <span className="font-label-sm text-label-sm text-secondary font-semibold">
                            {"92% Good"}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md text-on-surface-variant font-body-sm text-body-sm">
                        {" 3 days ago "}
                      </td>
                      <td className="py-space-md px-space-md text-right space-x-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-sm">
                            {"visibility"}
                          </span>
                          {" Open "}
                        </button>
                        {" "}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-sm">
                            {"download"}
                          </span>
                          {" Tally XML "}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                      <td className="py-space-md px-space-md">
                        <div className="font-headline-sm text-headline-sm text-primary font-semibold">
                          {"BlueDart Fleet Services (Branch #4)"}
                        </div>
                        {" "}
                        <div className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {"GSTIN: 24AAGCB5621M1ZN"}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">
                            {"flag"}
                          </span>
                          {" 3 Audit Flags "}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div className="bg-error h-full rounded-full" style={{"width": "78%"}}></div>
                          </div>
                          {" "}
                          <span className="font-label-sm text-label-sm text-error font-semibold">
                            {"78% Review"}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md text-on-surface-variant font-body-sm text-body-sm">
                        {" Oct 12, 11:45 AM "}
                      </td>
                      <td className="py-space-md px-space-md text-right space-x-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm hover:opacity-90 transition-opacity">
                          <span className="material-symbols-outlined text-sm">
                            {"build"}
                          </span>
                          {" Resolve Flags "}
                        </button>
                        {" "}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-sm">
                            {"download"}
                          </span>
                          {" Tally XML "}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-md px-space-md">
                        <div className="font-headline-sm text-headline-sm text-primary font-semibold">
                          {"Apex Design Studio"}
                        </div>
                        {" "}
                        <div className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {"GSTIN: 27AABCA3319Q1ZP"}
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">
                            {"done_all"}
                          </span>
                          {" 0 Pending "}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div className="bg-secondary h-full rounded-full" style={{"width": "100%"}}></div>
                          </div>
                          {" "}
                          <span className="font-label-sm text-label-sm text-secondary font-semibold">
                            {"100% Ready"}
                          </span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md text-on-surface-variant font-body-sm text-body-sm">
                        {" Today, 10:15 AM "}
                      </td>
                      <td className="py-space-md px-space-md text-right space-x-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-secondary font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-sm">
                            {"check"}
                          </span>
                          {" Audit Ready "}
                        </span>
                        {" "}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-sm">
                            {"output"}
                          </span>
                          {" Zoho Export "}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {" "}
              {" "}
              <div className="p-space-md bg-surface-container flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
                    <span className="material-symbols-outlined text-xl">
                      {"folder_zip"}
                    </span>
                  </div>
                  {" "}
                  <div>
                    <span className="font-headline-sm text-headline-sm text-primary font-semibold block">
                      {"Audit Pack 1-Click Bundle"}
                    </span>
                    {" "}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {"Download original high-res bill scans paired side-by-side with digital timestamp, manager sign-off, and GST tax vouchers."}
                    </span>
                  </div>
                </div>
                {" "}
                <button className="whitespace-nowrap px-space-md py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-on-secondary-container transition-colors shadow-sm">
                  {" Batch Download PDF Archive "}
                </button>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-surface">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="max-w-3xl mx-auto text-center mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-2">
                {" Streamlined Reconciliation "}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-xs">
                {" How HisabLoop transforms your month-end bookkeeping. "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" From paper voucher capture to clean statutory accounting entries in four effortless milestones. "}
              </p>
            </div>
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter relative">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-xl text-headline-xl text-secondary/30 font-bold">
                    {"01"}
                  </span>
                  {" "}
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      {"send_to_mobile"}
                    </span>
                  </div>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"Client Auto-Ingestion"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Employees snap chits directly in WhatsApp. Vouchers flow directly into the respective client entity account without your team intervention. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-xl text-headline-xl text-secondary/30 font-bold">
                    {"02"}
                  </span>
                  {" "}
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">
                      {"auto_fix_high"}
                    </span>
                  </div>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"Automated Tax Segregation"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" OCR verifies the 15-digit supplier GSTIN against master records, extracts taxable base, splits CGST/SGST/IGST, and checks active GST filing status. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-xl text-headline-xl text-secondary/30 font-bold">
                    {"03"}
                  </span>
                  {" "}
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      {"rule"}
                    </span>
                  </div>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"CA Exception Audit"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Your team reviews only flagged items: duplicate receipts, unreadable figures, or potential Section 17(5) blocked credits. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-xl text-headline-xl text-secondary/30 font-bold">
                    {"04"}
                  </span>
                  {" "}
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">
                      {"sync"}
                    </span>
                  </div>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"One-Click Ledger Export"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Generate native Tally Prime XML vouchers or push expenses directly to Zoho Books ledgers with original high-resolution receipt URLs attached. "}
                </p>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="max-w-3xl mb-space-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-2">
                {" Engineered For Compliance "}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-xs">
                {" Key capabilities built specifically for tax professionals. "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" Comprehensive tools designed to protect your audit practice, preserve client Input Tax Credit, and satisfy statutory tax assessment demands. "}
              </p>
            </div>
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"pin"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"GSTIN 15-Digit Checksum & Status"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Validates State Code, PAN segment, entity code, and checksum algorithm before any transaction touches your audit sheet, eliminating invalid vendor records. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"filter_alt"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"ITC Sec 17(5) Classifier"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Proactively isolates blocked tax credits like food & beverages, outdoor catering, health services, and motor vehicle conveyances from regular B2B ITC. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"fingerprint"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"SHA-256 Perceptual Duplicate Hash"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Screens uploaded bills against previous claims across employees using image perceptual hashing. Prevents accidental double reimbursement and duplicate ITC claims. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"integration_instructions"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"Native Tally Prime & Zoho Ledgers"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Matches standard Indian Chart of Accounts: Pre-configures Expense Heads, Sundry Creditors, CGST, SGST, and IGST tax ledgers for zero manual remapping. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"inventory_2"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"8-Year Digital Receipt Archive"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Satisfies Section 44AB and Income Tax Act retention mandates. Securely store immutable, timestamped high-resolution bill scans for statutory inspection. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-space-md">
                  <span className="material-symbols-outlined">
                    {"quickreply"}
                  </span>
                </div>
                {" "}
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                  {"Client In-App Audit Queries"}
                </h3>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Tag questionable vouchers with a query flag that alerts the client business owner via WhatsApp without exposing your audit team's personal numbers. "}
                </p>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-surface" id="partner-form">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              {" "}
              <div className="lg:col-span-5 flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-2">
                  {" CA Partner Programme "}
                </span>
                {" "}
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-md">
                  {" Equip your firm with modern expense tooling. "}
                </h2>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
                  {" Empower your practice with multi-client expense automation, instant Tally exports, and zero receipt chasing. Join 300+ practicing Chartered Accountants across India. "}
                </p>
                {" "}
                <div className="space-y-space-md mb-space-xl">
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                      {"check_circle"}
                    </span>
                    {" "}
                    <div>
                      <span className="font-label-md text-label-md text-primary font-semibold block">
                        {"Complimentary Read-Only Portal Seats"}
                      </span>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Your audit staff gets free access to client workspaces when your client is on a Growth Plan."}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                      {"check_circle"}
                    </span>
                    {" "}
                    <div>
                      <span className="font-label-md text-label-md text-primary font-semibold block">
                        {"Dedicated Partner Onboarding"}
                      </span>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"We assist in setting up WhatsApp receipt submission bots for your MSME clients."}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                      {"check_circle"}
                    </span>
                    {" "}
                    <div>
                      <span className="font-label-md text-label-md text-primary font-semibold block">
                        {"Early Access to Statutory Features"}
                      </span>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Be the first to utilize automated GSTR-2B discrepancy alerts and e-Invoice cross-checks."}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-lg mt-0.5">
                      {"check_circle"}
                    </span>
                    {" "}
                    <div>
                      <span className="font-label-md text-label-md text-primary font-semibold block">
                        {"Priority WhatsApp & Phone Support Desk"}
                      </span>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Direct access to technical accounting support for ledger mappings and API queries."}
                      </span>
                    </div>
                  </div>
                </div>
                {" "}
                <div className="p-space-md rounded-xl bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-normal block">
                    <strong className="text-primary font-semibold">
                      {"Statutory Disclaimer:"}
                    </strong>
                    {" HisabLoop provides automated bookkeeping and receipt ingestion software. We do not provide chartered accountancy, legal, tax assessment, or advisory services. "}
                  </span>
                </div>
              </div>
              {" "}
              {" "}
              <div className="lg:col-span-7">
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-md">
                  <div className="mb-space-lg">
                    <h3 className="font-headline-md text-headline-md text-primary font-bold">
                      {"Register Your Practice / Firm"}
                    </h3>
                    {" "}
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {"Join forward-thinking CAs across India. Free setup."}
                    </p>
                  </div>
                  {" "}
                  <ContactForm variant="partner" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="py-space-2xl bg-primary-container text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary"></div>
          </div>
          {" "}
          <div className="relative max-w-7xl mx-auto px-margin text-center">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-surface/10 flex items-center justify-center text-secondary-container mb-space-md">
                <span className="material-symbols-outlined text-2xl">
                  {"account_balance"}
                </span>
              </div>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-on-primary font-bold mb-space-sm text-center">
                {" Give your clients a 10x better receipt experience."}
                <br />
                {" Give your team audit peace of mind. "}
              </h2>
              {" "}
              <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl text-center mb-space-xl leading-relaxed">
                {" Start simplifying client books today. Book a 1-on-1 walkthrough tailored to your practice size and accounting stack. "}
              </p>
              {" "}
              <div className="flex flex-col sm:flex-row items-center gap-space-md justify-center w-full max-w-md">
                <a className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:bg-secondary hover:text-on-secondary shadow-sm transition-all duration-200 font-semibold" href="#partner-form">
                  <span className="material-symbols-outlined text-base mr-2">
                    {"calendar_month"}
                  </span>
                  {" Book a Practice Walkthrough "}
                </a>
                {" "}
                <a className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-surface/10 text-on-primary hover:bg-surface/20 font-label-lg text-label-lg transition-colors" href="#partner-form">
                  <span className="material-symbols-outlined text-base mr-2">
                    {"play_circle"}
                  </span>
                  {" Explore Live CA Demo "}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
