"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Check,
    X,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertTriangle,
    Save,
    Image as ImageIcon,
    UploadCloud
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { cn } from "@/lib/utils";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

export default function OwnerMenuPage() {
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<"FOOD" | "FRUIT">("FOOD");
    const { setIsLoading } = useLoader();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchMenu = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/menu");
            setItems(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch menu");
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const toggleStock = async (id: string, currentStatus: boolean) => {
        setIsLoading(true);
        try {
            await api.patch(`/menu/${id}/stock`);
            toast.success(`Item marked as ${!currentStatus ? 'Sold Out' : 'In Stock'}`);
            fetchMenu();
        } catch (error) {
            toast.error("Failed to update stock status");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setIsLoading(true);
        try {
            await api.delete(`/menu/${deletingItem.id}`);
            toast.success("Item deleted successfully");
            setDeletingItem(null);
            fetchMenu();
        } catch (error) {
            toast.error("Failed to delete item");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.type === activeType &&
        (item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category?.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const existingCategories = Array.from(new Set(items.filter(i => i.type === activeType).map(i => i.category).filter(Boolean)));

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Menu Management</h1>
                    <p className="text-text-muted text-sm font-medium text-zinc-400">Create and adjust your kitchen offerings.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary px-8 py-3.5 shadow-xl shadow-brand-primary/10"
                >
                    <Plus size={20} />
                    <span>Add New Item</span>
                </button>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex bg-zinc-100 p-1 rounded-2xl w-full sm:w-auto">
                    <button
                        onClick={() => { setActiveType("FOOD"); setCurrentPage(1); }}
                        className={cn(
                            "flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            activeType === "FOOD" ? "bg-white text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                        )}
                    >
                        Food Menu
                    </button>
                    <button
                        onClick={() => { setActiveType("FRUIT"); setCurrentPage(1); }}
                        className={cn(
                            "flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            activeType === "FRUIT" ? "bg-white text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                        )}
                    >
                        Fruit Bowl
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="input-field pl-12 py-2.5"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Responsive List/Table */}
            <div className="card overflow-hidden border-zinc-200">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Item Detail</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {paginatedItems.length > 0 ? (
                                paginatedItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl border border-zinc-200 overflow-hidden flex-shrink-0">
                                                    <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-text-main truncate max-w-[200px]">{item.name}</p>
                                                    <p className="text-[10px] text-text-muted font-medium truncate max-w-[200px]">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md uppercase tracking-wider">
                                                {item.category || "General"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-text-main">
                                            ₹{item.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleStock(item.id, item.isOutOfStock)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                                                        !item.isOutOfStock
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                                            : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                                                    )}
                                                >
                                                    {!item.isOutOfStock ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                                                    <span>{!item.isOutOfStock ? "In Stock" : "Sold Out"}</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="p-2 text-text-muted hover:text-brand-primary active:scale-95 transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingItem(item)}
                                                    className="p-2 text-text-muted hover:text-rose-600 active:scale-95 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">
                                        No items found. Add some to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden divide-y divide-zinc-100">
                    {paginatedItems.length > 0 ? (
                        paginatedItems.map((item) => (
                            <div key={item.id} className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden flex-shrink-0">
                                        <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-text-main truncate pr-2">{item.name}</p>
                                            <p className="font-black text-brand-primary">₹{item.price}</p>
                                        </div>
                                        <p className="text-[10px] text-text-muted font-medium line-clamp-1">{item.description}</p>
                                        <div className="mt-2 text-[9px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded inline-block uppercase tracking-wider">
                                            {item.category || "General"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <button
                                        onClick={() => toggleStock(item.id, item.isOutOfStock)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                            !item.isOutOfStock
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : "bg-rose-50 text-rose-700 border-rose-100"
                                        )}
                                    >
                                        {!item.isOutOfStock ? <Check size={14} /> : <X size={14} />}
                                        <span>{!item.isOutOfStock ? "In Stock" : "Sold Out"}</span>
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-2.5 bg-zinc-50 border border-zinc-200 text-text-main rounded-xl active:scale-95"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingItem(item)}
                                            className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-text-muted text-sm font-medium italic">
                            No kitchen entries found.
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 bg-white border border-zinc-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {(showAddModal || editingItem) && (
                    <ItemModal
                        item={editingItem}
                        type={activeType}
                        onClose={() => { setShowAddModal(false); setEditingItem(null); }}
                        onSuccess={() => { fetchMenu(); setShowAddModal(false); setEditingItem(null); }}
                        existingCategories={existingCategories}
                    />
                )}

                {deletingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="card max-w-sm w-full p-8 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Delete Item?</h3>
                                <p className="text-sm text-text-muted mb-8 leading-relaxed">
                                    Are you sure you want to delete <span className="font-bold text-text-main">"{deletingItem.name}"</span>? This cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setDeletingItem(null)} className="btn btn-secondary flex-1 py-3 text-xs font-bold uppercase tracking-widest">Cancel</button>
                                    <button onClick={handleDelete} className="btn bg-rose-600 hover:bg-rose-700 text-white flex-1 py-3 text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-200">Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ItemModal({ item, type, onClose, onSuccess, existingCategories }: any) {
    const isEdit = !!item;
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: item?.name || "",
        price: item?.price || "",
        category: item?.category || "",
        newCategory: "",
        description: item?.description || "",
        imageUrl: item?.imageUrl || "",
        isOutOfStock: item?.isOutOfStock || false
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        setUploading(true);
        const data = new FormData();
        Array.from(files).forEach(file => data.append("images", file));

        try {
            const response = await api.post("/upload", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const firstImage = response.data.data[0].url;
            setFormData(prev => ({ ...prev, imageUrl: firstImage }));
            toast.success("Images uploaded successfully");
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const category = formData.category === "NEW" ? formData.newCategory : formData.category;
            if (!category) {
                toast.error("Category is required");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                category,
                price: Number(formData.price),
                type
            };

            if (isEdit) {
                await api.put(`/menu/${item.id}`, payload);
            } else {
                await api.post("/menu", payload);
            }
            toast.success(`Item ${isEdit ? 'updated' : 'created'} successfully`);
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end md:p-6 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="bg-white w-full max-w-xl h-full md:h-auto md:max-h-[90vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
                <header className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-text-main">{isEdit ? "Edit Item" : "New Item"}</h2>
                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Configure {type} Details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    {/* Image Preview & Upload */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Media Assets</label>
                        <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden group">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-zinc-300" size={32} />
                                )}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                                >
                                    <UploadCloud size={20} />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-[11px] font-bold text-text-main mb-1">Click to upload media</p>
                                <p className="text-[9px] text-text-muted">Max 5 images. High quality JPG/PNG preferred.</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                                {uploading && (
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-brand-primary font-bold animate-pulse">
                                        <Loader2 size={12} className="animate-spin" />
                                        Optimizing Assets...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Item Name</label>
                        <input
                            required
                            className="input-field"
                            placeholder="e.g. Special Butter Paneer"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Price (₹)</label>
                            <input
                                required
                                type="number"
                                className="input-field"
                                placeholder="299"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Category</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {existingCategories.map((c: string) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="NEW">+ Create New</option>
                            </select>
                        </div>
                    </div>

                    {formData.category === "NEW" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <label className="text-[10px] font-bold text-brand-primary uppercase tracking-widest ml-1">New Category Name</label>
                            <input
                                required
                                className="input-field border-brand-primary/30 bg-brand-primary/5 focus:border-brand-primary"
                                placeholder="Enter new category name..."
                                value={formData.newCategory}
                                onChange={e => setFormData({ ...formData, newCategory: e.target.value })}
                            />
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Short Description</label>
                        <textarea
                            className="input-field min-h-[100px] py-4"
                            placeholder="What makes this dish special?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-main">Stock Availability</span>
                            <span className="text-[10px] text-text-muted font-medium">Mark as sold out temporarily</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isOutOfStock: !formData.isOutOfStock })}
                            className={cn(
                                "relative w-12 h-6 rounded-full transition-colors duration-300",
                                formData.isOutOfStock ? "bg-rose-500" : "bg-emerald-500"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                                formData.isOutOfStock ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>
                </form>

                <footer className="p-6 md:p-8 border-t border-zinc-100 flex gap-4 bg-zinc-50/30">
                    <button onClick={onClose} className="btn btn-secondary flex-1 py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100">Discard</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="btn btn-primary flex-[2] py-4 shadow-xl shadow-brand-primary/20"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {isEdit ? "Update Entry" : "Add to Kitchen"}</>}
                    </button>
                </footer>
            </motion.div>
        </div>
    );
}
