import React, { useMemo, useState } from 'react';
import { Dataset } from '../types';
import { getFrequencyMap, getColumnStats, calculateCorrelation } from '../utils/analytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { Activity, Users, AlertTriangle, TrendingUp, Filter, XCircle } from 'lucide-react';

interface DashboardProps {
  dataset: Dataset;
}

const COLORS = ['#0ea5e9', '#22c55e', '#e11d48', '#f59e0b', '#8b5cf6', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ dataset }) => {
  
  // -- State for Slicers (Power BI Style Filters) --
  const [activeFilter, setActiveFilter] = useState<{col: string, val: string} | null>(null);

  // -- 1. Target Column Detection (Diagnosis) --
  const targetCol = useMemo(() => {
    const candidates = ['lungs', 'outcome', 'class', 'target', 'benign_malignant'];
    return dataset.categoricalColumns.find(c => candidates.some(can => c.toLowerCase().includes(can))) || dataset.categoricalColumns[0];
  }, [dataset]);

  // -- 2. Slicing Logic --
  const filteredData = useMemo(() => {
    if (!activeFilter) return dataset.data;
    return dataset.data.filter(row => String(row[activeFilter.col]) === activeFilter.val);
  }, [dataset, activeFilter]);

  // -- 3. Compute Metrics based on Filtered Data --
  
  const targetDistribution = useMemo(() => {
    if (!targetCol) return [];
    // If we are filtering, we still want to show the distribution of the filtered set
    return getFrequencyMap(filteredData, targetCol);
  }, [filteredData, targetCol]);

  const keyMetricCol = useMemo(() => {
    const candidates = ['radius_mean', 'area_mean', 'perimeter_mean', 'age'];
    return dataset.numericColumns.find(c => candidates.some(can => c.toLowerCase().includes(can))) || dataset.numericColumns[0];
  }, [dataset]);

  const keyMetricStats = useMemo(() => {
    return keyMetricCol ? getColumnStats(filteredData, keyMetricCol) : null;
  }, [filteredData, keyMetricCol]);

  const scatterData = useMemo(() => {
    if (dataset.numericColumns.length < 2) return [];
    const xCol = dataset.numericColumns[0];
    const yCol = dataset.numericColumns[1];
    // Sample down to 200 points for performance if large
    return filteredData.slice(0, 200).map((row, i) => ({
      x: row[xCol],
      y: row[yCol],
      z: 10,
      name: `P${i}`
    }));
  }, [filteredData, dataset]);

  const correlationData = useMemo(() => {
     if (!keyMetricCol) return [];
     // Correlation is usually calculated on whole dataset for accuracy, 
     // but if filtered subset is large enough, it can be interesting. 
     // We'll stick to full dataset for correlation to represent "Global Trends" vs "Local View".
     // Or we can use filteredData. Let's use filteredData to be true "Slicer" behavior if enough data.
     const sourceData = filteredData.length > 5 ? filteredData : dataset.data;
     
     return dataset.numericColumns.slice(0, 6).map(col => ({
       name: col,
       correlation: calculateCorrelation(sourceData, keyMetricCol, col)
     })).filter(d => d.name !== keyMetricCol);
  }, [dataset, filteredData, keyMetricCol]);

  // -- Slicer Options Generator --
  // We only create slicers for categorical columns with < 10 unique values
  const slicerOptions = useMemo(() => {
    return dataset.categoricalColumns.map(col => {
      const uniqueVals = Array.from(new Set(dataset.data.map(d => String(d[col]))));
      if (uniqueVals.length > 10) return null;
      return { col, vals: uniqueVals };
    }).filter(Boolean) as { col: string, vals: string[] }[];
  }, [dataset]);


  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Slicer Bar (Power BI Style) */}
      {slicerOptions.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-500">
             <Filter size={16} />
             <span>DATA SLICERS</span>
           </div>
           <div className="flex flex-wrap gap-4">
              {slicerOptions.map((slicer) => (
                <div key={slicer.col} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-400 uppercase">{slicer.col}</span>
                  <div className="flex flex-wrap gap-2">
                    {slicer.vals.map(val => {
                      const isActive = activeFilter?.col === slicer.col && activeFilter?.val === val;
                      return (
                        <button
                          key={val}
                          onClick={() => setActiveFilter(isActive ? null : { col: slicer.col, val })}
                          className={`px-3 py-1 text-sm rounded-md border transition-all ${
                            isActive 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {activeFilter && (
                <button 
                  onClick={() => setActiveFilter(null)}
                  className="self-end ml-auto flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium px-3 py-2"
                >
                  <XCircle size={14} /> Clear Filters
                </button>
              )}
           </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Patients (Filtered)</p>
            <h3 className="text-2xl font-bold text-slate-800">{filteredData.length} <span className="text-xs text-slate-400 font-normal">/ {dataset.rowCount}</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 border-l-4 border-l-rose-500">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Primary Factor</p>
            <h3 className="text-lg font-bold text-slate-800 truncate max-w-[150px]" title={targetCol || 'N/A'}>
              {targetCol ? targetCol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg {keyMetricCol?.split('_')[0] || 'Value'}</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {keyMetricStats ? keyMetricStats.mean.toFixed(2) : '0.00'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Deviation</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {keyMetricStats ? keyMetricStats.stdDev.toFixed(2) : '0.00'}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Diagnosis Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col relative overflow-hidden">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             Distribution by {targetCol}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {targetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Feature Correlation to Key Metric */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            Correlation Factors (vs {keyMetricCol})
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={correlationData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[-1, 1]} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="correlation" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Bi-Variate Analysis ({dataset.numericColumns[0]} vs {dataset.numericColumns[1]})
              </h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Interactive Scatter</span>
           </div>
           
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name={dataset.numericColumns[0]} unit="" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis type="number" dataKey="y" name={dataset.numericColumns[1]} unit="" tick={{fontSize: 12, fill: '#64748b'}} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Scatter name="Patients" data={scatterData} fill="#8b5cf6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};