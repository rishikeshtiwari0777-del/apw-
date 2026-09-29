/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Save,
  Plus,
  History,
  Lock,
  Unlock,
  Settings as SettingsIcon,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Eye,
  Edit3,
  HardDrive,
  Layers,
  Sparkles,
} from 'lucide-react';

import { Invoice, CompanyDetails, ClientProfile } from './types/invoice';
import { BillPreview } from './components/BillPreview';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { PinLockModal } from './components/PinLockModal';
import { ClientDirectoryModal } from './components/ClientDirectoryModal';

import {
  getCompanyDetails,
  saveCompanyDetails,
  getAllInvoices,
  saveInvoice,
  deleteInvoice,
  getSavedClients,
  saveClientProfile,
  deleteClientProfile,
  isPinProtected,
  generateNextInvoiceNumber,
  exportLaptopBackup,
} from './utils/storage';
import { downloadInvoicePDF, triggerPrintInvoice } from './utils/pdfGenerator';
import { numberToIndianWords } from './utils/numberToWords';

export default function App() {
  const [company, setCompany] = useState<CompanyDetails>(getCompanyDetails());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [savedClients, setSavedClients] = useState<ClientProfile[]>([]);

  // Security / Privacy PIN state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!isPinProtected());
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);

  // Zoom control for laptop preview
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Active Invoice
  const [activeInvoice, setActiveInvoice] = useState<Invoice>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: 'inv_' + Date.now(),
      invoiceNo: generateNextInvoiceNumber(),
      date: today,
      clientName: '',
      clientAddress: '',
      clientGstin: '',
      challanNo: '',
      challanDate: today,
      poNo: '',
      items: [
        {
          id: 'item_1',
          challanNo: '',
          dated: today,
          qty: 5,
          particulars: 'Job work of Dish Ends Knuckling as per standard codes',
          ratePerKg: 45,
          amount: 225,
        },
      ],
      taxType: 'cgst_sgst',
      sgstRate: 9,
      cgstRate: 9,
      igstRate: 18,
      subtotal: 225,
      sgstAmount: 20.25,
      cgstAmount: 20.25,
      igstAmount: 0,
      grandTotal: 265.5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  // UI state
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor'); // For mobile/small view fallback

  // Load stored state on mount
  useEffect(() => {
    setCompany(getCompanyDetails());
    const storedInvoices = getAllInvoices();
    setInvoices(storedInvoices);
    setSavedClients(getSavedClients());

    // If there are existing saved invoices and active invoice is empty draft, load the latest one
    if (storedInvoices.length > 0 && !activeInvoice.clientName) {
      // Keep next bill number ready
    }

    if (isPinProtected()) {
      setIsUnlocked(false);
      setShowPinModal(true);
    }
  }, []);

  // Keyboard shortcuts for laptop power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S -> Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveInvoice();
      }
      // Ctrl+D or Cmd+D -> Download PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDownloadPDF();
      }
      // Ctrl+P or Cmd+P -> Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        triggerPrintInvoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInvoice, company]);

  const handleSaveInvoice = () => {
    if (!activeInvoice.clientName.trim()) {
      alert('Please enter the client / company name (M/s.) before saving.');
      return;
    }

    // Ensure grand total in words is synced
    const invoiceToSave = {
      ...activeInvoice,
      amountInWords: numberToIndianWords(activeInvoice.grandTotal),
      updatedAt: Date.now(),
    };

    saveInvoice(invoiceToSave);
    const updatedList = getAllInvoices();
    setInvoices(updatedList);
    setSavedClients(getSavedClients());

    setSaveToast(`Invoice ${invoiceToSave.invoiceNo} saved securely!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDownloadPDF = async () => {
    if (!activeInvoice.clientName.trim()) {
      const proceed = confirm(
        'Client name is blank. Would you like to download this bill anyway?'
      );
      if (!proceed) return;
    }

    setIsDownloading(true);
    try {
      const cleanInvNo = (activeInvoice.invoiceNo || 'Draft').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `APW_Invoice_${cleanInvNo}.pdf`;
      await downloadInvoicePDF('invoice-sheet', filename);

      // Auto-save when downloading
      saveInvoice({
        ...activeInvoice,
        amountInWords: numberToIndianWords(activeInvoice.grandTotal),
        updatedAt: Date.now(),
      });
      setInvoices(getAllInvoices());
      setSavedClients(getSavedClients());

      setSaveToast(`Downloaded ${filename} directly to your device!`);
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF. Please try Print -> Save as PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewInvoice = () => {
    if (activeInvoice.clientName && !confirm('Create a new blank bill? Current changes will be kept if saved.')) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const nextNo = generateNextInvoiceNumber();

    const newInv: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNo: nextNo,
      date: today,
      clientName: '',
      clientAddress: '',
      clientGstin: '',
      challanNo: '',
      challanDate: today,
      poNo: '',
      items: [
        {
          id: 'item_' + Date.now(),
          challanNo: '',
          dated: today,
          qty: 1,
          particulars: 'Job work of Dish Ends Knuckling as per standard codes',
          ratePerKg: 0,
          amount: 0,
        },
      ],
      taxType: 'cgst_sgst',
      sgstRate: 9,
      cgstRate: 9,
      igstRate: 18,
      subtotal: 0,
      sgstAmount: 0,
      cgstAmount: 0,
      igstAmount: 0,
      grandTotal: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveInvoice(newInv);
    setSaveToast(`Ready for next bill: ${nextNo}`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleDuplicateInvoice = (source: Invoice) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextNo = generateNextInvoiceNumber();
    const duplicated: Invoice = {
      ...source,
      id: 'inv_' + Date.now(),
      invoiceNo: nextNo,
      date: today,
      challanDate: today,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setActiveInvoice(duplicated);
    setSaveToast(`Duplicated bill created as ${nextNo}`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    const updated = getAllInvoices();
    setInvoices(updated);
    if (activeInvoice.id === id) {
      handleNewInvoice();
    }
    setSaveToast('Invoice deleted from local archive.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleLockWorkspace = () => {
    setIsUnlocked(false);
    setShowPinModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none text-slate-800">
      {/* ===================== TOP DESKTOP / LAPTOP APP BAR ===================== */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#0088cc] text-white px-2.5 py-1 rounded-lg font-black font-mono tracking-wider text-base shadow-sm">
              APW
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-slate-900 text-sm tracking-wide uppercase">
                  ASHISH PRESSING WORKS
                </h1>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Billing Portal
                </span>
                <span className="hidden xl:inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  <HardDrive className="w-3 h-3 mr-1" />
                  Personal Laptop Storage
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Specialist in Dish Ends & Kone Knuckling | Pune, Maharashtra
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Laptop */}
          <div className="flex items-center space-x-2">
            {/* New Bill */}
            <button
              onClick={handleNewInvoice}
              title="Create a new bill (Ctrl+N)"
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">New Bill</span>
            </button>

            {/* Save Bill */}
            <button
              onClick={handleSaveInvoice}
              title="Save to laptop database (Ctrl+S)"
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Save</span>
            </button>

            {/* Past Invoices / Archive */}
            <button
              onClick={() => setShowHistoryModal(true)}
              title="View saved invoices history"
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Bills Archive</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {invoices.length}
              </span>
            </button>

            {/* Clients Directory */}
            <button
              onClick={() => setShowClientsModal(true)}
              title="Manage Client Companies"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span className="hidden lg:inline">Clients (M/s)</span>
            </button>

            {/* Print */}
            <button
              onClick={triggerPrintInvoice}
              title="Print bill or Save to PDF via printer (Ctrl+P)"
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">Print</span>
            </button>

            {/* Download PDF - Highlighted Action */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              title="Download invoice directly as PDF file (Ctrl+D)"
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center space-x-1.5 transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Privacy Lock (Personal Use) */}
            <button
              onClick={
                isPinProtected()
                  ? handleLockWorkspace
                  : () => {
                      setShowPinModal(true);
                    }
              }
              title={
                isPinProtected()
                  ? 'Private mode active: click to lock'
                  : 'Configure private PIN lock for personal use'
              }
              className={`p-2 rounded-lg border transition-colors ${
                isPinProtected()
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isPinProtected() ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Company details, Bank info & Data backup"
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Laptop Sub-bar with notification message / tips */}
        {saveToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}
      </header>

      {/* ===================== LAPTOP DUAL-PANE WORKSPACE ===================== */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 overflow-hidden">
        {/* Mobile / Narrow Screen Tab Switcher */}
        <div className="lg:hidden flex items-center justify-center mb-4 space-x-2 bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'editor' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bill Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'preview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Sheet Preview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-80px)]">
          {/* ================= LEFT PANE: INVOICE EDITOR ================= */}
          <div
            className={`lg:col-span-5 xl:col-span-5 h-full overflow-y-auto pr-1 ${
              activeTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <InvoiceEditor
              invoice={activeInvoice}
              onChange={setActiveInvoice}
              savedClients={savedClients}
              onQuickSaveClient={(c) => {
                saveClientProfile(c);
                setSavedClients(getSavedClients());
              }}
            />

            {/* Quick Keyboard shortcuts help for laptop */}
            <div className="no-print mt-4 p-3 bg-white/70 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">Laptop Shortcuts:</span>
              <div className="flex items-center space-x-3">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">
                    Ctrl+S
                  </kbd>{' '}
                  Save
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">
                    Ctrl+D
                  </kbd>{' '}
                  Download PDF
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">
                    Ctrl+P
                  </kbd>{' '}
                  Print
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANE: LIVE SHEET PREVIEW ================= */}
          <div
            className={`lg:col-span-7 xl:col-span-7 h-full flex flex-col bg-slate-200/70 border border-slate-300 rounded-xl p-3 overflow-hidden shadow-inner ${
              activeTab === 'preview' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Preview Toolbar */}
            <div className="no-print flex items-center justify-between pb-2 mb-2 border-b border-slate-300/80 text-xs font-semibold text-slate-700">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="font-bold text-slate-800">
                  Live A4 Bill Preview (Exact Physical Layout)
                </span>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.05))}
                  title="Zoom Out"
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-12 text-center font-bold text-slate-700">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.05))}
                  title="Zoom In"
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-3 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setZoomLevel(0.82)}
                  title="Fit to screen"
                  className="px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded font-bold"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="100% scale"
                  className="px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded font-bold"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Document Canvas (Scrollable) */}
            <div className="flex-1 overflow-auto flex justify-center items-start p-4 relative bg-slate-300/40 rounded-lg">
              <div className="print-wrapper">
                <BillPreview
                  invoice={activeInvoice}
                  company={company}
                  zoom={zoomLevel}
                  id="invoice-sheet"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===================== MODALS ===================== */}
      {showHistoryModal && (
        <InvoiceHistoryModal
          invoices={invoices}
          onSelectInvoice={(inv) => setActiveInvoice(inv)}
          onDuplicateInvoice={handleDuplicateInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          company={company}
          onSave={(updated) => {
            setCompany(updated);
            saveCompanyDetails(updated);
          }}
          onDataRestored={() => {
            setCompany(getCompanyDetails());
            setInvoices(getAllInvoices());
            setSavedClients(getSavedClients());
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showClientsModal && (
        <ClientDirectoryModal
          clients={savedClients}
          onSelectClient={(c) => {
            setActiveInvoice((prev) => ({
              ...prev,
              clientName: c.name,
              clientAddress: c.address,
              clientGstin: c.gstin,
            }));
          }}
          onSaveClient={(c) => {
            saveClientProfile(c);
            setSavedClients(getSavedClients());
          }}
          onDeleteClient={(name) => {
            deleteClientProfile(name);
            setSavedClients(getSavedClients());
          }}
          onClose={() => setShowClientsModal(false)}
        />
      )}

      {showPinModal && (
        <PinLockModal
          isOpen={showPinModal}
          isUnlocked={isUnlocked}
          onUnlockSuccess={() => {
            setIsUnlocked(true);
            setShowPinModal(false);
          }}
          onClose={isUnlocked ? () => setShowPinModal(false) : undefined}
        />
      )}
    </div>
  );
}
