'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import styles from '@/styles/Module.module.css';

const routineSchema = z.object({
    assetId: z.string().min(1, 'ID do Ativo é obrigatório'),
    backupDate: z.string().min(1, 'Data do backup é obrigatória'),
    size: z.string().min(1, 'Tamanho é obrigatório'),
    status: z.string().min(1, 'Status é obrigatório'),
});

type RoutineFormValues = z.infer<typeof routineSchema>;

interface RoutineFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoutineForm({ onClose, onSuccess }: RoutineFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RoutineFormValues>({
        resolver: zodResolver(routineSchema)
    });

    const onSubmit = async (data: RoutineFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Falha ao salvar rotina');

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao salvar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Cadastrar Nova Rotina de Backup</h3>
                    <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>ID do Ativo</label>
                            <input {...register('assetId')} className={styles.input} placeholder="Ex: AST-001" />
                            {errors.assetId && <span className={styles.fieldError}>{errors.assetId.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Data do Backup</label>
                            <input type="datetime-local" {...register('backupDate')} className={styles.input} />
                            {errors.backupDate && <span className={styles.fieldError}>{errors.backupDate.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tamanho</label>
                            <input {...register('size')} className={styles.input} placeholder="Ex: 50GB" />
                            {errors.size && <span className={styles.fieldError}>{errors.size.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select {...register('status')} className={styles.input}>
                                <option value="">Selecione...</option>
                                <option value="Sucesso">Sucesso</option>
                                <option value="Erro">Erro</option>
                                <option value="Pendente">Pendente</option>
                            </select>
                            {errors.status && <span className={styles.fieldError}>{errors.status.message}</span>}
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Rotina
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
