// src/pages/AdminCouponDetails.tsx
import React, { useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCoupon } from '../hooks/useCoupon';
import { updateCoupon, requestImageSignedUrl, uploadToSignedUrl, saveOriginalImageRow } from '../lib/api';

function toLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return ''; // avoid RangeError
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminCouponDetails() {
    const { couponId = '' } = useParams<{ couponId: string }>();
    const { data, loading, error, token, reload } = useCoupon(couponId);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imgBusy, setImgBusy] = useState(false);
    const cover = data?.coverImage ?? null;

    const [form, setForm] = useState(() => ({
        title: '',
        description: '',
        terms: '',
        codeType: 'single' as 'single' | 'multiple',
        code: '',
        totalLimit: '' as string | number,
        perUserPerMonthLimit: '' as string | number,
        limitType: 'none' as 'none' | 'global' | 'per_user_per_month',
        published: false,
        startDate: '',
        endDate: '',
        category: '',
        boosted: false,
    }));
    const fileRef = useRef<HTMLInputElement>(null);


    React.useEffect(() => {
        if (!data) return;
        setForm({
            title: data.title,
            description: data.description,
            terms: data.terms,
            codeType: data.codeType,
            code: data.code ?? '',
            totalLimit: data.totalLimit ?? '',
            perUserPerMonthLimit: data.perUserPerMonthLimit ?? '',
            limitType: data.limitType,
            published: data.published,
            startDate: toLocalInput(data.startDate),
            endDate: toLocalInput(data.endDate),
            category: data.category,
            boosted: data.boosted,
        });
    }, [data?.id]); // reset when a new coupon loads

    const canSave = useMemo(() => !!form.title.trim(), [form.title]);

    async function onSave() {
        if (!token || !data) return;
        setSaving(true);
        try {
            await updateCoupon(data.id, token, {
                title: form.title.trim(),
                description: form.description,
                terms: form.terms,
                codeType: form.codeType,
                code: form.codeType === 'single' ? (form.code || null) : null,

                limitType: form.limitType,
                totalLimit:
                    form.limitType === 'global'
                        ? (form.totalLimit === '' ? null : Number(form.totalLimit))
                        : null,
                perUserPerMonthLimit:
                    form.limitType === 'per_user_per_month'
                        ? (form.perUserPerMonthLimit === '' ? null : Number(form.perUserPerMonthLimit))
                        : null,

                published: form.published,
                boosted: form.boosted,

                // keep "datetime-local" strings; backend converts safely
                startDate: form.startDate || null,
                endDate: form.endDate || null,

                category: form.category,
            });
            setEditing(false);
            await reload();
        } catch (e) {
            alert((e as any).message ?? 'Save failed');
        } finally {
            setSaving(false);
        }
    }


    const onReplaceImage = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        if (!token || !data) return;
        const inputEl = ev.currentTarget;          // keep a stable reference
        const file = inputEl.files?.[0];
        if (!file) return;

        setImgBusy(true);
        try {
            const contentType = file.type || 'image/jpeg';
            // pick extension consistently from MIME when possible
            const ext =
                (file.name.split('.').pop()?.toLowerCase()) ||
                (contentType.includes('png') ? 'png' :
                    contentType.includes('webp') ? 'webp' : 'jpg');

            const { uploadUrl, storagePath } =
                await requestImageSignedUrl(token, data.id, ext, contentType);

            await uploadToSignedUrl(uploadUrl, file, contentType);
            await saveOriginalImageRow(token, data.id, storagePath, contentType, file.size);

            await reload();
        } catch (e: any) {
            alert(e?.message ?? 'Image replace failed');
        } finally {
            setImgBusy(false);
            // clear so the same file can be re-picked if needed
            if (fileRef.current) fileRef.current.value = '';
        }
    };



    if (loading) return <div className="p-6">Loading…</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
    if (!data) return <div className="p-6">Not found</div>;

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-start gap-6">
                {/* Only ONE image: the cover */}
                <div className="w-64">
                    <div className="w-64 h-40 bg-gray-100 rounded-xl shadow overflow-hidden flex items-center justify-center">
                        {cover?.url ? (
                            <img
                                key={cover?.storagePath}                    // 👈 forces a fresh node
                                src={cover?.url || '/tucheck.png'}
                                alt={data?.title || 'cover'}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/tucheck.png'; }}
                            />
                        ) : (
                            <div className="text-gray-400 text-sm">No image</div>
                        )}
                    </div>
                    <label className="block mt-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm cursor-pointer">
                            {imgBusy ? 'Uploading…' : 'Replace image'}
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            ref={fileRef}                         // <-- attach ref
                            onChange={onReplaceImage}
                            disabled={imgBusy}
                        />
                    </label>
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">{data.title}</h1>
                        <div className="flex gap-2">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onSave}
                                        className="px-3 py-1.5 rounded-md bg-blue-600 text-white disabled:opacity-50"
                                        disabled={!canSave || saving}
                                    >
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* meta */}
                    <div className="text-sm text-gray-600 mt-1 space-x-4">
                        {data.brand && <span>Brand: <b>{data.brand.name}</b></span>}
                        {data.company && <span>Company: <b>{data.company.name}</b></span>}
                        <span>Category: <b>{data.category}</b></span>
                    </div>

                    {!editing ? (
                        <>
                            <p className="mt-2 text-gray-700">{data.description}</p>
                            <p className="mt-2 text-gray-500 text-sm">Terms: {data.terms}</p>
                            <div className="mt-3 text-sm">
                                Code type: <b>{data.codeType}</b>
                                {data.code ? <span className="ml-2">Code: <code>{data.code}</code></span> : null}
                                <span className="ml-4">Published: <b>{data.published ? 'Yes' : 'No'}</b></span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Redemptions: <b>{data.counts.redemptions}</b>
                                <span className="ml-4">Codes: <b>{data.counts.codes}</b></span>
                            </div>
                        </>
                    ) : (
                        /* EDIT FORM */
                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div>
                                <label className="block text-sm text-gray-600">Title</label>
                                <input
                                    className="w-full mt-1 px-3 py-2 border rounded-md"
                                    value={form.title}
                                    onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">Description</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 border rounded-md"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">Terms</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 border rounded-md"
                                    rows={2}
                                    value={form.terms}
                                    onChange={(e) => setForm(s => ({ ...s, terms: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600">Code type</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.codeType}
                                        onChange={(e) => setForm(s => ({ ...s, codeType: e.target.value as any }))}
                                    >
                                        <option value="single">single</option>
                                        <option value="multiple">multiple</option>
                                    </select>
                                </div>

                                {form.codeType === 'single' && (
                                    <div>
                                        <label className="block text-sm text-gray-600">Code</label>
                                        <input
                                            className="w-full mt-1 px-3 py-2 border rounded-md"
                                            value={form.code}
                                            onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600">Total limit</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.totalLimit}
                                        onChange={(e) => setForm(s => ({ ...s, totalLimit: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Per-user / month</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.perUserPerMonthLimit}
                                        onChange={(e) => setForm(s => ({ ...s, perUserPerMonthLimit: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Limit type</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.limitType}
                                        onChange={(e) => setForm(s => ({ ...s, limitType: e.target.value as any }))}
                                    >
                                        <option value="none">none</option>
                                        <option value="global">global</option>
                                        <option value="per_user_per_month">per_user_per_month</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600">Start</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.startDate}
                                        onChange={(e) => setForm(s => ({ ...s, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">End</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.endDate}
                                        onChange={(e) => setForm(s => ({ ...s, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600">Category</label>
                                    <input
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                        value={form.category}
                                        onChange={(e) => setForm(s => ({ ...s, category: e.target.value }))}
                                    />
                                </div>
                                <label className="flex items-center gap-2 mt-7">
                                    <input
                                        type="checkbox"
                                        checked={form.published}
                                        onChange={(e) => setForm(s => ({ ...s, published: e.target.checked }))}
                                    />
                                    <span>Published</span>
                                </label>
                                <label className="flex items-center gap-2 mt-7">
                                    <input
                                        type="checkbox"
                                        checked={form.boosted}
                                        onChange={(e) => setForm(s => ({ ...s, boosted: e.target.checked }))}
                                    />
                                    <span>Boosted</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-sm">
                <Link className="text-blue-600 underline" to="/admin/coupons">← Back to coupons</Link>
            </div>
        </div>
    );
}
