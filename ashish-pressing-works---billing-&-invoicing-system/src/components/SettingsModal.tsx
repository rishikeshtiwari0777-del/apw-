import React, { useState, useRef } from 'react';
import { CompanyDetails } from '../types/invoice';
import { exportLaptopBackup, importLaptopBackup, DEFAULT_COMPANY_DETAILS } from '../utils/storage';
import { Settings, Save, Download, Upload, RotateCcw, X, Building, Landmark, Phone } from 'lucide-react';

interface SettingsModalProps {
  company: CompanyDetails;
  onSave: (updated: CompanyDetails) => void;
  onDataRestored: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  company,
  onSave,
  onDataRestored,
  onClose,
}) => {
  const [formData, setFormData] = useState<CompanyDetails>({ ...company });
  const [phone1, setPhone1] = useState(company.phones?.[0] || '8208175410');
  const [phone2, setPhone2] = useState(company.phones?.[1] || '9049586464');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyDetails = {
      ...formData,
      phones: [phone1.trim(), phone2.trim()].filter(Boolean),
    };
    onSave(updated);
    onClose();
  };

  const handleResetDefaults = () => {
    if (confirm('Reset company details back to official Ashish Pressing Works defaults?')) {
      setFormData(DEFAULT_COMPANY_DETAILS);
      setPhone1(DEFAULT_COMPANY_DETAILS.phones[0]);
      setPhone2(DEFAULT_COMPANY_DETAILS.phones[1]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importLaptopBackup(content);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} invoices!`);
        onDataRestored();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setImportStatus(`Error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Company & Bank Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Company Details */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Company Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-1.5 font-bold border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Short Logo Text</label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-1.5 font-bold font-mono border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mobile 1</label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mobile 2</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Full Factory Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Specialization Line 1</label>
                <input
                  type="text"
                  value={formData.specialistLine1}
                  onChange={(e) => setFormData({ ...formData, specialistLine1: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Specialization Line 2</label>
                <input
                  type="text"
                  value={formData.specialistLine2}
                  onChange={(e) => setFormData({ ...formData, specialistLine2: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <span>Bank Payment Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 font-bold border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Branch / BHAYCTO</label>
                <input
                  type="text"
                  value={formData.bankDetails.branch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, branch: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">IFS CODE</label>
                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() },
                    })
                  }
                  className="w-full px-3 py-1.5 font-mono font-bold border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Account No.</label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountNo: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 font-mono font-bold border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Backup & Hard Drive Storage */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center">
              <Download className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Laptop Storage Backup & Restore
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Export all your invoices and client database into a secure backup file on your laptop hard drive, or restore from a previously exported backup file.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportLaptopBackup}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center space-x-1.5 text-slate-700 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Laptop Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center space-x-1.5 text-slate-700 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import / Restore Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded">
                {importStatus}
              </div>
            )}
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Bill Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
