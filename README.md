# BillCycle — Billing Cycle Management SaaS

> **Tagline:** Billing and Revenue Operations for B2B Logistics  
> **Target Persona:** Finance Operations Manager & Billing Operations Leads  

---

## 1. Product Problem & Vision

In enterprise logistics operations, freight movements, warehouse handling, and cold-chain dispatches occur continuously throughout the calendar month. Finance operations teams face significant challenges in:
- **Consolidating deliveries into customer contract periods:** Shipments must be gathered into specific recurring cycle windows (Weekly, Monthly, Quarterly) anchored to customer timezones (e.g., IST `Asia/Kolkata` and SGT `Asia/Singapore`).
- **Audit and reconciliation before invoice locking:** Operations managers must inspect line-item eligibility, exclude disputed or unverified consignments, and attach contractual adjustments (such as diesel index fuel rebates, demurrage waivers, or priority transit charges).
- **Deterministic tax computation:** Computing applicable taxes across domestic intra-state supply (CGST 9% + SGST 9% in Karnataka), domestic inter-state supply (IGST 18%), and international cross-border hubs (Singapore GST 9%).
- **Immutable invoice lifecycle:** Ensuring closed cycles lock deliveries against modification, generating unique sequential tax invoices without duplication, recording partial remittances, and tracking outstanding receivables.

**BillCycle** provides a standalone, auditable, high-performance web application purpose-built for finance teams to manage the complete lifecycle from shipment consolidation to cycle closure, invoice generation, and payment realization.

---

## 2. Core Features

### A. Overview Dashboard
- **Executive Financial KPIs:** Real-time visibility into Total Billable Revenue, Unbilled Volume, Outstanding Receivables, Generated Invoices count, and Billing Cycle Completion percentage.
- **Revenue vs. Collections Chart:** Trajectory bar chart comparing monthly billed volume against collected cash remittances.
- **Action Items & Attention Queue:** Proactive surfacing of cycles ready for sign-off review, closed cycles pending invoice generation, and past-due accounts.
- **Audit Activity Log:** Chronological activity feed logging cycle closures, invoice generations, adjustment additions, and payments.

### B. Billing Cycles Workspace
- **Multi-parameter Filtering:** Search by customer name, client code, or cycle ID; filter by status (`Draft`, `In Review`, `Ready for Review`, `Closed`, `Invoiced`) and frequency (`Weekly`, `Monthly`, `Quarterly`).
- **Data Table & Responsive Card Views:** Full tabular grid with sortable amounts, date ranges, and item counters, with automated adaptive card views for tablet and mobile viewports.
- **Timezone Indicators:** Shows customer-local dates with explicit timezone offsets (`IST UTC+05:30`, `SGT UTC+08:00`).

### C. Billing Cycle Detail (Primary Workflow)
- **Customer & Contract Strip:** Customer GSTIN/UEN, billing address, jurisdiction, payment terms, and credit limits.
- **Billable Shipments Table:** Itemized freight orders displaying waybill reference, service type, vehicle specifications, origin/destination route, delivery timestamp, base amount, and fuel surcharges.
- **Item Inclusion/Exclusion Control:** Live toggle allowing finance operators to exclude deliveries prior to cycle locking.
- **Adjustments & Discrepancies Panel:** Add operational adjustments with credit rebates (deductions) or ancillary surcharges (additions), including SLA clause documentation.
- **Financial Breakdown & Tax Engine:** Dynamic computation of shipments subtotal, net adjustments, taxable base, deterministic GST/tax lines, and grand total in INR (₹).
- **Audit-Safe Cycle Closure Modal:** Confirmation dialog warning operators of immutability before locking shipment items.
- **One-Click Invoice Issuance:** Generates the legal tax invoice upon closure and links to the invoice document.

### D. Invoice Preview & Collections
- **Print-Ready Tax Invoice:** Formatted B2B tax invoice with seller credentials (PAN, GSTIN, Bank details, SWIFT), customer details, place of supply, SAC 9965 classification, and tax breakdown.
- **Browser Print Formatting:** Tailored `@media print` layout removing navigation elements and margins for clean PDF printing.
- **Payment Remittance Modal:** Record partial and full customer remittances (RTGS, NEFT, Telegraphic Wire, Corporate Card) with bank reference tracking.
- **Dynamic Payment Status:** Automatically transitions between `ISSUED` (unpaid), `PARTIALLY_PAID`, `PAID`, and `OVERDUE` based on remaining balance and due dates.
- **JSON Export:** Download full structured invoice object for ERP/audit ingestion.

