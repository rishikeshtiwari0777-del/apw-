// Converts numbers to Indian Currency Words (Lakhs, Crores, etc.)
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanOneThousand(n: number): string {
  if (n === 0) return '';
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Rupees Zero Only';

  const isNegative = num < 0;
  let absoluteNum = Math.abs(num);

  const rupees = Math.floor(absoluteNum);
  const paise = Math.round((absoluteNum - rupees) * 100);

  let current = rupees;
  let parts: string[] = [];

  // Crores (>= 1,00,00,000)
  const crores = Math.floor(current / 10000000);
  if (crores > 0) {
    parts.push(convertLessThanOneThousand(crores) + ' Crore');
    current %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  const lakhs = Math.floor(current / 100000);
  if (lakhs > 0) {
    parts.push(convertLessThanOneThousand(lakhs) + ' Lakh');
    current %= 100000;
  }

  // Thousands (>= 1,000)
  const thousands = Math.floor(current / 1000);
  if (thousands > 0) {
    parts.push(convertLessThanOneThousand(thousands) + ' Thousand');
    current %= 1000;
  }

  // Remainder (< 1,000)
  if (current > 0) {
    parts.push(convertLessThanOneThousand(current));
  }

  let words = parts.join(' ').replace(/\s+/g, ' ').trim();
  let result = (isNegative ? 'Minus ' : '') + 'Rupees ' + (words || 'Zero');

  if (paise > 0) {
    result += ' and ' + convertLessThanOneThousand(paise) + ' Paise';
  }

  return result + ' Only';
}

export function formatIndianCurrency(amount: number): { rupees: string; paise: string; formatted: string } {
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const rupeesPart = Math.floor(abs);
  const paisePart = Math.round((abs - rupeesPart) * 100);

  // Indian number comma formatting: 12,34,567
  const rupeesStr = rupeesPart.toLocaleString('en-IN');
  const paiseStr = paisePart.toString().padStart(2, '0');

  return {
    rupees: (isNeg ? '-' : '') + rupeesStr,
    paise: paiseStr === '00' ? '00' : paiseStr,
    formatted: `₹${(isNeg ? '-' : '') + rupeesStr}.${paiseStr}`
  };
}
