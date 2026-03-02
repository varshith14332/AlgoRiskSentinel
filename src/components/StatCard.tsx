interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    color?: 'accent' | 'green' | 'yellow' | 'red';
}

const colorMap = {
    accent: 'from-accent/20 to-accent/5 border-accent/20',
    green: 'from-risk-low/20 to-risk-low/5 border-risk-low/20',
    yellow: 'from-risk-medium/20 to-risk-medium/5 border-risk-medium/20',
    red: 'from-risk-high/20 to-risk-high/5 border-risk-high/20',
};

const iconBg = {
    accent: 'bg-accent/20 text-accent',
    green: 'bg-risk-low/20 text-risk-low',
    yellow: 'bg-risk-medium/20 text-risk-medium',
    red: 'bg-risk-high/20 text-risk-high',
};

export default function StatCard({ title, value, icon, trend, color = 'accent' }: StatCardProps) {
    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-sentinel-400 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {trend && <p className="text-xs text-sentinel-400 mt-1">{trend}</p>}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${iconBg[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
