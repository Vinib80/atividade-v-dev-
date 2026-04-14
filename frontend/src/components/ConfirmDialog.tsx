import { Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ title, message, onConfirm, onClose, loading }: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <Trash2 size={40} color="var(--red)" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>{message}</p>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Excluindo…' : 'Sim, excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
