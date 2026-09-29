export interface InvoiceItem {
  id: string;
  challanNo: string;
  dated: string;
  qty: number | string;
  particulars: string;
  ratePerKg: number | string;
  amount: number;
}

export interface BankDetails {
  bankName: string;
  branch: string;
  ifscCode: string;
  accountNo: string;
}

export interface CompanyDetails {
  shortName: string;
  companyName: string;
  specialistLine1: string;
  specialistLine2: string;
  phones: string[];
  address: string;
  email: string;
  bankDetails: BankDetails;
}

export type TaxType = 'cgst_sgst' | 'igst' | 'none';

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  clientName: string;
  clientAddress: string;
  clientGstin: string;
  challanNo: string;
  challanDate: string;
  poNo: string;
  items: InvoiceItem[];
  taxType: TaxType;
  sgstRate: number; // default 9%
  cgstRate: number; // default 9%
  igstRate: number; // default 18%
  subtotal: number;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  amountInWords?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  address: string;
  gstin: string;
  contactPerson?: string;
  phone?: string;
}
