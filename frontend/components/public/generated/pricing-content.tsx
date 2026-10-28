import { PricingEstimator } from "@/components/public/pricing-estimator";

export function PricingContent() {
  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {" "}
        <div className="relative w-full overflow-hidden">
          {" "}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary/10 via-surface-container/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
          {" "}
          <div className="absolute top-96 -left-40 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          {" "}
          <div className="absolute top-80 -right-40 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          {" "}
          {" "}
          <section className="max-w-7xl mx-auto px-margin pt-space-xl pb-space-lg">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {" "}
              <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-space-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                {" TRANSPARENT, PREDICTABLE FINTECH PRICING \u00b7 BUILT FOR INDIAN MSMES "}
              </div>
              {" "}
              {" "}
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight mb-space-md">
                {" Choose a plan that fits your team. "}
              </h1>
              {" "}
              {" "}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-space-lg">
                {" Start with the essentials and add automated controls, GST reporting, and custom approval workflows as your business expands. "}
              </p>
              {" "}
              {" "}
              <div className="inline-flex items-center gap-space-sm px-space-lg py-space-xs rounded-xl bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-secondary text-lg">
                  {"verified_user"}
                </span>
                {" "}
                <span>
                  {"Simple per-user monthly pricing. Cancel anytime."}
                </span>
                {" "}
                <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                {" "}
                <span className="text-secondary font-semibold">
                  {"Zero hidden implementation fees"}
                </span>
              </div>
            </div>
          </section>
          {" "}
          {" "}
          <section className="max-w-7xl mx-auto px-margin py-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
              {" "}
              <div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                      {"Starter"}
                    </span>
                    {" "}
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {"Basic Sync"}
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-baseline gap-1 my-space-sm">
                    <span className="font-currency-display text-currency-display text-primary">
                      {"\u20b999"}
                    </span>
                    {" "}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {"/ user / month"}
                    </span>
                  </div>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pb-space-lg">
                    {" Essential expense tracking for small field teams and growing shops. "}
                  </p>
                  {" "}
                  <div className="w-full h-px bg-surface-container my-space-md"></div>
                  {" "}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">
                      {"Included with Starter:"}
                    </span>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"WhatsApp-first receipt capture & chat note logging"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"AI-assisted receipt OCR extraction"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Single-tier manager approval workflow"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Category-level policy controls & daily spend caps"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"CSV & Excel spreadsheet exports for your CA"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Standard email support"}
                      </span>
                    </div>
                  </div>
                </div>
                {" "}
                <div className="pt-space-xl mt-space-lg">
                  <a className="w-full inline-flex items-center justify-center h-11 px-space-lg rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg transition-colors" href="/register">
                    {" Get Started Free "}
                  </a>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-2">
                    {"14-day full feature trial"}
                  </p>
                </div>
              </div>
              {" "}
              {" "}
              <div className="relative flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-xl shadow-primary/5 -mt-2 lg:-mt-4 mb-2 lg:mb-0 transition-transform duration-200">
                {" "}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm tracking-wider shadow-md uppercase">
                    <span className="material-symbols-outlined text-sm">
                      {"auto_awesome"}
                    </span>
                    {" RECOMMENDED FOR GROWING BUSINESSES "}
                  </span>
                </div>
                {" "}
                <div className="pt-space-xs">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-lg text-label-lg text-secondary uppercase tracking-wider font-bold">
                      {"Growth"}
                    </span>
                    {" "}
                    <span className="px-space-sm py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      {"Most Popular"}
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-baseline gap-1 my-space-sm">
                    <span className="font-currency-display text-currency-display text-primary">
                      {"\u20b9149"}
                    </span>
                    {" "}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {"/ user / month"}
                    </span>
                  </div>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pb-space-lg">
                    {" Complete control, multi-tier approvals, and GST intelligence for expanding MSMEs. "}
                  </p>
                  {" "}
                  <div className="w-full h-px bg-surface-container my-space-md"></div>
                  {" "}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide font-semibold">
                      {"Everything in Starter, plus:"}
                    </span>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface font-medium">
                        {"GST-aware tax breakdowns (CGST, SGST, IGST & SAC codes)"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface font-medium">
                        {"Unclaimed Input Tax Credit (ITC) & GSTR-2B readiness report"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Multi-level approval chains (Manager + Finance / Director)"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Granular category limits, per-diem rules & hotel caps"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"SHA-256 duplicate receipt detection & checksum validation"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface font-medium text-secondary">
                        {"Dedicated Chartered Accountant (CA) read-only portal"}
                      </span>
                    </div>
                  </div>
                </div>
                {" "}
                <div className="pt-space-xl mt-space-lg">
                  <a className="w-full inline-flex items-center justify-center h-12 px-space-lg rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all" href="/register">
                    {" Choose Growth "}
                  </a>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-2">
                    {"Free 1 CA seat included"}
                  </p>
                </div>
              </div>
              {" "}
              {" "}
              <div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider">
                      {"Business"}
                    </span>
                    {" "}
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {"Enterprise Scale"}
                    </span>
                  </div>
                  {" "}
                  <div className="flex items-baseline gap-1 my-space-sm">
                    <span className="font-currency-display text-currency-display text-primary">
                      {"\u20b9249"}
                    </span>
                    {" "}
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {"/ user / month"}
                    </span>
                  </div>
                  {" "}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pb-space-lg">
                    {" Advanced governance, direct bank payout batches, and custom accounting integrations. "}
                  </p>
                  {" "}
                  <div className="w-full h-px bg-surface-container my-space-md"></div>
                  {" "}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">
                      {"Everything in Growth, plus:"}
                    </span>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Direct Tally Prime XML & Zoho Books ledger sync"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Pre-formatted corporate bank CMS payment batches (HDFC, ICICI, SBI)"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Automated UPI reimbursement payouts "}
                        <span className="text-secondary text-label-sm font-semibold">
                          {"(Phased Rollout)"}
                        </span>
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Custom department hierarchies & multi-branch entity management"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Immutable audit logs with SHA verification (8-year retention)"}
                      </span>
                    </div>
                    {" "}
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">
                        {"check_circle"}
                      </span>
                      {" "}
                      <span className="font-body-md text-body-md text-on-surface">
                        {"Dedicated onboarding manager & SLA priority support"}
                      </span>
                    </div>
                  </div>
                </div>
                {" "}
                <div className="pt-space-xl mt-space-lg">
                  <a className="w-full inline-flex items-center justify-center h-11 px-space-lg rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg transition-colors" href="/contact">
                    {" Contact Sales "}
                  </a>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-2">
                    {"Custom billing & rollout assistance"}
                  </p>
                </div>
              </div>
            </div>
            {" "}
            {" "}
            <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex items-start sm:items-center gap-space-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-xl shrink-0">
                {"info"}
              </span>
              {" "}
              <p className="font-body-sm text-body-sm leading-relaxed">
                <strong>
                  {"Note:"}
                </strong>
                {" Illustrative planned pricing for Indian entities. All pricing excludes applicable GST (18%). Feature availability and banking payout integrations will be confirmed before public commercial release. "}
              </p>
            </div>
          </section>
          {" "}
          {" "}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
              <PricingEstimator />
            </div>
          </section>
          {" "}
          {" "}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold mb-space-xs">
                {"Comprehensive Matrix"}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                {" Compare plan capabilities in detail "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {" A transparent breakdown of what's included across capture, approvals, compliance, and accounting. "}
              </p>
            </div>
            {" "}
            {" "}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="py-space-md px-space-lg font-label-lg text-label-lg text-primary w-2/5">
                        {"Platform Feature"}
                      </th>
                      <th className="py-space-md px-space-md font-label-lg text-label-lg text-center text-primary w-1/5">
                        {"Starter"}
                        <br />
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                          {"\u20b999/user"}
                        </span>
                      </th>
                      <th className="py-space-md px-space-md font-label-lg text-label-lg text-center text-secondary w-1/5 bg-secondary-container/20">
                        {"Growth"}
                        <br />
                        <span className="font-body-sm text-body-sm text-secondary font-semibold">
                          {"\u20b9149/user"}
                        </span>
                      </th>
                      <th className="py-space-md px-space-md font-label-lg text-label-lg text-center text-primary w-1/5">
                        {"Business"}
                        <br />
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                          {"\u20b9249/user"}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    <tr className="bg-surface-container/40">
                      <td className="py-2.5 px-space-lg font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" colSpan={4}>
                        {" Expense Capture & Inflow "}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"WhatsApp receipt photo snap & AI OCR"}
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Informal text & cash claims (\"Auto fare \u20b9180\")"}
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Multi-page PDF tax invoices"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"Limited (5/mo)"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-secondary font-semibold bg-secondary-container/10">
                        {"Unlimited"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Unlimited"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Perceptual image hashing (duplicate detection)"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="py-2.5 px-space-lg font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" colSpan={4}>
                        {" Approvals & Policy Engine "}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Approval tiers"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"1 Level"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-secondary font-semibold bg-secondary-container/10">
                        {"Up to 3 levels"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Custom conditional matrix"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Category & daily per-diem spending caps"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"Basic fixed limits"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface bg-secondary-container/10">
                        {"Granular by role/city"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"Advanced department rules"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"WhatsApp manager approval notifications"}
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"One-click query threads for missing info"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="py-2.5 px-space-lg font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" colSpan={4}>
                        {" Tax, GST & CA Readiness "}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"GSTIN 15-digit checksum verification"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"Basic syntax check"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-secondary font-semibold bg-secondary-container/10">
                        {"Real-time API check"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Real-time API check"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"ITC eligibility segregation (Eligible vs Blocked Sec 17(5))"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Dedicated CA client portal access"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-secondary font-semibold bg-secondary-container/10">
                        {"Included (1 CA seat)"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Unlimited CA seats"}
                      </td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="py-2.5 px-space-lg font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" colSpan={4}>
                        {" Accounting & Payouts "}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Standard CSV & Excel export"}
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center bg-secondary-container/10">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-md text-center">
                        <span className="material-symbols-outlined text-secondary text-lg">
                          {"check_circle"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Direct Tally Prime & Zoho Books sync"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface bg-secondary-container/10">
                        {"Manual clean export"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"1-Click Direct API/XML"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Bank corporate netbanking NEFT/RTGS batch files"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant bg-secondary-container/10">
                        {"\u2014"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Pre-formatted HDFC/ICICI/SBI"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Batch reimbursement tracking"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"Basic ledger"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface bg-secondary-container/10">
                        {"Full tracking"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Full with audit logs"}
                      </td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="py-2.5 px-space-lg font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" colSpan={4}>
                        {" Security & Governance "}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Role-based permissions"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface">
                        {"Admin + Employee"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface bg-secondary-container/10">
                        {"Admin + Mgr + Emp + CA"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Custom dynamic RBAC"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Immutable audit history log"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"30 days"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface bg-secondary-container/10">
                        {"1 Year"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"8 Years statutory compliance"}
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-lg font-body-md text-body-md text-on-surface">
                        {"Support SLA"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                        {"Standard Email (24h)"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-secondary font-medium bg-secondary-container/10">
                        {"Priority WhatsApp & Email"}
                      </td>
                      <td className="py-space-sm px-space-md text-center font-body-sm text-body-sm text-primary font-semibold">
                        {"Dedicated account manager"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          {" "}
          {" "}
          <section className="max-w-4xl mx-auto px-margin py-space-xl">
            <div className="text-center mb-space-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                {"Frequently Asked Questions"}
              </span>
              {" "}
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
                {" Everything you need to know about pricing "}
              </h2>
              {" "}
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                {" No hidden fees, no long contracts, and no per-receipt surprise charges. "}
              </p>
            </div>
            {" "}
            <div className="flex flex-col gap-space-md">
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {"How does per-user pricing work?"}
                  </h3>
                  {" "}
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {"help_outline"}
                  </span>
                </div>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">
                  {" Only employees who submit expense claims, approve vouchers, or manage corporate finances require an active seat. On the Growth and Business plans, your external or in-house Chartered Accountant receives complimentary read-only access to verify tax vouchers and download ledger sheets. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {"Do all employees in my company need an account?"}
                  </h3>
                  {" "}
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {"help_outline"}
                  </span>
                </div>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">
                  {" No, you only pay for active team members who submit or review expenses in that billing cycle. If an employee does not incur or approve business expenses in a given month, you can set their seat to inactive so it won\u2019t be counted. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {"Can I upgrade or downgrade plans as my team changes?"}
                  </h3>
                  {" "}
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {"help_outline"}
                  </span>
                </div>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">
                  {" Yes, adjust user seats or switch between Starter, Growth, and Business tiers at any point. Upgrades take effect immediately with pro-rated billing, while downgrades take effect at the beginning of your next monthly billing cycle with zero cancellation fees. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {"Are accounting software integrations (Tally & Zoho) available on all plans?"}
                  </h3>
                  {" "}
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {"help_outline"}
                  </span>
                </div>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">
                  {" Direct one-click sync via XML and API feeds is included in the Business plan. Starter and Growth plans feature pre-formatted Excel/CSV ledger exports tailored to standard Tally Prime voucher formats and Zoho Books expense templates. "}
                </p>
              </div>
              {" "}
              {" "}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {"Is there a setup fee or hidden implementation cost?"}
                  </h3>
                  {" "}
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {"help_outline"}
                  </span>
                </div>
                {" "}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed">
                  {" There are absolutely zero setup fees. Connecting your team to the HisabLoop WhatsApp bot takes less than 15 minutes. We also provide ready-made team training videos and sample expense policies to get you started immediately. "}
                </p>
              </div>
            </div>
          </section>
          {" "}
          {" "}
          <section className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="bg-primary-container rounded-xl p-space-xl md:p-space-2xl text-on-primary relative overflow-hidden shadow-xl">
              {" "}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
              {" "}
              <div className="absolute -left-10 -top-10 w-60 h-60 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>
              {" "}
              <div className="relative z-10 max-w-3xl flex flex-col items-start gap-space-md">
                <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-lowest/10 text-secondary-container font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-sm">
                    {"rocket_launch"}
                  </span>
                  {" GET UP AND RUNNING IN 15 MINUTES "}
                </div>
                {" "}
                <h2 className="font-headline-xl text-headline-xl text-on-primary tracking-tight">
                  {" Start simplifying your business expenses today. "}
                </h2>
                {" "}
                <p className="font-body-lg text-body-lg text-on-primary-container leading-relaxed max-w-2xl">
                  {" Join hundreds of forward-thinking Indian businesses and their CAs. Eliminate friction, prevent duplicate claims, and keep ledgers audit-ready. No credit card required. "}
                </p>
                {" "}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md pt-space-md w-full sm:w-auto">
                  <a className="inline-flex items-center justify-center h-12 px-space-xl rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg shadow-md transition-all" href="/register">
                    {" Get Started Free "}
                  </a>
                  {" "}
                  <a className="inline-flex items-center justify-center h-12 px-space-lg rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-lg text-label-lg transition-colors" href="/contact">
                    <span className="material-symbols-outlined mr-2 text-lg">
                      {"calendar_month"}
                    </span>
                    {" Book a 15-Minute Walkthrough "}
                  </a>
                </div>
                {" "}
                <div className="pt-space-xs flex items-center gap-space-md text-on-primary-container font-body-sm text-body-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">
                      {"check"}
                    </span>
                    {" 14-day free trial"}
                  </span>
                  {" "}
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">
                      {"check"}
                    </span>
                    {" WhatsApp integration ready"}
                  </span>
                  {" "}
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">
                      {"check"}
                    </span>
                    {" Zero setup fee"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      {" "}
      {" "}
    </main>
  );
}
