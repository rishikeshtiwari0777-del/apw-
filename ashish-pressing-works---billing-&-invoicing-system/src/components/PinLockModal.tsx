import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, X } from 'lucide-react';
import { checkPin, setSecurityPin, isPinProtected } from '../utils/storage';

interface PinLockModalProps {
  isOpen: boolean;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  isUnlocked,
  onUnlockSuccess,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'unlock' | 'settings'>('unlock');

  // New PIN settings states
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSavedFeedback, setPinSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPin(pinInput)) {
      setErrorMsg('');
      setPinInput('');
      onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('PINs do not match');
      return;
    }

    setSecurityPin(newPin);
    setErrorMsg('');
    setPinSavedFeedback(true);
    setTimeout(() => {
      setPinSavedFeedback(false);
      onUnlockSuccess();
    }, 1200);
  };

  const handleRemovePin = () => {
    if (confirm('Disable PIN protection? Anyone using this laptop will be able to see the bills.')) {
      setSecurityPin(null);
      onUnlockSuccess();
    }
  };

  // If user is locked out, prevent closing unless unlocked
  const currentlyProtected = isPinProtected();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 overflow-hidden">
        {/* Header Icon */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
            {isUnlocked ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7 text-amber-600" />}
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {isUnlocked ? 'Private Personal Lock Settings' : 'Ashish Pressing Works Private Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isUnlocked
              ? 'Configure a personal PIN to keep billing records private on this laptop'
              : 'Enter your 4-digit security PIN to access the billing system'}
          </p>
        </div>

        {/* Tab switcher if unlocked */}
        {isUnlocked && (
          <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('settings')}
              className="pb-2 border-b-2 border-blue-600 text-blue-600 flex-1 text-center"
            >
              Configure PIN Lock
            </button>
          </div>
        )}

        {!isUnlocked ? (
          /* UNLOCK FORM */
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                Enter PIN Code
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[1em] text-2xl font-mono py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Billing Workspace</span>
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Personal laptop protection for Ashish Pressing Works
            </div>
          </form>
        ) : (
          /* SETTINGS FORM */
          <form onSubmit={handleSaveNewPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Security PIN (at least 4 digits)
              </label>
              <input
                type="password"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1234"
                className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Security PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
                className="w-full text-center tracking-widest text-lg font-mono py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
                {errorMsg}
              </div>
            )}

            {pinSavedFeedback && (
              <div className="p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg text-center font-bold">
                ✓ PIN updated successfully!
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Set / Update PIN
              </button>

              {currentlyProtected && (
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="w-full py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Disable PIN Lock
                </button>
              )}

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
