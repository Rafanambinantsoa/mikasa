// MODIFIED COMPONENT with PURE CSS
import React, { useMemo } from 'react';
import '../styles/dashboard/quotecard.css';

const StatusDot = ({ color }) => (
    <div className={`status-dot ${color}`} />
);

const formatPrice = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

const QuoteCard = () => {
    // Sample data - replace with your actual data
    const quotes = [
        { id: 1, etat: 'accepte', montant: 15000 },
        { id: 2, etat: 'accepte', montant: 14000 },
        { id: 3, etat: 'en attente', montant: 5000 },
        { id: 4, etat: 'refuse', montant: 6000 },
        { id: 5, etat: 'en attente', montant: 4000 },
    ];

    const statistics = useMemo(() => {
        const stats = quotes.reduce((acc, quote) => {
            const etat = quote.etat.toLowerCase();
            acc[etat] = acc[etat] || { count: 0, total: 0 };
            acc[etat].count += 1;
            acc[etat].total += quote.montant;
            return acc;
        }, {});

        const total = quotes.reduce((sum, quote) => sum + quote.montant, 0);

        return {
            accepte: stats.accepte || { count: 0, total: 0 },
            'en attente': stats['en attente'] || { count: 0, total: 0 },
            refuse: stats.refuse || { count: 0, total: 0 },
            total
        };
    }, [quotes]);

    const statusConfig = [
        {
            key: 'accepte',
            label: 'acceptés',
            color: 'success',
            percentage: (statistics.accepte.total / statistics.total) * 100
        },
        {
            key: 'en attente',
            label: 'en attente',
            color: 'warning',
            percentage: (statistics['en attente'].total / statistics.total) * 100
        },
        {
            key: 'refuse',
            label: 'refusés',
            color: 'error',
            percentage: (statistics.refuse.total / statistics.total) * 100
        }
    ];

    return (
        <div className="quote-card">
            <div className="info-block">
                {/* Header */}
                <div className="header">
                    <span>{quotes.length} devis à facturer</span>
                    <span>{formatPrice(statistics.total)}</span>
                </div>

                {/* Progress bar */}

                <div className="progress-bar">
                    {statusConfig.map(status => (
                        status.percentage > 0 && (
                            <div
                                key={status.key}
                                className={`progress-fill ${status.color}`}
                                style={{ width: `${status.percentage}%` }}
                            />
                        )
                    ))}
                </div>


                {/* Status list */}
                <div className="status-list">
                    {statusConfig.map(status => (
                        <div key={status.key} className="status-item">
                            <div className="status-left">
                                <StatusDot color={status.color} />
                                <span>{statistics[status.key].count} {status.label}</span>
                            </div>
                            <span>{formatPrice(statistics[status.key].total)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="total">
                <span>Total</span>
                <span>{formatPrice(statistics.total)}</span>
            </div>
        </div>
    );
};

export default QuoteCard;
