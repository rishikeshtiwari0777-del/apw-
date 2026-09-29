import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { Search, FileText, Trash2, Copy, Download, X, Calendar, User, DollarSign } from 'lucide-react';
import { formatIndianCurrency } from '../utils/numberToWords';

interface InvoiceHistoryModalProps {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onClose: () => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  invoices,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceNo?.toLowerCase().includes(term) ||
      inv.clientName?.toLowerCase().includes(term) ||
      inv.challanNo?.toLowerCase().includes(term) ||
      inv.poNo?.toLowerCase().includes(term) ||
      inv.date?.includes(term)
    );
  });

  const totalRevenue = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              Bill Records & History ({invoices.length})
            </h2>
            <p className="text-xs text-slate-500">
              Personal archive saved directly on your laptop
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-right">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Total Billed</span>
              <span className="font-mono font-bold text-xs text-blue-900">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bills by Invoice #, Client Name, Challan #, PO #, Date..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {searchTerm ? 'No bills found matching your search.' : 'No invoices saved yet.'}
            </div>
          ) : (
            filtered.map((inv) => {
              const formatted = formatIndianCurrency(inv.grandTotal);
              return (
                <div
                  key={inv.id}
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-lg p-3 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-50 text-blue-700 p-2 rounded-lg font-mono font-bold text-xs mt-0.5">
                      {inv.invoiceNo || 'DRAFT'}
                    </div>

                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                        <span>{inv.clientName || 'Unnamed Client'}</span>
                        {inv.clientGstin && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                            GST: {inv.clientGstin}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                          {inv.date || 'No Date'}
                        </span>
                        {inv.challanNo && (
                          <span>Challan: <strong className="text-slate-700">{inv.challanNo}</strong></span>
                        )}
                        {inv.poNo && (
                          <span>PO: <strong className="text-slate-700">{inv.poNo}</strong></span>
                        )}
                        <span className="text-slate-600">
                          {inv.items?.length || 0} item{(inv.items?.length || 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-2">
                      <div className="text-xs text-slate-600">Amount</div>
                      <div className="font-mono font-bold text-sm text-[#0066aa]">
                        {formatted.formatted}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          onSelectInvoice(inv);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Edit / View
                      </button>

                      <button
                        onClick={() => {
                          onDuplicateInvoice(inv);
                          onClose();
                        }}
                        title="Duplicate as new bill"
                        className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNo}?`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        title="Delete bill"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Click any bill to load into laptop preview & editor</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
