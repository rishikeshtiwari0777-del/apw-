import React from 'react';
import { Invoice, CompanyDetails } from '../types/invoice';
import { numberToIndianWords, formatIndianCurrency } from '../utils/numberToWords';

interface BillPreviewProps {
  invoice: Invoice;
  company: CompanyDetails;
  id?: string;
  zoom?: number;
}

export const BillPreview: React.FC<BillPreviewProps> = ({
  invoice,
  company,
  id = 'invoice-sheet',
  zoom = 1,
}) => {
  const currencyTotals = {
    subtotal: formatIndianCurrency(invoice.subtotal),
    sgst: formatIndianCurrency(invoice.sgstAmount),
    cgst: formatIndianCurrency(invoice.cgstAmount),
    igst: formatIndianCurrency(invoice.igstAmount),
    grandTotal: formatIndianCurrency(invoice.grandTotal),
  };

  const words = invoice.amountInWords || numberToIndianWords(invoice.grandTotal);

  // Maintain minimum 10 visual rows like the physical book
  const minRows = 10;
  const blankRowsCount = Math.max(0, minRows - (invoice.items?.length || 0));

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
      }}
      className="transition-transform duration-150"
    >
      <div
        id={id}
        className="bg-white text-slate-900 mx-auto select-none print:shadow-none shadow-2xl border border-slate-300 rounded-sm"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 14mm',
          boxSizing: 'border-box',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* ===================== HEADER ===================== */}
        <div className="relative text-center mb-1">
          {/* APW Big Initials */}
          <div className="text-3xl font-black tracking-widest text-[#0088cc] mb-1 font-mono">
            {company.shortName || 'APW'}
          </div>

          {/* Company Main Name in Red */}
          <h1 className="text-2xl sm:text-[26px] font-black tracking-wide text-[#d90429] uppercase mb-1">
            {company.companyName}
          </h1>

          {/* Tagline / Specialties & Mobile on Right */}
          <div className="flex justify-between items-start text-left mt-1 text-xs">
            <div className="w-[72%] text-[#0066aa] font-semibold leading-relaxed">
              <p>
                <span className="font-bold text-[#0066aa]">Specialist in : </span>
                {company.specialistLine1}
              </p>
              <p className="mt-0.5">{company.specialistLine2}</p>
            </div>

            <div className="w-[28%] text-right font-bold text-[#0066aa] leading-tight">
              <div>
                <span className="text-slate-800 font-semibold mr-1">MOBILE -</span>
                <span>{company.phones?.[0] || '8208175410'}</span>
              </div>
              {company.phones?.[1] && (
                <div className="mt-1 pl-12 text-[#0066aa]">
                  <span>{company.phones[1]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="border-b-2 border-dotted border-[#0088cc] my-2 w-full" />

          {/* Address Line */}
          <div className="text-[#0066aa] text-xs font-semibold tracking-tight">
            {company.address}
            {company.email && (
              <>
                <span className="mx-2 text-slate-400">|</span>
                <span>Email : {company.email}</span>
              </>
            )}
          </div>
        </div>

        {/* ===================== BILL PARTICULARS GRID ===================== */}
        <div className="border-2 border-[#0088cc] mt-2 text-xs">
          {/* Top Row: M/s. on left, Invoice Details on right */}
          <div className="flex border-b-2 border-[#0088cc]">
            {/* Customer Details Box */}
            <div className="w-[58%] border-r-2 border-[#0088cc] p-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-[#0066aa] text-sm">M/s. </span>
                <span className="font-bold text-slate-900 text-sm uppercase">
                  {invoice.clientName || '__________________________________'}
                </span>
                <div className="mt-1 text-slate-700 font-medium whitespace-pre-line text-xs min-h-[38px] leading-relaxed">
                  {invoice.clientAddress || (
                    <div className="text-slate-300 italic pt-1">
                      (Client Address & Location)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sub-table: Invoice No, Date, GSTIN */}
            <div className="w-[42%] flex flex-col">
              {/* Invoice No */}
              <div className="flex items-center border-b border-[#0088cc] px-2 py-1 flex-1">
                <span className="font-bold text-[#0066aa] w-28">Invoice No.</span>
                <span className="font-bold text-slate-900 font-mono text-sm tracking-wide">
                  {invoice.invoiceNo || 'APW/24-25/001'}
                </span>
              </div>
              {/* Date */}
              <div className="flex items-center border-b border-[#0088cc] px-2 py-1 flex-1">
                <span className="font-bold text-[#0066aa] w-28">Date</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {formatDate(invoice.date) || 'DD/MM/YYYY'}
                </span>
              </div>
              {/* Client GSTIN */}
              <div className="flex items-center px-2 py-1 flex-1">
                <span className="font-bold text-[#0066aa] w-28">Your GSTIN</span>
                <span className="font-mono text-slate-800 font-bold uppercase text-xs tracking-wider">
                  {invoice.clientGstin || '--------------------'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom sub-row: Challan No., Date, P.O. No */}
          <div className="flex items-center text-xs divide-x-2 divide-[#0088cc]">
            <div className="w-[36%] px-2 py-1 flex items-center">
              <span className="font-bold text-[#0066aa] mr-1 whitespace-nowrap">Your Challan No.</span>
              <span className="font-semibold text-slate-900 font-mono">{invoice.challanNo || '—'}</span>
            </div>
            <div className="w-[28%] px-2 py-1 flex items-center">
              <span className="font-bold text-[#0066aa] mr-1 whitespace-nowrap">Date :</span>
              <span className="font-semibold text-slate-900 font-mono">{formatDate(invoice.challanDate) || '—'}</span>
            </div>
            <div className="w-[36%] px-2 py-1 flex items-center">
              <span className="font-bold text-[#0066aa] mr-1 whitespace-nowrap">P.O. No.</span>
              <span className="font-semibold text-slate-900 font-mono">{invoice.poNo || '—'}</span>
            </div>
          </div>
        </div>

        {/* ===================== ITEMS TABLE ===================== */}
        <div className="border-x-2 border-b-2 border-[#0088cc] text-xs">
          {/* Header Row */}
          <div className="flex border-b-2 border-[#0088cc] bg-blue-50/50 text-[#0066aa] font-bold text-center">
            <div className="w-[12%] py-1.5 px-1 border-r-2 border-[#0088cc] leading-tight">
              Challan<br />No
            </div>
            <div className="w-[11%] py-1.5 px-1 border-r-2 border-[#0088cc] flex items-center justify-center">
              Dated
            </div>
            <div className="w-[9%] py-1.5 px-1 border-r-2 border-[#0088cc] flex items-center justify-center">
              Qty.
            </div>
            <div className="w-[43%] py-1.5 px-2 border-r-2 border-[#0088cc] flex items-center justify-center uppercase tracking-wider">
              PARTICULARS
            </div>
            <div className="w-[12%] py-1.5 px-1 border-r-2 border-[#0088cc] leading-tight flex flex-col justify-center">
              <span>Rate</span>
              <span className="text-[10px] font-semibold">Per Kg</span>
            </div>
            <div className="w-[13%] flex flex-col justify-center">
              <div className="py-0.5 border-b border-[#0088cc] font-bold">Amount</div>
              <div className="flex text-[10px]">
                <div className="w-[72%] border-r border-[#0088cc] py-0.5">Rs.</div>
                <div className="w-[28%] py-0.5">P.</div>
              </div>
            </div>
          </div>

          {/* Table Items Rows */}
          <div className="relative min-h-[380px] flex flex-col">
            {/* Active Items */}
            {invoice.items && invoice.items.map((item, idx) => {
              const itemFormatted = formatIndianCurrency(item.amount);
              return (
                <div
                  key={item.id || idx}
                  className="flex border-b border-blue-100 min-h-[26px] items-stretch text-slate-800"
                >
                  <div className="w-[12%] py-1 px-1 border-r-2 border-[#0088cc] text-center font-mono text-xs">
                    {item.challanNo || ''}
                  </div>
                  <div className="w-[11%] py-1 px-1 border-r-2 border-[#0088cc] text-center font-mono text-xs">
                    {formatDate(item.dated)}
                  </div>
                  <div className="w-[9%] py-1 px-1 border-r-2 border-[#0088cc] text-center font-semibold">
                    {item.qty || ''}
                  </div>
                  <div className="w-[43%] py-1 px-2 border-r-2 border-[#0088cc] font-medium leading-relaxed">
                    {item.particulars}
                  </div>
                  <div className="w-[12%] py-1 px-1 border-r-2 border-[#0088cc] text-right font-mono pr-2">
                    {item.ratePerKg ? Number(item.ratePerKg).toFixed(2) : ''}
                  </div>
                  <div className="w-[13%] flex font-mono">
                    <div className="w-[72%] border-r border-[#0088cc] py-1 px-1 text-right font-semibold">
                      {item.amount > 0 ? itemFormatted.rupees : ''}
                    </div>
                    <div className="w-[28%] py-1 px-1 text-center text-xs">
                      {item.amount > 0 ? itemFormatted.paise : ''}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty ruled lines to complete physical page height */}
            {Array.from({ length: blankRowsCount }).map((_, idx) => (
              <div
                key={`blank-${idx}`}
                className="flex border-b border-blue-50/70 flex-1 min-h-[26px] items-stretch"
              >
                <div className="w-[12%] border-r-2 border-[#0088cc]" />
                <div className="w-[11%] border-r-2 border-[#0088cc]" />
                <div className="w-[9%] border-r-2 border-[#0088cc]" />
                <div className="w-[43%] border-r-2 border-[#0088cc]" />
                <div className="w-[12%] border-r-2 border-[#0088cc]" />
                <div className="w-[13%] flex">
                  <div className="w-[72%] border-r border-[#0088cc]" />
                  <div className="w-[28%]" />
                </div>
              </div>
            ))}
          </div>

          {/* ===================== SUMMARY & TAX CALCULATIONS ===================== */}
          <div className="flex border-t-2 border-[#0088cc]">
            {/* Left Box: Amount in words */}
            <div className="w-[75%] border-r-2 border-[#0088cc] p-2 flex flex-col justify-end bg-slate-50/40">
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-[#0066aa]">Amount in Words : </span>
                <span className="font-semibold text-slate-800 italic uppercase">
                  {words}
                </span>
              </div>
            </div>

            {/* Right Box: Subtotal, SGST, CGST, IGST, Grand Total */}
            <div className="w-[25%] flex flex-col divide-y divide-[#0088cc] text-xs">
              {/* TOTAL / Subtotal */}
              <div className="flex items-stretch bg-blue-50/30">
                <div className="w-[48%] py-1 px-1.5 font-bold text-[#0066aa] border-r-2 border-[#0088cc]">
                  TOTAL
                </div>
                <div className="w-[52%] flex font-mono">
                  <div className="w-[70%] py-1 px-1 text-right font-semibold border-r border-[#0088cc]">
                    {currencyTotals.subtotal.rupees}
                  </div>
                  <div className="w-[30%] py-1 px-1 text-center font-semibold text-[11px]">
                    {currencyTotals.subtotal.paise}
                  </div>
                </div>
              </div>

              {/* SGST */}
              <div className="flex items-stretch">
                <div className="w-[48%] py-0.5 px-1.5 font-bold text-[#0066aa] text-[11px] border-r-2 border-[#0088cc] flex items-center">
                  SGST {invoice.taxType === 'cgst_sgst' ? `${invoice.sgstRate}%` : '%'}
                </div>
                <div className="w-[52%] flex font-mono">
                  <div className="w-[70%] py-0.5 px-1 text-right text-slate-700 border-r border-[#0088cc]">
                    {invoice.taxType === 'cgst_sgst' && invoice.sgstAmount > 0 ? currencyTotals.sgst.rupees : '—'}
                  </div>
                  <div className="w-[30%] py-0.5 px-1 text-center text-slate-600 text-[10px]">
                    {invoice.taxType === 'cgst_sgst' && invoice.sgstAmount > 0 ? currencyTotals.sgst.paise : '—'}
                  </div>
                </div>
              </div>

              {/* CGST */}
              <div className="flex items-stretch">
                <div className="w-[48%] py-0.5 px-1.5 font-bold text-[#0066aa] text-[11px] border-r-2 border-[#0088cc] flex items-center">
                  CGST {invoice.taxType === 'cgst_sgst' ? `${invoice.cgstRate}%` : '%'}
                </div>
                <div className="w-[52%] flex font-mono">
                  <div className="w-[70%] py-0.5 px-1 text-right text-slate-700 border-r border-[#0088cc]">
                    {invoice.taxType === 'cgst_sgst' && invoice.cgstAmount > 0 ? currencyTotals.cgst.rupees : '—'}
                  </div>
                  <div className="w-[30%] py-0.5 px-1 text-center text-slate-600 text-[10px]">
                    {invoice.taxType === 'cgst_sgst' && invoice.cgstAmount > 0 ? currencyTotals.cgst.paise : '—'}
                  </div>
                </div>
              </div>

              {/* IGST */}
              <div className="flex items-stretch">
                <div className="w-[48%] py-0.5 px-1.5 font-bold text-[#0066aa] text-[11px] border-r-2 border-[#0088cc] flex items-center">
                  IGST {invoice.taxType === 'igst' ? `${invoice.igstRate}%` : '%'}
                </div>
                <div className="w-[52%] flex font-mono">
                  <div className="w-[70%] py-0.5 px-1 text-right text-slate-700 border-r border-[#0088cc]">
                    {invoice.taxType === 'igst' && invoice.igstAmount > 0 ? currencyTotals.igst.rupees : '—'}
                  </div>
                  <div className="w-[30%] py-0.5 px-1 text-center text-slate-600 text-[10px]">
                    {invoice.taxType === 'igst' && invoice.igstAmount > 0 ? currencyTotals.igst.paise : '—'}
                  </div>
                </div>
              </div>

              {/* G. TOTAL */}
              <div className="flex items-stretch bg-blue-100/60 font-bold">
                <div className="w-[48%] py-1 px-1.5 font-black text-[#0066aa] border-r-2 border-[#0088cc] tracking-wide">
                  G. TOTAL
                </div>
                <div className="w-[52%] flex font-mono">
                  <div className="w-[70%] py-1 px-1 text-right font-black text-slate-900 border-r border-[#0088cc]">
                    {currencyTotals.grandTotal.rupees}
                  </div>
                  <div className="w-[30%] py-1 px-1 text-center font-black text-slate-900 text-[11px]">
                    {currencyTotals.grandTotal.paise}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER SECTION ===================== */}
        <div className="border-2 border-[#0088cc] mt-2 text-xs flex">
          {/* Left Cell: E. & O.E. + Jurisdiction */}
          <div className="w-[33%] border-r-2 border-[#0088cc] p-2 flex flex-col justify-between">
            <div className="font-bold text-[#0066aa]">E. & O.E.</div>
            <div className="text-[11px] font-semibold text-[#0066aa] pt-6">
              Subject to Pune Jurisdiction
            </div>
          </div>

          {/* Center Cell: Bank Details */}
          <div className="w-[35%] border-r-2 border-[#0088cc] p-1.5 flex flex-col text-[11px] leading-tight">
            <div className="font-bold text-[#0066aa] text-center border-b border-[#0088cc] pb-1 mb-1">
              Bank Details
            </div>
            <div className="space-y-0.5 text-slate-800">
              <div>
                <span className="font-bold text-[#0066aa]">Bank Name : </span>
                <span className="font-bold">{company.bankDetails.bankName}</span>
              </div>
              <div className="text-[10px] text-slate-700">
                <span className="font-semibold text-[#0066aa]">BHAYCTO : </span>
                {company.bankDetails.branch}
              </div>
              <div>
                <span className="font-bold text-[#0066aa]">IFS CODE : </span>
                <span className="font-mono font-bold">{company.bankDetails.ifscCode}</span>
              </div>
              <div>
                <span className="font-bold text-[#0066aa]">A/C. No : </span>
                <span className="font-mono font-bold tracking-wider">{company.bankDetails.accountNo}</span>
              </div>
            </div>
          </div>

          {/* Right Cell: For Ashish Pressing Works + Auth Signature */}
          <div className="w-[32%] p-2 flex flex-col justify-between text-right">
            <div className="font-bold text-[#0066aa] text-center">
              For {company.companyName}
            </div>
            <div className="h-10 flex items-center justify-center">
              {/* Optional seal placeholder */}
            </div>
            <div className="font-bold text-[#0066aa] text-center pt-2">
              Auth. Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
