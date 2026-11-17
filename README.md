# BillCycle — B2B Logistics Billing & Revenue Operations

> **Frontend Technical Exercise Submission**  
> **Domain:** Enterprise Logistics & Supply Chain Revenue Operations  
> **Primary Persona:** Finance Operations Lead / Logistics Billing Specialist  
> **Application URL:** `http://localhost:5173`

---

## 1. Problem Statement: Moving from Messy Spreadsheets to Automated Billing Cycles

Most growing logistics, freight, and service companies manage customer billing through **manual Excel spreadsheets or Google Sheets**. 

### The Real-World Spreadsheet Bottleneck:
If a client has a **15-day, weekly, or monthly billing cycle**, the operations and billing team must manually track every single order, dispatch, fuel surcharge, and extra fee throughout those 15 days in an Excel sheet:
- **Manual Data Aggregation:** Every daily delivery or waybill has to be logged, dated, and cross-referenced by hand to make sure it belongs to the correct 15-day window.
- **Human Error & Formula Breakdowns:** Adding late adjustments (like demurrage fees, staging charges, or diesel rebates) often breaks spreadsheet formulas or gets missed when calculating final totals.
- **Double-Billing & Overlapping Cycles:** Without a structured system enforcing billing rules, companies frequently lose track of whether a customer already has an active billing cycle running, risking double-invoicing or missed billables.
- **Tax & Reconciliation Hassles:** Manually calculating state-specific taxes (CGST/SGST vs. IGST) in Excel leads to rounding errors, invoice disputes, and delayed customer payments.
- **Disjointed Payment Tracking:** Once an invoice is sent, tracking who paid, who paid partially, and who is overdue is scattered across emails, bank statements, and separate tabs.

### How BillCycle Solves This:
Instead of maintaining clunky spreadsheets, **BillCycle automates and governs the entire billing cycle**:
1. **Automated Tracking by Cycle:** Every order, shipment, and charge is automatically aggregated into the customer’s active billing cycle (Weekly, 15-Day, Monthly, or Quarterly) based on their agreed billing preference.
2. **One-Click Review & Discrepancy Handling:** Operators can easily inspect line items, toggle contested shipments in/out, and add SLA-backed adjustments with a clear audit trail.
3. **No Overlapping Cycles:** Enforces a strict 1-to-1 active billing preference per customer so cycles never clash or double-bill.
4. **Instant, Deterministic Invoicing:** At the end of the cycle, one click locks the records (preventing accidental tampering), computes exact GST, and generates an official tax invoice.
5. **Real-time Receivables & Aging:** Automatically flags overdue payments and records partial or full bank remittances without needing a separate spreadsheet.

---

## 2. Intended User & Operational Workflow

### Primary Persona: Billing Operations Specialist / Finance Ops Lead
- **Who they are:** The operational finance person who previously spent hours reconciling orders across Excel tabs, chasing dispatch sheets, manually writing invoices, and maintaining receivables logs.
- **What they need:** A simple, reliable workspace where every customer's ongoing cycle accumulates charges automatically, ready for a 2-minute review and sign-off at the end of the billing period.

### Typical User Journey in BillCycle:
1. **Executive Assessment (Overview):** Evaluates Total Billable Revenue (₹34.69 L), Unbilled Volume (₹10.09 L), Outstanding Receivables (₹14.35 L), and acts on the prioritized **Attention Required** queue.
2. **Configuration & Governance (Billing Preferences):** Verifies customer billing cadences (Weekly/Monthly/Quarterly) and ensures each client has exactly one active configuration to eliminate double-billing.
3. **Consolidation Audit (Billing Cycles):** Opens an `OPEN` cycle, reviews freight deliveries, excludes unverified or damaged shipments, and attaches operational adjustments with SLA references.
4. **Audit Sign-off (Cycle Closure):** Executes an immutable close action with warning verification, locking line items against further edits.
5. **Invoice Issuance (Tax Invoice):** Generates a compliant tax invoice with sequential numbering (`BC-INV-2026-XXXX`), statutory SAC code (9965), and GST breakdown.
6. **Receivables & Cash Collection (Invoices):** Records customer remittances (RTGS, NEFT, Wire) against issued or overdue invoices, dynamically updating remaining balances.

---

## 3. Architecture & Data Flow