### E. Customer Management
- List and modal inspector for enterprise accounts, detailing billing configurations, timezones, tax IDs, credit limits, and contact points.

---

## 3. Business Logic & Tax Assumptions

1. **Seller Profile:**
   - Legal Entity: *BillCycle Logistics Private Limited*
   - Registered State: **Karnataka (KA)** (GSTIN: `29AABCL9988K1Z5`)
2. **Tax Jurisdictions:**
   - **India Intra-State (Karnataka buyer):** Split into Central GST (CGST 9%) and State GST (SGST 9%) = 18% total.
   - **India Inter-State (Non-Karnataka buyer, e.g. Maharashtra, Tamil Nadu, Delhi):** Integrated GST (IGST 18%).
   - **Singapore Cross-Border Supply:** Singapore Goods and Services Tax (GST 9%).
3. **Item Eligibility & Cycle Immutability:**
   - Only shipments with status `ELIGIBLE` and `isIncluded === true` contribute to taxable base.
   - Closing a cycle locks its billable shipments and exclusions permanently.
   - Once a cycle is invoiced, it holds an immutable reference to the invoice ID and prevents duplicate issuance.
4. **Timezone Date Boundaries:**
   - Cycle start and end dates are evaluated within the customer's local timezone. Weekly cycles anchor to Monday 00:00; monthly cycles anchor to the 1st of the calendar month; quarterly cycles anchor to Q1 (Jan 1), Q2 (Apr 1), Q3 (Jul 1), and Q4 (Oct 1).

---

## 4. Architecture & Directory Structure

Organized strictly by feature modules with decoupled service and utility layers:

```
src/
├── app/
│   ├── AppLayout.jsx           # Application shell (Header, Sidebar, Mobile Drawer)
│   └── router.jsx              # Client-side React Router configuration
├── components/
│   ├── layout/
│   │   ├── Header.jsx          # Header with simulation controls & demo data reset
│   │   ├── Sidebar.jsx         # Collapsible desktop sidebar navigation
│   │   └── MobileNav.jsx       # Mobile slide-out navigation drawer
│   ├── shared/
│   │   ├── ConfirmDialog.jsx   # Accessible confirmation modal
│   │   ├── EmptyState.jsx      # Empty state with actionable button
│   │   ├── ErrorState.jsx      # Retryable error state with diagnostic message
│   │   ├── MetricCard.jsx      # KPI card with loading skeleton
│   │   └── StatusBadge.jsx     # Semantic status badges with icons
│   └── ui/
│       ├── Badge.jsx, Button.jsx, Card.jsx, Input.jsx, Modal.jsx, Select.jsx, Skeleton.jsx
├── data/
│   └── initialData.js          # Pre-seeded customer, cycle, shipment, invoice mock data
├── features/
│   ├── billing-cycles/
│   │   ├── CycleDetailPage.jsx # Primary workflow: item review, adjustments, closure
│   │   ├── CyclesPage.jsx      # Data table workspace with search & filters
│   │   ├── components/         # Table, FilterBar, ShipmentItemsTable, AdjustmentModal, etc.
│   │   └── utils/
│   │       └── cycleCalculations.js # Pure calculation engine & closure validators
│   ├── customers/
│   │   ├── CustomersPage.jsx   # Client accounts directory
│   │   └── components/CustomerModal.jsx
│   ├── invoices/
│   │   ├── InvoiceDetailPage.jsx # Invoice preview, print action, payment modal
│   │   ├── InvoicesPage.jsx      # Invoices list with status filtering
│   │   └── components/         # InvoiceDocument, RecordPaymentModal, InvoiceTable
│   └── overview/
│       ├── OverviewPage.jsx    # Executive dashboard
│       └── components/         # RevenueChart, AttentionList, RecentActivityFeed
├── services/
│   ├── mockApi.js              # Simulated asynchronous API layer with latency & error simulation
│   └── storage.js              # LocalStorage persistence & factory reset mechanism
├── utils/
│   ├── cn.js                   # Class merging (clsx + tailwind-merge)
│   ├── currencyUtils.js        # Currency formatting in INR (₹) and compact denominations
│   ├── dateUtils.js            # Date formatting, due dates, and cycle boundaries
│   └── taxCalculations.js      # Deterministic GST tax engine
└── test/
    ├── billingWorkflow.test.jsx # Complete end-to-end workflow test
    ├── CycleDetailPage.test.jsx # UI component interaction test
    ├── cycleCalculations.test.js # Financial calculation unit tests
    ├── dateUtils.test.js        # Date boundary & due date calculation tests
    ├── setup.js                 # Testing setup with @testing-library/jest-dom
    └── taxCalculations.test.js  # Tax calculation tests
```

