'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import styles from '@/modules/dashboard/Dashboard.module.css';

interface SecurityAlert {
    id: string;
    type: string;
    severity: string;
    details: any;
    created_at: string;
}

export default function SecurityDashboard() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await fetch('/api/security/alerts');
                if (res.ok) {
                    const data = await res.json();
                    setAlerts(data);
                }
            } catch (error) {
                console.error("Failed to fetch alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <div className={styles.greeting} style={{ padding: '20px' }}>
                    <h1 className={styles.greetTitle} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert size={24} />
                        Painel de Monitoramento de Segurança
                    </h1>
                    <p className={styles.greetSub}>
                        Registro de tentativas de invasão, bloqueios de Rate Limit e Violações de Origens em tempo real.
                    </p>
                </div>
            </header>

            <div style={{ padding: '0 20px' }}>
                <article className={styles.chartCard} style={{ gridColumn: '1 / -1', minHeight: '400px' }}>
                    <div className={styles.cardHeader} style={{ background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div className={styles.cardTitleWrap}>
                            <AlertCircle size={18} color="#ef4444" />
                            <span className={styles.cardTitle} style={{ color: '#ef4444' }}>Acionamentos de Defesa Recentes</span>
                        </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                        {loading && alerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                Carregando sensores...
                            </div>
                        ) : alerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#10b981', fontWeight: '500' }}>
                                Nenhuma anomalia detectada no momento. Ambiente seguro.
                            </div>
                        ) : (
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {alerts.map(alert => (
                                    <div key={alert.id} style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
                                        <div style={{
                                            marginTop: '6px',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            background: alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'HIGH' ? '#f97316' : '#eab308'
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {alert.type.replace('_', ' ')}
                                                </h4>
                                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--surface-1)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                                {JSON.stringify(alert.details, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </div>
    );
}
