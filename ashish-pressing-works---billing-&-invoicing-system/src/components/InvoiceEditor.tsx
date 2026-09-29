import React, { useState } from 'react';
import { Invoice, InvoiceItem, TaxType, ClientProfile } from '../types/invoice';
import { Plus, Trash2, UserCheck, Sparkles, Calculator } from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  savedClients: ClientProfile[];
  onQuickSaveClient: (client: ClientProfile) => void;
}

const COMMON_PARTICULARS = [
  'Job work of Dish Ends Knuckling as per standard codes',
  'Kone Knuckling & Pressing in MS Material',
  'Spinning Machine Flange Pressing in SS 304',
  'Dish Ends 2:1 Ellipsoidal Knuckling & Crown Pressing',
  'Pressing & Knuckling Job Work in Aluminium',
  'Torispherical Dish Ends Pressing in MS Plate',
  'Bending & Knuckling Work in Copper Plate',
  'Dish Ends Edge Preparation & Knuckling Charges',
];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  savedClients,
  onQuickSaveClient,
}) => {
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Recalculate totals
  const recalculate = (
    items: InvoiceItem[],
    taxType: TaxType,
    sgstRate: number,
    cgstRate: number,
    igstRate: number
  ) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;

    if (taxType === 'cgst_sgst') {
      sgstAmount = Math.round(((subtotal * sgstRate) / 100) * 100) / 100;
      cgstAmount = Math.round(((subtotal * cgstRate) / 100) * 100) / 100;
    } else if (taxType === 'igst') {
      igstAmount = Math.round(((subtotal * igstRate) / 100) * 100) / 100;
    }

    const grandTotal = Math.round((subtotal + sgstAmount + cgstAmount + igstAmount) * 100) / 100;

    return {
      subtotal,
      sgstAmount,
      cgstAmount,
      igstAmount,
      grandTotal,
    };
  };

  const handleFieldChange = (field: keyof Invoice, value: any) => {
    const updated = { ...invoice, [field]: value };
    if (['taxType', 'sgstRate', 'cgstRate', 'igstRate'].includes(field)) {
      const calc = recalculate(
        updated.items,
        updated.taxType,
        updated.sgstRate,
        updated.cgstRate,
        updated.igstRate
      );
      Object.assign(updated, calc);
    }
    onChange(updated);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    const current = { ...updatedItems[index], [field]: value };

    // Auto-calculate amount if Qty or Rate Per Kg changes
    if (field === 'qty' || field === 'ratePerKg') {
      const q = parseFloat(String(current.qty)) || 0;
      const r = parseFloat(String(current.ratePerKg)) || 0;
      if (q > 0 && r > 0) {
        current.amount = Math.round(q * r * 100) / 100;
      }
    }

    updatedItems[index] = current;
    const calc = recalculate(
      updatedItems,
      invoice.taxType,
      invoice.sgstRate,
      invoice.cgstRate,
      invoice.igstRate
    );
    onChange({
      ...invoice,
      items: updatedItems,
      ...calc,
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      challanNo: invoice.challanNo || '',
      dated: invoice.challanDate || invoice.date,
      qty: 1,
      particulars: '',
      ratePerKg: '',
      amount: 0,
    };

    const updatedItems = [...invoice.items, newItem];
    const calc = recalculate(
      updatedItems,
      invoice.taxType,
      invoice.sgstRate,
      invoice.cgstRate,
      invoice.igstRate
    );
    onChange({
      ...invoice,
      items: updatedItems,
      ...calc,
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    const calc = recalculate(
      updatedItems,
      invoice.taxType,
      invoice.sgstRate,
      invoice.cgstRate,
      invoice.igstRate
    );
    onChange({
      ...invoice,
      items: updatedItems,
      ...calc,
    });
  };

  const selectClient = (client: ClientProfile) => {
    onChange({
      ...invoice,
      clientName: client.name,
      clientAddress: client.address,
      clientGstin: client.gstin,
    });
    setShowClientDropdown(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-6">
      {/* SECTION 1: INVOICE IDENTIFIERS */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              1. Invoice & Order Details
            </h2>
          </div>
          <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
            {invoice.invoiceNo}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Invoice No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={invoice.invoiceNo}
              onChange={(e) => handleFieldChange('invoiceNo', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. APW/24-25/001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              P.O. No. (Purchase Order)
            </label>
            <input
              type="text"
              value={invoice.poNo}
              onChange={(e) => handleFieldChange('poNo', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. PO/984/2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Challan No.
            </label>
            <input
              type="text"
              value={invoice.challanNo}
              onChange={(e) => handleFieldChange('challanNo', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. CH-458"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Challan Date
            </label>
            <input
              type="date"
              value={invoice.challanDate}
              onChange={(e) => handleFieldChange('challanDate', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tax Method (GST)
            </label>
            <select
              value={invoice.taxType}
              onChange={(e) => handleFieldChange('taxType', e.target.value as TaxType)}
              className="w-full px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="cgst_sgst">SGST 9% + CGST 9% (Within Maharashtra)</option>
              <option value="igst">IGST 18% (Inter-State)</option>
              <option value="none">No Tax / Tax Exempt</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER / M/S DETAILS */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              2. Client (M/s.) Information
            </h2>
          </div>
          {savedClients.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Select Existing Client ({savedClients.length})
              </button>

              {showClientDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-50 border-b">
                    Saved Clients
                  </div>
                  {savedClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectClient(c)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex flex-col border-b border-slate-100 last:border-0"
                    >
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="text-[10px] text-slate-700 truncate">{c.address || c.gstin}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              M/s. Company / Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={invoice.clientName}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              placeholder="e.g. TATA MOTORS LTD / PRECISION ENGG WORKS"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Your GSTIN (Client GST)
            </label>
            <input
              type="text"
              value={invoice.clientGstin}
              onChange={(e) => handleFieldChange('clientGstin', e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              placeholder="e.g. 27AAAAA0000A1Z5"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Client Address & Location
            </label>
            <textarea
              rows={2}
              value={invoice.clientAddress}
              onChange={(e) => handleFieldChange('clientAddress', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Plot No. 45, MIDC Bhosari, Pune - 411026, Maharashtra"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: LINE ITEMS */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              3. Bill Line Items ({invoice.items.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Row
          </button>
        </div>

        <div className="space-y-3 pt-3">
          {invoice.items.map((item, index) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Item #{index + 1}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    title="Remove item"
                    className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 1: Particulars with quick suggestions */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Particulars / Description of Work <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={item.particulars}
                    onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Job work of Dish Ends Knuckling 1200mm Dia x 12mm Thk MS Plate"
                  />
                </div>

                {/* Quick Industry Presets */}
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] text-slate-600 flex items-center mr-1">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 text-blue-500" /> Presets:
                  </span>
                  {COMMON_PARTICULARS.slice(0, 3).map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleItemChange(index, 'particulars', preset)}
                      className="text-[10px] bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 px-1.5 py-0.5 rounded transition-colors truncate max-w-[200px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Challan, Dated, Qty, Rate per Kg, Amount */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Challan No</label>
                  <input
                    type="text"
                    value={item.challanNo}
                    onChange={(e) => handleItemChange(index, 'challanNo', e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    placeholder="Challan #"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Dated</label>
                  <input
                    type="date"
                    value={item.dated}
                    onChange={(e) => handleItemChange(index, 'dated', e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">
                    Qty. (Nos / Kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">
                    Rate Per Kg / Unit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.ratePerKg}
                    onChange={(e) => handleItemChange(index, 'ratePerKg', e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 flex items-center justify-between">
                    <span>Amount (₹)</span>
                    <span className="text-[9px] text-blue-600 font-mono">Auto / Edit</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1 text-xs bg-blue-50/50 border border-blue-200 rounded font-bold font-mono text-slate-900"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}

          {invoice.items.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">No items added yet to this bill</p>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded inline-flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add First Bill Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: FINANCIAL SUMMARY */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Subtotal (Items Total):</span>
          <span className="font-mono font-bold text-slate-800">
            ₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {invoice.taxType === 'cgst_sgst' && (
          <>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <span>SGST</span>
                <input
                  type="number"
                  value={invoice.sgstRate}
                  onChange={(e) => handleFieldChange('sgstRate', parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-center"
                />
                <span>%:</span>
              </div>
              <span className="font-mono font-semibold text-slate-700">
                ₹{invoice.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <span>CGST</span>
                <input
                  type="number"
                  value={invoice.cgstRate}
                  onChange={(e) => handleFieldChange('cgstRate', parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-center"
                />
                <span>%:</span>
              </div>
              <span className="font-mono font-semibold text-slate-700">
                ₹{invoice.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}

        {invoice.taxType === 'igst' && (
          <div className="flex justify-between items-center text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <span>IGST</span>
              <input
                type="number"
                value={invoice.igstRate}
                onChange={(e) => handleFieldChange('igstRate', parseFloat(e.target.value) || 0)}
                className="w-12 px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-center"
              />
              <span>%:</span>
            </div>
            <span className="font-mono font-semibold text-slate-700">
              ₹{invoice.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900">
          <span className="text-[#0066aa] uppercase">Grand Total (Bill Amount):</span>
          <span className="font-mono text-base text-[#d90429]">
            ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
