'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
export type KnowledgeCategory =
    | 'Code du travail'
    | 'Obligations DUERP'
    | 'Guides sectoriels'
    | 'Templates CONFORM+'
    | 'Base jurisprudence interne';

export type KnowledgeDoc = {
    id: string;
    title: string;
    category: KnowledgeCategory;
    file_url: string;
    mistral_file_id: string | null;
    status: string | null;
    uploaded_by: string | null;
    created_at: string;
    profiles?: { first_name: string; last_name: string } | null;
};

const CATEGORIES: KnowledgeCategory[] = [
    'Code du travail',
    'Obligations DUERP',
    'Guides sectoriels',
    'Templates CONFORM+',
    'Base jurisprudence interne',
];

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: RefreshCw },
    synced: { bg: 'bg-green-500/10', text: 'text-green-400', icon: CheckCircle2 },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: AlertCircle },
};

export default function AdminKnowledgePage() {
    const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory>('Code du travail');
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function loadDocuments() {
        const supabase = createClient();
        const { data } = await supabase
            .from('knowledge_documents')
            .select('*, profiles(first_name, last_name)')
            .order('created_at', { ascending: false });

        setDocuments((data as KnowledgeDoc[]) ?? []);
        setIsLoading(false);
    }

    useEffect(() => {
        loadDocuments();
    }, []);

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadError(null);
        const supabase = createClient();

        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${selectedCategory}/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: storageError } = await supabase.storage
                .from('knowledge_base')
                .upload(filePath, selectedFile);

            if (storageError) throw storageError;

            // 2. Insert into database (Status 'pending' initially)
            const { data: { user } } = await supabase.auth.getUser();
            const { data: doc, error: dbError } = await supabase
                .from('knowledge_documents')
                .insert({
                    title: selectedFile.name,
                    category: selectedCategory,
                    file_url: filePath,
                    status: 'pending',
                    uploaded_by: user?.id,
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 3. Trigger Mistral API Sync (via NestJS backend)
            const res = await fetch('/api/knowledge/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: doc.id }),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la synchronisation avec Mistral AI.');
            }

            // Reset form & reload
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            await loadDocuments();
        } catch (err: any) {
            setUploadError(err.message || 'Une erreur est survenue lors de l\'upload.');
        } finally {
            setIsUploading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Base de Connaissances IA</h1>
                <p className="mt-1 text-sm text-white/40">Gérez le corpus documentaire qui nourrit l&apos;Agent Mistral (RAG) de Conform+.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Formulaire d'upload */}
                <div className="rounded-xl border border-white/10 bg-[#161b22] p-6 lg:col-span-1 h-fit">
                    <div className="flex items-center gap-2 mb-5">
                        <Upload className="h-4 w-4 text-white/50" />
                        <h2 className="text-sm font-semibold text-white">Ajouter un document</h2>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs text-white/50">Fichier (PDF, TXT, DOCX)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf,.txt,.docx"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-white/60 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs text-white/50">Catégorie</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as KnowledgeCategory)}
                                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/20"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat} className="bg-[#161b22] text-white">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {uploadError && (
                            <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
                                {uploadError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedFile || isUploading}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-black transition-opacity hover:bg-white/90 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    Synchronisation Mistral...
                                </>
                            ) : (
                                'Uploader & Synchroniser'
                            )}
                        </button>
                    </form>
                </div>

                {/* Liste des documents */}
                <div className="rounded-xl border border-white/10 bg-[#161b22] lg:col-span-2 overflow-hidden">
                    <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-white/50" />
                            <h2 className="text-sm font-semibold text-white">Corpus validé ({documents.length})</h2>
                        </div>
                        <button onClick={loadDocuments} className="text-white/40 hover:text-white transition-colors" title="Rafraîchir">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30">
                                    <th className="px-6 py-3">Document</th>
                                    <th className="px-6 py-3">Catégorie</th>
                                    <th className="px-6 py-3">Statut (Mistral)</th>
                                    <th className="px-6 py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {documents.map((doc) => {
                                    const StatusIcon = statusColors[doc.status ?? 'error']?.icon || AlertCircle;
                                    return (
                                        <tr key={doc.id} className="transition-colors hover:bg-white/2">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-4 w-4 text-white/20 shrink-0" />
                                                    <span className="font-medium text-white/90 truncate max-w-[200px]" title={doc.title}>
                                                        {doc.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[10px] uppercase text-white/50">
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColors[doc.status ?? 'error']?.bg} ${statusColors[doc.status ?? 'error']?.text}`}>
                                                    <StatusIcon className={`h-3 w-3 ${doc.status === 'pending' ? 'animate-spin' : ''}`} />
                                                    {doc.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right text-xs text-white/40">
                                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-xs text-white/30">
                                            Aucun document dans la base de connaissances.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
