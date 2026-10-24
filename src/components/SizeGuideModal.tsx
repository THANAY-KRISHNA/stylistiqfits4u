import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isSizeGuideOpen) return null;

  const sizeChartInches = [
    { size: 'XS', bust: '32', waist: '26', hip: '36', shoulder: '14.0', length: '44-46' },
    { size: 'S', bust: '34', waist: '28', hip: '38', shoulder: '14.5', length: '44-46' },
    { size: 'M', bust: '36', waist: '30', hip: '40', shoulder: '15.0', length: '45-47' },
    { size: 'L', bust: '38', waist: '32', hip: '42', shoulder: '15.5', length: '45-47' },
    { size: 'XL', bust: '40', waist: '34', hip: '44', shoulder: '16.0', length: '46-48' },
    { size: 'XXL', bust: '42', waist: '36', hip: '46', shoulder: '16.5', length: '46-48' }
  ];

  const sizeChartCm = [
    { size: 'XS', bust: '81', waist: '66', hip: '91', shoulder: '35.5', length: '112-117' },
    { size: 'S', bust: '86', waist: '71', hip: '96', shoulder: '36.8', length: '112-117' },
    { size: 'M', bust: '91', waist: '76', hip: '101', shoulder: '38.1', length: '114-119' },
    { size: 'L', bust: '96', waist: '81', hip: '106', shoulder: '39.4', length: '114-119' },
    { size: 'XL', bust: '101', waist: '86', hip: '111', shoulder: '40.6', length: '117-122' },
    { size: 'XXL', bust: '106', waist: '91', hip: '116', shoulder: '41.9', length: '117-122' }
  ];

  const currentChart = unit === 'inches' ? sizeChartInches : sizeChartCm;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#1C1412]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSizeGuideOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-lg shadow-2xl p-6 sm:p-8 z-10 border border-[#E8DFD5] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD5]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#A45543]" />
            <h3 className="font-serif text-xl font-bold text-[#2E221F]">Standard Boutique Size Guide</h3>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 text-[#7E726D] hover:text-[#2E221F] rounded-full hover:bg-[#F5EFE8]"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between mt-5 mb-4">
          <p className="text-xs text-[#7E726D]">All measurements reflect body measurements for regular relaxed fit.</p>
          <div className="inline-flex p-0.5 bg-[#F5EFE8] rounded-md border border-[#D4C5B9]">
            <button
              type="button"
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                unit === 'inches' ? 'bg-[#2E221F] text-white shadow-xs' : 'text-[#7E726D] hover:text-[#2E221F]'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                unit === 'cm' ? 'bg-[#2E221F] text-white shadow-xs' : 'text-[#7E726D] hover:text-[#2E221F]'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded border border-[#E8DFD5] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EFE8] text-[#2E221F] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Bust ({unit})</th>
                <th className="py-2.5 px-3">Waist ({unit})</th>
                <th className="py-2.5 px-3">Hip ({unit})</th>
                <th className="py-2.5 px-3">Shoulder ({unit})</th>
                <th className="py-2.5 px-3">Length ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5] tabular-nums text-[#2E221F]">
              {currentChart.map((row) => (
                <tr key={row.size} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 px-3 font-bold text-[#A45543]">{row.size}</td>
                  <td className="py-2.5 px-3">{row.bust}</td>
                  <td className="py-2.5 px-3">{row.waist}</td>
                  <td className="py-2.5 px-3">{row.hip}</td>
                  <td className="py-2.5 px-3">{row.shoulder}</td>
                  <td className="py-2.5 px-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to measure tips */}
        <div className="mt-6 p-4 rounded-md bg-[#F5EFE8]/70 border border-[#E8DFD5] text-xs text-[#2E221F] space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-[#A45543]">
            <HelpCircle className="w-4 h-4" />
            <span>How to Measure Accurately</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#7E726D]">
            <li><strong>Bust:</strong> Measure around the fullest part of your chest with tape parallel to the floor.</li>
            <li><strong>Waist:</strong> Measure around your natural waistline, typically narrowest point above your navel.</li>
            <li><strong>Hips:</strong> Stand with feet together and measure around the widest part of your hips.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
