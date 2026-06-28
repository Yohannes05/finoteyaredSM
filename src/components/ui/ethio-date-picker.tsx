import React, { useEffect, useState } from 'react';

const ETHIOPIAN_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
];

export function EthioDatePicker({ 
  value, 
  onChange, 
  className = "" 
}: { 
  value: string; 
  onChange: (val: string) => void;
  className?: string;
}) {
  const [year, setYear] = useState<number>(2017);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);

  // Initialize from value one-time when value is loaded
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const d = parseInt(parts[2]);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setYear(y);
          setMonth(m);
          setDay(d);
        }
      }
    }
  }, [value]);

  const handleUpdate = (y: number, m: number, d: number) => {
    let validDay = d;
    if (m === 13 && d > 6) validDay = 6;
    
    const newVal = `${y}-${String(m).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    onChange(newVal);
  }

  // Generate lists
  const currentMonthDays = month === 13 ? 6 : 30;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select 
        className="flex h-11 w-[30%] rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        value={day}
        onChange={(e) => handleUpdate(year, month, parseInt(e.target.value))}
      >
        {Array.from({length: currentMonthDays}).map((_, i) => (
          <option key={`d-${i+1}`} value={i+1}>{i+1}</option>
        ))}
      </select>
      <select 
        className="flex h-11 w-[40%] rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        value={month}
        onChange={(e) => handleUpdate(year, parseInt(e.target.value), day)}
      >
        {ETHIOPIAN_MONTHS.map((m, i) => (
          <option key={`m-${i+1}`} value={i+1}>{m}</option>
        ))}
      </select>
      <select 
        className="flex h-11 w-[30%] rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        value={year}
        onChange={(e) => handleUpdate(parseInt(e.target.value), month, day)}
      >
        {Array.from({length: 21}).map((_, i) => (
          <option key={`y-${2010+i}`} value={2010+i}>{2010+i}</option>
        ))}
      </select>
    </div>
  )
}
