import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CycleDetailPage } from '../features/billing-cycles/CycleDetailPage'
import { Storage } from '../services/storage'

describe('CycleDetailPage Component Interaction', () => {
  beforeEach(() => {
    Storage.resetToDefault()
  })

  it('renders cycle details, shipments table, and opens the close confirmation modal', async () => {
    render(
      <MemoryRouter initialEntries={['/cycles/cycle-2026-w20-apx']}>
        <Routes>
          <Route path="/cycles/:cycleId" element={<CycleDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for the cycle details to load from mock API
    await waitFor(() => {
      expect(screen.getByText('CYC-2026-W20-02')).toBeInTheDocument()
      expect(screen.getByText('Apex Pharmaceuticals Logistics')).toBeInTheDocument()
    })

    // Verify financial summary card
    expect(screen.getByText(/Financial Summary/i)).toBeInTheDocument()

    // Find and click the "Close Billing Cycle" button
    const closeBtn = screen.getByRole('button', { name: /Close Billing Cycle/i })
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)

    // Verify confirmation modal opens with audit warning
    await waitFor(() => {
      expect(screen.getByText('Close & Lock Billing Cycle')).toBeInTheDocument()
      expect(screen.getByText(/Audit & Immutability Notice/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Confirm & Lock Cycle/i })).toBeInTheDocument()
    })
  })
})