```
                      ┌───────────────────────────────┐
                      │    React 19 / Vite Frontend   │
                      └──────────────┬────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────┐                           ┌───────────────────────┐
│ Presentation Layer   │                           │ Pure Domain Utilities │
│ ├── AppLayout        │                           │ ├── taxCalculations   │
│ ├── DataTable        │                           │ ├── cycleCalculations │
│ ├── Feature Modules  │                           │ ├── dateUtils         │
│ └── Modals & Drawers │                           │ └── currencyUtils     │
└──────────┬───────────┘                           └───────────▲───────────┘
           │                                                   │
           │ (asynchronous actions & queries)                  │ (pure math)
           ▼                                                   │
┌──────────────────────────────────────────────────────────────┴───────────┐
│ Mock Service Layer (`mockApi.js`)                                        │
│ - Realistic simulated network latency (150–350ms)                        │
│ - Deterministic error simulation switch                                  │
│ - Business validation (1-to-1 billing preferences, cycle closure rules)  │
└──────────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Storage & Persistence Engine (`storage.js`)                              │
│ - LocalStorage versioned keys (`billcycle_*_v1`)                         │
│ - Automatic legacy data migration & status normalization                 │
│ - Deterministic "Reset Demo" factory restore                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy:
- `AppLayout`: Persistent sidebar, mobile responsive navigation drawer, and global utility header (error simulation & demo reset controls).
- `DataTable`: High-performance, accessible, generic table primitive featuring customizable columns, alignment, row click handlers, loading skeletons, and empty states.
- `Features`:
  - `overview/`: Metric cards, Recharts revenue trajectory, attention queue, activity timeline.
  - `billing-cycles/`: Tabbed shell housing **Billing Cycles** (`CyclesPage`) and **Billing Preferences** (`BillingPreferencesPage`), plus the core workflow `CycleDetailPage`.
  - `invoices/`: Tabular receivables list (`InvoicesPage`) and printable GST invoice document (`InvoiceDetailPage`).
  - `customers/`: Account directory and drawer inspector.

---

## 4. Key Technical Decisions

| Technical Decision | Implementation | Rationale |
| :--- | :--- | :--- |
| **Aesthetic & Density** | Linear / Stripe inspired light theme, high-contrast text (`text-slate-900` / `text-slate-700`). | B2B finance specialists read complex numerical data for hours; low-contrast text and playful animations cause eye fatigue and slow down operations. |
| **Reusable `DataTable` Component** | Generic primitive used in Cycles, Preferences, Invoices, and Customers. | Eliminates table boilerplate, ensures identical keyboard navigation, responsive overflow handling, and visual consistency across all views. |
| **1-to-1 Billing Preference Constraint** | Enforced in `mockApi.createBillingPreference` and UI selection. | Prevents duplicate active billing preferences for the same company, eliminating ambiguous cycle boundaries and double-billing. |
| **Canonical State Machine** | Strict 3-state cycle lifecycle: `OPEN` → `CLOSED` → `INVOICED`. | Replaced ambiguous intermediate sub-states (`IN_REVIEW`, `READY_FOR_REVIEW`) with clear, unmistakable statuses. |
| **Single-Row Column Density** | Combined Customer Name with secondary codes (Cycle / Invoice #) using `whitespace-nowrap`. | Prevents awkward multi-line text wrapping on wide desktop monitors and keeps vertical table rhythm compact and scannable. |
| **Currency & Number Uniformity** | `IndianRupee` (`₹`) everywhere via `formatINR`. | Replaced western `$` icon defaults with proper Indian Rupee (`₹`) typography, lakhs/crores formatting, and consistent currency icons across inputs and buttons. |
| **Pure Functional Math Engines** | `taxCalculations.js` and `cycleCalculations.js` separated from React rendering. | Guarantees testability, determinism, and zero floating-point accumulation errors (`round2` decimal precision). |

---

## 5. Technology Stack & Rationale

- **React 19 & Vite 8:** Ultra-fast hot module replacement (HMR), lightweight bundle size, and modern standard ES module architecture.
- **Tailwind CSS v4:** Zero-runtime styling with fine-grained utility classes, enabling rapid design iteration and consistent design tokens.
- **React Router 7 (`react-router-dom`):** Declarative client-side routing, deep linking (`/cycles/:cycleId`, `/invoices/:invoiceId`), and nested tab routing (`/cycles`, `/cycles/preferences`).
- **Recharts 3:** Composable SVG charting optimized for responsive financial bar and trajectory comparisons.
- **Lucide React:** Clean, consistent, tree-shakeable SVG icon system.
- **date-fns 4:** Pure, functional, timezone-aware date operations without mutable global state.
- **Vitest & React Testing Library:** Modern test runner with native Vite integration; executes the full test suite in under 3.5 seconds.

---

## 6. Assumptions & Tradeoffs

1. **Frontend-Only Architecture (No Backend):**
   - *Tradeoff:* No real database or remote server.
   - *Design Choice:* Architected a dedicated asynchronous `MockApi` service layer with simulated network latency and `localStorage` persistence. The entire frontend interacts with Promises, making it a zero-refactor drop-in replacement for a real REST or GraphQL API.
2. **Deterministic GST Tax Rules:**
   - *Assumption:* Seller entity is based in Karnataka (`29AABCL9988K1Z5`). Buyers in Karnataka incur CGST + SGST (9% + 9%); buyers in other Indian states incur IGST (18%); international entities incur local standard tax (Singapore GST 9%).
3. **Browser Print vs. Server PDF Generation:**
   - *Tradeoff:* Used CSS `@media print` styling on `InvoiceDocument.jsx` rather than bundling heavy canvas/PDF libraries.
   - *Benefit:* Instantaneous rendering, pixel-perfect native browser PDF export, and zero client bundle bloat.
4. **Number Precision:**
   - *Assumption:* Handled with standard two-decimal rounding utilities (`round2`). For high-frequency Wall Street fractional cent calculations, a library like `decimal.js` would be preferred.

---

## 7. Setup & Verification Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Installation & Run
```bash
# 1. Navigate to the project directory
cd cyclepay

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Test Suite Execution
Run the comprehensive Vitest suite (16 tests across 5 test suites covering tax math, cycle boundaries, status calculations, UI components, and end-to-end async workflows):
```bash
npm test
```

