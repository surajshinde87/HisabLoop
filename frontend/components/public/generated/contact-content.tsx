import { ContactForm } from "@/components/public/contact-form";

export function ContactContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {" "}
        <section className="w-full bg-surface-container-low px-margin py-space-xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-sm max-w-3xl">
              <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm text-secondary">
                  {"calendar_today"}
                </span>
                {" LET'S TALK \u00b7 15-MINUTE DEMO OR CUSTOM SETUP "}
              </div>
              {" "}
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">
                {" Get in touch with the Hisab"}
                <span className="text-secondary">
                  {"Loop"}
                </span>
                {" team. "}
              </h1>
              {" "}
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {" Whether you're an MSME managing 15 field drivers, a high-growth startup tracking burn rate, or a Chartered Accountant modernizing your practice \u2014 we're here to help. "}
              </p>
            </div>
            {" "}
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-xl">
                    {"bolt"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary">
                    {"Under 2-hour response"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {"Guaranteed during IST business hours"}
                  </span>
                </div>
              </div>
              {" "}
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-xl">
                    {"domain"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary">
                    {"Dedicated Onboarding Hubs"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {"Active teams in Bengaluru & Pune"}
                  </span>
                </div>
              </div>
              {" "}
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-xl">
                    {"support_agent"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-primary">
                    {"CA Priority Helpline"}
                  </span>
                  {" "}
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {"Direct WhatsApp & ledger sync phone line"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="w-full px-margin py-space-2xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {" "}
            <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
              {" "}
              {" "}
              <ContactForm variant="demo" />
            </div>
            {" "}
            {" "}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between pb-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-7 h-7 rounded-md bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined text-sm font-bold">
                        {"timer"}
                      </span>
                    </div>
                    {" "}
                    <h2 className="font-headline-sm text-headline-sm text-primary">
                      {"What happens in 15 minutes?"}
                    </h2>
                  </div>
                  {" "}
                  <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                    {"Zero Fluff"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col gap-space-sm">
                  <div className="flex gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">
                      {"1"}
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"Live WhatsApp Receipt Inflow"}
                      </span>
                      {" "}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {"We send a real tea stall or fuel chit via WhatsApp. Watch our 2-second OCR extract line items and verify the 15-digit GSTIN automatically."}
                      </p>
                    </div>
                  </div>
                  {" "}
                  <div className="flex gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">
                      {"2"}
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"Manager Approval Cockpit"}
                      </span>
                      {" "}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {"See how managers approve \u20b9200 to \u20b950,000 requests in 1 tap, with automatic daily per-diem and geo-fence alerts."}
                      </p>
                    </div>
                  </div>
                  {" "}
                  <div className="flex gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">
                      {"3"}
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"1-Click Tally & Zoho Sync"}
                      </span>
                      {" "}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Experience audit-grade ledger export. Show your CA how month-end reconciliations drop from 4 days to 15 minutes."}
                      </p>
                    </div>
                  </div>
                  {" "}
                  <div className="flex gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0 font-label-sm text-label-sm text-primary">
                      {"4"}
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"Complimentary 30-Day Pilot"}
                      </span>
                      {" "}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Immediate WhatsApp bot configuration for up to 20 field employees with zero implementation fees."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  {"Direct Contact Channels"}
                </h2>
                {" "}
                <div className="flex flex-col gap-space-sm">
                  {" "}
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {"mail"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"Sales & Enterprise Demo"}
                      </span>
                      {" "}
                      <a className="font-body-sm text-body-sm text-secondary hover:underline" href="mailto:sales@hisabloop.in">
                        {"sales@hisabloop.in"}
                      </a>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"+91 (80) 4920-8811 (Ext. 1)"}
                      </span>
                    </div>
                  </div>
                  {" "}
                  {" "}
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {"verified"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary">
                        {"Chartered Accountant Desk"}
                      </span>
                      {" "}
                      <a className="font-body-sm text-body-sm text-secondary hover:underline" href="mailto:ca-partners@hisabloop.in">
                        {"ca-partners@hisabloop.in"}
                      </a>
                      {" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {"Direct liaison for tax practitioners & multi-firm portals"}
                      </span>
                    </div>
                  </div>
                  {" "}
                  {" "}
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-secondary-container/30">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shrink-0">
                      <span className="material-symbols-outlined text-lg">
                        {"chat"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-primary flex items-center gap-1.5">
                        {" Instant WhatsApp Hotline "}
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                      </span>
                      {" "}
                      <a className="font-body-sm text-body-sm font-semibold text-secondary hover:underline" href="https://wa.me/919823012042" rel="noopener noreferrer" target="_blank">
                        {"+91 98230 12042"}
                      </a>
                      {" "}
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {"Live product engineers reply in ~5 mins"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    {"Our Tech & Operations Hubs"}
                  </h2>
                  {" "}
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {"Mon \u2013 Sat, 9:30 AM \u2013 7:00 PM IST"}
                  </span>
                </div>
                {" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-md text-label-md text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        {"location_on"}
                      </span>
                      {" Bengaluru (HQ) "}
                    </span>
                    {" "}
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {" Indiranagar 100ft Road,"}
                      <br />
                      {" HAL 2nd Stage, Bengaluru,"}
                      <br />
                      {" Karnataka 560038 "}
                    </p>
                  </div>
                  {" "}
                  <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
                    <span className="font-label-md text-label-md text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        {"location_on"}
                      </span>
                      {" Pune (AI & CA Desk) "}
                    </span>
                    {" "}
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {" Baner Road, High Street Hub,"}
                      <br />
                      {" Baner, Pune,"}
                      <br />
                      {" Maharashtra 411045 "}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="w-full bg-surface-container-low py-space-2xl px-margin">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  {"SEE WHAT HAPPENS ON YOUR PHONE"}
                </span>
                {" "}
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
                  {" Built for field teams who hate manual forms. "}
                </h2>
              </div>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                {" Zero employee app download needed. Over 35,000 receipts processed monthly across retail distributors, logistics fleets, and field sales reps across India. "}
              </p>
            </div>
            {" "}
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">
                    {"photo_camera"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col gap-1">
                  <span className="font-label-lg text-label-lg text-primary">
                    {"1. Snap on WhatsApp"}
                  </span>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {"The field driver snaps a thermal fuel slip or toll receipt. Sends to HisabLoop's WhatsApp Business bot."}
                  </p>
                </div>
                {" "}
                <div className="p- space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">
                    {"Bot reply in 2.3s:"}
                  </span>
                  {" \"\u2705 \u20b91,480 Diesel captured. Indian Oil HPCL GSTIN verified.\" "}
                </div>
              </div>
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {"rule"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col gap-1">
                  <span className="font-label-lg text-label-lg text-primary">
                    {"2. Instant Policy Match"}
                  </span>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {"Automated matching against employee daily fuel cap. Flag duplicates via SHA-256 hash checks immediately."}
                  </p>
                </div>
                {" "}
                <div className="p- space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">
                    {"Compliance Status:"}
                  </span>
                  {" Clean \u00b7 \u20b90 over-limit flag \u00b7 Geotag matched to Maharashtra route. "}
                </div>
              </div>
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">
                    {"sync_saved_locally"}
                  </span>
                </div>
                {" "}
                <div className="flex flex-col gap-1">
                  <span className="font-label-lg text-label-lg text-primary">
                    {"3. Auto Sync to Tally"}
                  </span>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {"CA exports audited voucher batch directly into Tally Prime XML or Zoho Books with matching ITC tax breakup."}
                  </p>
                </div>
                {" "}
                <div className="p- space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">
                    {"CA Portal Ready:"}
                  </span>
                  {" 100% vouchers linked to original raw image for Sec 44AB audits. "}
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="w-full px-margin py-space-2xl">
          <div className="max-w-5xl mx-auto flex flex-col gap-space-xl">
            <div className="text-center flex flex-col items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                {"FREQUENT QUESTIONS"}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary">
                {"Common questions before scheduling a call"}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                {" Everything you need to know about our onboarding speed, software integrations, and auditor permissions. "}
              </p>
            </div>
            {" "}
            <div className="flex flex-col gap-space-sm">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <button className="w-full flex items-center justify-between text-left font-label-lg text-label-lg text-primary gap-space-sm">
                  <span>
                    {"How fast can we roll out HisabLoop to our field employees?"}
                  </span>
                  {" "}
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                    {"expand_more"}
                  </span>
                </button>
                {" "}
                <div className="mt-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Under 15 minutes. Employees do not download any external mobile application; they simply send pictures of bills to your company's dedicated HisabLoop WhatsApp number. Onboarding is as simple as adding their phone number to the admin directory. "}
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <button className="w-full flex items-center justify-between text-left font-label-lg text-label-lg text-primary gap-space-sm">
                  <span>
                    {"Can our external CA get access without paying for an extra seat?"}
                  </span>
                  {" "}
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                    {"expand_more"}
                  </span>
                </button>
                {" "}
                <div className="mt-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Yes. All HisabLoop Growth and Scale plans include complimentary, unrestricted read-only CA and Tax Auditor seats. Your CA gets their own dedicated audit portal to verify GSTINs, inspect high-res bill attachments, and export Tally XML files anytime. "}
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <button className="w-full flex items-center justify-between text-left font-label-lg text-label-lg text-primary gap-space-sm">
                  <span>
                    {"Do you offer custom multi-GSTIN workflows for multi-state branches?"}
                  </span>
                  {" "}
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                    {"expand_more"}
                  </span>
                </button>
                {" "}
                <div className="mt-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Yes. If your company operates across Maharashtra, Karnataka, Delhi, and other states with separate GSTINs, our system automatically routes expenses to the corresponding branch ledger based on the employee's depot assignment or invoice delivery address. "}
                </div>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <button className="w-full flex items-center justify-between text-left font-label-lg text-label-lg text-primary gap-space-sm">
                  <span>
                    {"Is our financial data secure and compliant with Indian tax laws?"}
                  </span>
                  {" "}
                  <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                    {"expand_more"}
                  </span>
                </button>
                {" "}
                <div className="mt-space-sm font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {" Every receipt image and ledger entry is encrypted with 256-bit AES at rest and TLS 1.3 in transit within certified Indian AWS servers (Mumbai region). Data archives are retained for 8 financial years in strict compliance with Section 44AB of the Indian Income Tax Act. "}
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        {" "}
        <section className="w-full px-margin pb-space-2xl">
          <div className="max-w-7xl mx-auto rounded-xl bg-primary-container p-space-xl text-on-primary flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm">
            <div className="flex items-center gap-space-md">
              <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-3xl">
                  {"chat"}
                </span>
              </div>
              {" "}
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-primary">
                  {"Need immediate assistance for tax month-end?"}
                </span>
                {" "}
                <span className="font-body-md text-body-md text-on-primary-container">
                  {"Connect directly with our Bengaluru implementation desk on WhatsApp. We answer in 5 minutes."}
                </span>
              </div>
            </div>
            {" "}
            <div className="flex items-center gap-space-sm w-full md:w-auto">
              <a className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-11 px-space-lg rounded-lg bg-secondary hover:bg-secondary-fixed text-on-secondary hover:text-on-secondary-fixed font-label-lg text-label-lg shadow-sm transition-all duration-200" href="https://wa.me/919823012042" rel="noopener noreferrer" target="_blank">
                <span className="material-symbols-outlined text-xl">
                  {"send"}
                </span>
                {" "}
                <span>
                  {"Chat on WhatsApp Now"}
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>
      {" "}
    </main>
  );
}
