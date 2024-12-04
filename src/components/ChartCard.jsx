import React from 'react';
import { BarChart } from '@mantine/charts';

const ChartCard = ({ budgetData }) => {
    // Check if budgetData exists and has the expected structure
    if (!budgetData || !budgetData.previsionnel || !budgetData.reel) {
        return <div>No budget data available</div>;
    }

    // Directly create the chart data from the budget object structure
    const chartData = [
        {
            category: "Main d'oeuvre",
            "Budget réel": budgetData.reel.mo || 0,
            "Budget prévisionnel": budgetData.previsionnel.mo || 0,
        },
        {
            category: "Matériaux",
            "Budget réel": budgetData.reel.materiaux || 0,
            "Budget prévisionnel": budgetData.previsionnel.materiaux || 0,
        },
        {
            category: "Matériels",
            "Budget réel": budgetData.reel.materiels || 0,
            "Budget prévisionnel": budgetData.previsionnel.materiels || 0,
        },
        {
            category: "Sous-Traitance",
            "Budget réel": budgetData.reel.sous_traitance || 0,
            "Budget prévisionnel": budgetData.previsionnel.sous_traitance || 0,
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <BarChart
                h={250}
                data={chartData}
                dataKey="category"
                series={[
                    { name: 'Budget réel', color: '#40A7FF', dataKey: 'Budget réel' },
                    { name: 'Budget prévisionnel', color: '#FF8A3D', dataKey: 'Budget prévisionnel' }
                ]}
                orientation="horizontal"
                radius={6}
                gridAxis="y"
                tooltipProps={{
                    content: ({ payload, label }) => {
                        if (payload && payload.length > 0) {
                            return (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}>
                                    <div>{label}</div>
                                    {payload.map((entry, index) => (
                                        <div key={index} style={{ color: entry.color }}>
                                            {entry.name}: {entry.value.toLocaleString()}€
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    },
                }}
                tooltipAnimationDuration={200}
                yAxisProps={{
                    tickLine: false,
                    axisLine: false,
                }}
                xAxisProps={{
                    tickLine: false,
                    axisLine: false,
                }}
            />
        </div>
    );
};

export default ChartCard;