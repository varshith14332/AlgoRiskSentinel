import { RiskDistributionChart, AlertTypesChart, DelayTrendsChart, CarrierPerformanceChart } from '../components/RiskCharts';

export default function Analytics() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Risk Intelligence Analytics</h1>
                <p className="text-sm text-sentinel-400 mt-1">AI-powered supply chain analytics and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskDistributionChart data={[]} />
                <AlertTypesChart data={[]} />
                <DelayTrendsChart data={[]} />
                <CarrierPerformanceChart data={[]} />
            </div>

            {/* AI Insights Panel */}
            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">AI Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-sentinel-900/50 rounded-lg p-4 border border-sentinel-700">
                        <p className="text-xs text-sentinel-400 mb-2">Prediction</p>
                        <p className="text-sm text-white font-medium">Delay probability for SpeedLogistics shipments is <span className="text-risk-high">38% above average</span></p>
                    </div>
                    <div className="bg-sentinel-900/50 rounded-lg p-4 border border-sentinel-700">
                        <p className="text-xs text-sentinel-400 mb-2">Anomaly</p>
                        <p className="text-sm text-white font-medium">Route deviations detected in <span className="text-risk-medium">2 shipments</span> this week</p>
                    </div>
                    <div className="bg-sentinel-900/50 rounded-lg p-4 border border-sentinel-700">
                        <p className="text-xs text-sentinel-400 mb-2">Trend</p>
                        <p className="text-sm text-white font-medium">Overall risk score trending <span className="text-risk-low">5% lower</span> vs last week</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