### Code Quality & Production Build
```bash
# Run ESLint (0 errors, 0 warnings)
npm run lint

# Compile production bundle
npm run build
```

---

## 8. Requirements Coverage Checklist

| Requirement | Implementation in BillCycle |
| :--- | :--- |
| **1. Primary Dashboard** | [OverviewPage.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/features/overview/OverviewPage.jsx): Executive KPIs, Revenue vs Collections chart, Attention queue, and Activity feed. |
| **2. Specialized Domain Data** | Freight transport orders, reefer/cold-chain shipments, ODC cargo, GSTINs, SAC 9965 classification, fuel surcharges, billing preferences. |
| **3. Search & Exploration** | Multi-column text search, status filters, frequency filters, and tabbed grouping (`Billing Cycles` vs `Billing Preferences`). |
| **4. Entity Detail View** | [CycleDetailPage.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/features/billing-cycles/CycleDetailPage.jsx) (line-item audit) and [InvoiceDetailPage.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/features/invoices/InvoiceDetailPage.jsx) (tax invoice document). |
| **5. State-Changing Actions** | Item inclusion toggle, adding/deleting adjustments, closing billing cycles, issuing invoices, creating/editing billing preferences, recording payments. |
| **6. Loading / Empty / Error States** | Shimmer Skeletons ([Skeleton.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/components/ui/Skeleton.jsx)), Empty states with reset triggers ([EmptyState.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/components/shared/EmptyState.jsx)), and retryable error banners ([ErrorState.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/components/shared/ErrorState.jsx)) with header simulation switch. |
| **7. Responsive Behavior** | Adaptive layouts transitioning gracefully from full desktop data tables to card views on mobile/tablet viewports ([DataTable.jsx](file:///Users/nishantmainwal/Developer/sde-practice/cyclepay/src/components/ui/DataTable.jsx)). |
| **8. Accessibility & Usability** | Semantic HTML5, ARIA labels, focus management in modals, WCAG AA contrast compliance (`text-slate-700`/`900`), and keyboard accessibility. |

---

## 9. What to Build or Improve Next with Additional Time

1. **Automated PDF Generation:** Integrate `@react-pdf/renderer` or serverless Puppeteer to allow direct one-click PDF downloads and email dispatch to accounts payable contacts.
2. **Batch Cycle Operations:** Multi-select checkboxes on `CyclesPage` enabling finance controllers to bulk-review and bulk-close 50+ weekly cycles in a single sign-off batch.
3. **Multi-Currency Ledger:** Support for dynamic cross-currency settlements (USD, EUR, SGD, AED) with real-time exchange rate conversion and foreign exchange gain/loss tracking.
4. **Optimistic UI Updates with Rollback:** Upgrade local mutation state to optimistic UI patterns with automatic rollback on network failure.
5. **Role-Based Access Control (RBAC):** Distinct permission levels: Operations Auditor (can view and exclude shipments), Finance Manager (can approve adjustments and close cycles), and CFO (can issue write-offs).

---

## 10. Technical Interview Discussion Guide

When demonstrating this project in the technical interview:
- **Architecture Tour:** Show how `mockApi.js` decouples storage and business validation from UI components, mimicking enterprise backend microservices.
- **Pure Math Walkthrough:** Step into `src/utils/taxCalculations.js` to demonstrate deterministic GST splitting and safe decimal rounding.
- **Workflow Demonstration:**
  1. Go to **Overview** → Click on *Apex Pharmaceuticals* in **Attention Required**.
  2. In **Cycle Detail**, toggle a shipment off and observe the immediate reactive recalculation of taxable base and taxes in the Financial Summary.
  3. Add an operational adjustment (e.g. ₹5,000 demurrage charge).
  4. Click **Close Billing Cycle** → Verify audit confirmation modal.
  5. Click **Generate Tax Invoice** → Automatically routes to the print-ready invoice.
  6. Click **₹ Record Payment** → Record a partial payment (e.g. ₹1,00,000 via RTGS) and watch status dynamically become `Partially Paid` with updated remaining balance.
