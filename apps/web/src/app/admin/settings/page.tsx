'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AppSetting {
    id: string;
    key: string;
    value: any;
    description: string;
    updated_at: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null); // key of the currently saving setting
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Pour stocker temporairement la saisie avant la sauvegarde
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    async function loadSettings() {
        setIsLoading(true);
        try {
            const data = await api.get<AppSetting[]>('/admin/settings');

            setSettings(data);

            // Initialize edit values
            const initialValues: Record<string, string> = {};
            data.forEach((s: AppSetting) => {
                initialValues[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
            });
            setEditValues(initialValues);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadSettings();
    }, []);

    async function handleSave(setting: AppSetting) {
        setIsSaving(setting.key);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await api.patch(`/admin/settings/${setting.key}`, {
                value: editValues[setting.key],
            });

            setSuccessMsg(`Paramètre ${setting.key} mis à jour avec succès.`);
            await loadSettings();
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(null);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Settings className="h-6 w-6 text-white/50" /> Paramètres Globaux (Variables)
                </h1>
                <p className="mt-1 text-sm text-white/40">Gérez les configurations générales, les tarifs SaaS et les fonctionnalités de Conform+.</p>
            </div>

            {successMsg && (
                <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-400 border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                    <AlertCircle className="h-4 w-4" />
                    {errorMsg}
                </div>
            )}

            <div className="rounded-xl border border-white/10 bg-[#161b22] px-6 py-4">
                <div className="divide-y divide-white/5">
                    {settings.map((setting) => (
                        <div key={setting.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="max-w-xl">
                                <code className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                    {setting.key}
                                </code>
                                <p className="mt-2 text-sm text-white/80">{setting.description}</p>
                                <p className="mt-1 text-[10px] text-white/30">
                                    Dernière mise à jour : {new Date(setting.updated_at).toLocaleString('fr-FR')}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="text"
                                    value={editValues[setting.key] || ''}
                                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                                    className="w-full sm:w-64 rounded-md border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                    placeholder="Valeur"
                                />

                                <button
                                    onClick={() => handleSave(setting)}
                                    disabled={isSaving === setting.key || editValues[setting.key] === String(setting.value)}
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                                >
                                    {isSaving === setting.key ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    ))}

                    {settings.length === 0 && (
                        <div className="py-8 text-center text-sm text-white/40">
                            Aucun paramètre global configuré dans la base de données.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
