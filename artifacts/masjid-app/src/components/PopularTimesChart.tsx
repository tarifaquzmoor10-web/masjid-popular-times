import { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { PopularTimesData } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PopularTimesChartProps {
  data: PopularTimesData;
}

export default function PopularTimesChart({ data }: PopularTimesChartProps) {
  const chartRef = useRef<any>(null);

  const barColors = useMemo(() =>
    data.slots.map(s =>
      s.percentage <= 25 ? 'rgba(34,197,94,0.65)'
      : s.percentage <= 50 ? 'rgba(74,222,128,0.65)'
      : s.percentage <= 75 ? 'rgba(234,179,8,0.65)'
      : 'rgba(249,115,22,0.75)'
    ), [data]);

  const borderColors = useMemo(() =>
    data.slots.map(s =>
      s.percentage <= 25 ? 'rgba(34,197,94,0.9)'
      : s.percentage <= 50 ? 'rgba(74,222,128,0.9)'
      : s.percentage <= 75 ? 'rgba(234,179,8,0.9)'
      : 'rgba(249,115,22,0.9)'
    ), [data]);

  const chartData = {
    labels: data.slots.map(s => s.label),
    datasets: [{
      label: 'Crowd Level',
      data: data.slots.map(s => s.percentage),
      backgroundColor: barColors,
      borderColor: borderColors,
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 28,
      maxBarThickness: 36,
    }],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
      delay: (ctx: any) => ctx.dataIndex * 100,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(6,18,11,0.97)',
        titleColor: '#f0d78c', bodyColor: '#eef2ef',
        borderColor: 'rgba(45,122,79,0.25)', borderWidth: 1,
        cornerRadius: 14, padding: 12,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        callbacks: {
          title: (items: any[]) => `${data.slots[items[0].dataIndex].icon} ${data.slots[items[0].dataIndex].label}`,
          label: (item: any) => {
            const slot = data.slots[item.dataIndex];
            const levels: Record<string, string> = { low: '🟢 Quiet', medium: '🟡 Moderate', high: '🟠 Busy', very_high: '🔴 Very Busy' };
            return [`Crowd: ${slot.percentage}%`, levels[slot.level], `${slot.count} visits`];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 9, family: "'DM Sans', sans-serif", weight: '500' }, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(45,122,79,0.06)' },
        ticks: { color: 'rgba(255,255,255,0.18)', font: { size: 8 }, stepSize: 25, callback: (v: number) => `${v}%` },
        border: { display: false },
      },
    },
  };

  return (
    <div className="glass-strong" style={{
      borderRadius: 22, padding: '18px',
      borderColor: 'rgba(45,122,79,0.12)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef2ef', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊</span> Popular Times
          </h3>
          <p style={{ fontSize: 10, marginTop: 2, color: 'rgba(255,255,255,0.3)' }}>Crowd level by prayer</p>
        </div>
        <div className="glass-gold" style={{ borderRadius: 12, padding: '5px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#f0d78c' }}>{data.totalVisits} visits</p>
        </div>
      </div>

      <div style={{ height: 200, background: 'rgba(6,18,11,0.3)', borderRadius: 16, padding: '10px 8px', border: '1px solid rgba(45,122,79,0.06)' }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(45,122,79,0.08)' }}>
        {[
          { color: 'rgba(34,197,94,0.7)', label: 'Quiet' },
          { color: 'rgba(74,222,128,0.7)', label: 'Moderate' },
          { color: 'rgba(234,179,8,0.7)', label: 'Busy' },
          { color: 'rgba(249,115,22,0.8)', label: 'Very Busy' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