---

## 5. Technology Stack & Selection Rationale

- **React 19 & Vite 8:** Blazing-fast development server, instantaneous HMR, modern ES module architecture, and optimal production bundling.
- **Tailwind CSS v4:** Modern, utility-first CSS engine for clean, maintainable, and responsive layouts without bloated CSS files.
- **React Router 7 (`react-router-dom`):** Declarative, client-side routing with clean URL synchronization for all dashboard routes.
- **Recharts 3:** Composable SVG-based chart library providing high-performance, responsive financial charts.
- **Lucide React:** Lightweight, accessible SVG icon set with consistent visual semantics.
- **date-fns 4:** Pure, functional, tree-shakeable date manipulation without mutating state.
- **Vitest & React Testing Library:** Fast, native Vite test runner with jsdom for unit and component interaction testing.

---

## 6. State Management & Mock Data Strategy

- **Separate Mock Service Layer (`mockApi.js`):** UI components never mutate mock data directly. All operations go through asynchronous methods (`getBillingCycles`, `closeBillingCycle`, `recordInvoicePayment`) simulating realistic network latency (150–350ms).
- **LocalStorage Persistence (`storage.js`):** All actions (adding an adjustment, excluding a waybill, closing a cycle, generating an invoice, recording a payment) persist in the browser's `localStorage`. Page refreshes preserve state.
- **Deterministic Factory Reset:** The top navigation bar includes a **"Reset Demo"** button that restores the mock state back to the original baseline at any time.
- **Deterministic Error Simulation:** A **"Simulate Error"** toggle in the header forces the API layer to reject requests, allowing evaluators to verify retryable error states and fallback UI.

---

## 7. Setup & Testing Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# Clone or navigate into the workspace
cd cyclepay

# Install dependencies (already completed)
npm install
```

### Running Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Running Tests
Execute the comprehensive test suite (16 tests across 5 test suites):
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Running Lint Checks
```bash
npm run lint
```

---

## 8. Definition of Done Verification

| Done Criterion | BillCycle Implementation |
|---|---|
| 1. Open billing dashboard | Executive overview displays total revenue, unbilled amount, invoices generated, outstanding balance, and chart. |
| 2. Browse billing cycles | Dedicated data table at `/cycles` listing all cycles with period, item count, amounts, and statuses. |
| 3. Search and filter cycles | Instant text search, status dropdown (In Review, Closed, etc.), frequency filter (Weekly, Monthly, Quarterly), and sorting. |
| 4. Open customer billing cycle | Deep-linked detail page at `/cycles/:cycleId` with customer metadata and cycle status. |
| 5. Inspect billable shipments | Itemized waybill table showing vehicle type, route, delivery dates, base rate, and fuel surcharges. |
| 6. Understand financial breakdown | Side-by-side summary detailing subtotal, adjustments, taxable value, CGST/SGST/IGST breakdown, and grand total. |
| 7. Add or modify eligible adjustment | Interactive modal to add credit rebates or ancillary charges with reason documentation. |
| 8. Close the billing cycle | Modal dialog with audit warning; locking the cycle from further shipment modification. |
| 9. Generate an invoice | Available on closed cycles; generates unique sequential invoice number (e.g., `LF-INV-2026-0042`). |
| 10. View the generated invoice | Direct navigation to `/invoices/:invoiceId` with print-ready tax invoice layout. |
| 11. Record a partial payment | Remittance dialog allowing custom amount (up to remaining balance) and bank reference. |
| 12. Updated outstanding balance | Dynamic calculation updating remaining balance and status (`ISSUED` → `PARTIALLY_PAID` → `PAID`). |

---

## 9. Architectural Tradeoffs & Future Enhancements

- **Frontend State vs. Real Backend:** Designed with a mock service layer and `localStorage` persistence as required by the assignment guidelines. In an enterprise production deployment, this service layer seamlessly swaps with real REST/GraphQL APIs and server-side JWT authentication.
- **Client-Side Currency Handling:** Implemented with safe decimal rounding (`round2`) and `Intl.NumberFormat('en-IN')`. In enterprise multi-currency setups, libraries like `dinero.js` or `decimal.js` can be introduced for sub-cent currency exchange precision.
- **Future Enhancements:**
  - Automated PDF file download using `@react-pdf/renderer` in addition to browser print.
  - Multi-currency billing cycle settlement (e.g. USD, SGD, INR dual-currency invoicing).
  - Bulk cycle closing with batch approval workflows.
  - Automated webhook notifications on invoice dispatch.
