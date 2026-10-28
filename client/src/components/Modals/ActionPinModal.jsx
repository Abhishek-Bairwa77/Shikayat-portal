import { useState, useEffect } from 'react';
import './ActionPinModal.css';

const ActionPinModal = ({ isOpen, onClose, onSubmit, title = 'Enter Action PIN', actionLabel = 'Confirm' }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setLoading(false);
      // Focus first input
      setTimeout(() => {
        document.getElementById('pin-0')?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newPin = ['', '', '', ''];
    pasted.split('').forEach((char, i) => { newPin[i] = char; });
    setPin(newPin);
    if (pasted.length === 4) {
      document.getElementById('pin-3')?.focus();
    }
  };

  const handleKeypadClick = (num) => {
    const emptyIndex = pin.findIndex(p => p === '');
    if (emptyIndex !== -1) {
      handleChange(emptyIndex, String(num));
    }
  };

  const handleDelete = () => {
    const lastFilledIndex = pin.map(p => p !== '').lastIndexOf(true);
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
      document.getElementById(`pin-${lastFilledIndex}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setError('');
    const result = await onSubmit(pinString);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid PIN');
      setPin(['', '', '', '']);
      document.getElementById('pin-0')?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pin-modal-overlay" onClick={onClose}>
      <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="pin-modal-header">
          <div className="pin-icon">🔐</div>
          <h2>{title}</h2>
          <p>Your 4-digit Action PIN protects this operation</p>
        </div>

        <div className="pin-inputs" onPaste={handlePaste}>
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              className="pin-input"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              inputMode="numeric"
              autoComplete="off"
            />
          ))}
        </div>

        {error && <div className="pin-error">{error}</div>}

        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} className="keypad-btn" onClick={() => handleKeypadClick(num)}>
              {num}
            </button>
          ))}
          <button className="keypad-btn keypad-delete" onClick={handleDelete}>⌫</button>
          <button className="keypad-btn" onClick={() => handleKeypadClick(0)}>0</button>
          <button
            className="keypad-btn keypad-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : '✓'}
          </button>
        </div>

        <button
          className="pin-submit-btn"
          onClick={handleSubmit}
          disabled={loading || pin.join('').length !== 4}
        >
          {loading ? 'Verifying...' : actionLabel}
        </button>
      </div>
    </div>
  );
};

export default ActionPinModal;