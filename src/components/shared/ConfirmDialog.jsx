import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AlertCircle } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary', // primary or danger
  loading = false,
  children,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {description && (
          <div className="flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>{description}</div>
          </div>
        )}

        {children}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

