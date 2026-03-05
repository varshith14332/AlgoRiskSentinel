import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';

const COLORS = ['#00d4ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
    return (
        <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-5">
            <h3 className="text-sm font-medium text-sentinel-400 mb-4">{title}</h3>
            {children}
        </div>
    );
}

// ── Risk Score Distribution ──
export function RiskDistributionChart({ data }: { data: { range: string; count: number }[] }) {
    return (
        <ChartCard title="Risk Score Distribution">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3b4e" />
                    <XAxis dataKey="range" tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid #2d3b4e', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

// ── Alert Types Pie ──
export function AlertTypesChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <ChartCard title="Alerts by Type">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid #2d3b4e', borderRadius: 8, color: '#fff' }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

// ── Delay Trends ──
export function DelayTrendsChart({ data }: { data: { date: string; delays: number; onTime: number }[] }) {
    return (
        <ChartCard title="Delay Trends (7-day)">
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3b4e" />
                    <XAxis dataKey="date" tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid #2d3b4e', borderRadius: 8, color: '#fff' }} />
                    <Area type="monotone" dataKey="delays" stroke="#ef4444" fill="url(#delayGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="onTime" stroke="#22c55e" fill="url(#onTimeGrad)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

// ── Carrier Performance ──
export function CarrierPerformanceChart({ data }: { data: { carrier: string; avgScore: number; shipments: number }[] }) {
    return (
        <ChartCard title="Carrier Performance">
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3b4e" />
                    <XAxis dataKey="carrier" tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#7b8fa8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e2a3a', border: '1px solid #2d3b4e', borderRadius: 8, color: '#fff' }} />
                    <Line type="monotone" dataKey="avgScore" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}
