import { CompanyDetails, Invoice, ClientProfile } from '../types/invoice';

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  shortName: 'APW',
  companyName: 'ASHISH PRESSING WORKS',
  specialistLine1: 'Specialist in : All types of Dish Ends and Kone Knuckling as per Standard Codes on',
  specialistLine2: 'Spinning Machine Flange, Blending in MS / SS / Copper / Aluminium etc.',
  phones: ['8208175410', '9049586464'],
  address: 'Sector 7, Plot No. 168, PCNTDA Bhosari, Pune - 411 026.',
  email: 'ashishtriwari6464@gmail.com',
  bankDetails: {
    bankName: 'AXIS BANK LTD.',
    branch: 'BHAYCTO : Hinjewadi Nagar, Pune, Mhb, Pune-411033',
    ifscCode: 'UTIB0004180',
    accountNo: '9220200067960385',
  },
};

const INVOICES_KEY = 'apw_invoices_v1';
const COMPANY_KEY = 'apw_company_profile_v1';
const CLIENTS_KEY = 'apw_clients_v1';
const PIN_KEY = 'apw_security_pin_v1';
const PIN_ENABLED_KEY = 'apw_pin_enabled_v1';

export function getCompanyDetails(): CompanyDetails {
  try {
    const raw = localStorage.getItem(COMPANY_KEY);
    if (!raw) return DEFAULT_COMPANY_DETAILS;
    return { ...DEFAULT_COMPANY_DETAILS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_COMPANY_DETAILS;
  }
}

export function saveCompanyDetails(details: CompanyDetails): void {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(details));
}

export function getAllInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getAllInvoices();
  const existingIdx = invoices.findIndex((inv) => inv.id === invoice.id);
  if (existingIdx >= 0) {
    invoices[existingIdx] = { ...invoice, updatedAt: Date.now() };
  } else {
    invoices.unshift({ ...invoice, createdAt: Date.now(), updatedAt: Date.now() });
  }
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));

  // Also auto-save client to recent clients list
  if (invoice.clientName && invoice.clientName.trim()) {
    saveClientProfile({
      id: invoice.clientName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: invoice.clientName.trim(),
      address: invoice.clientAddress || '',
      gstin: invoice.clientGstin || '',
    });
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getAllInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function getSavedClients(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClientProfile(client: ClientProfile): void {
  const clients = getSavedClients();
  const index = clients.findIndex((c) => c.name.toLowerCase() === client.name.toLowerCase());
  if (index >= 0) {
    clients[index] = { ...clients[index], ...client };
  } else {
    clients.unshift(client);
  }
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function deleteClientProfile(name: string): void {
  const clients = getSavedClients().filter((c) => c.name.toLowerCase() !== name.toLowerCase());
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

// PIN security management for personal use
export function isPinProtected(): boolean {
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true';
}

export function getStoredPin(): string | null {
  return localStorage.getItem(PIN_KEY);
}

export function setSecurityPin(pin: string | null): void {
  if (pin && pin.trim().length >= 4) {
    localStorage.setItem(PIN_KEY, pin.trim());
    localStorage.setItem(PIN_ENABLED_KEY, 'true');
  } else {
    localStorage.removeItem(PIN_KEY);
    localStorage.setItem(PIN_ENABLED_KEY, 'false');
  }
}

export function checkPin(inputPin: string): boolean {
  const stored = getStoredPin();
  if (!stored) return true;
  return stored === inputPin;
}

// Generate Next Invoice Number
export function generateNextInvoiceNumber(): string {
  const invoices = getAllInvoices();
  const year = new Date().getFullYear();
  const shortYear = year.toString().slice(-2);
  const nextShortYear = (year + 1).toString().slice(-2);
  const prefix = `APW/${shortYear}-${nextShortYear}/`;

  let maxNum = 0;
  for (const inv of invoices) {
    if (inv.invoiceNo && inv.invoiceNo.startsWith(prefix)) {
      const numPart = parseInt(inv.invoiceNo.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }

  const nextCount = (maxNum + 1).toString().padStart(3, '0');
  return `${prefix}${nextCount}`;
}

// Export backup for laptop hard drive storage
export function exportLaptopBackup(): void {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    invoices: getAllInvoices(),
    clients: getSavedClients(),
    company: getCompanyDetails(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `APW_Billing_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Import backup from JSON
export function importLaptopBackup(jsonContent: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data.invoices)) {
      return { success: false, count: 0, error: 'Invalid backup file structure: missing invoices list.' };
    }

    localStorage.setItem(INVOICES_KEY, JSON.stringify(data.invoices));
    if (Array.isArray(data.clients)) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(data.clients));
    }
    if (data.company) {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(data.company));
    }

    return { success: true, count: data.invoices.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Failed to parse JSON file' };
  }
}
