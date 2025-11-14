import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, ProductCategory, UnitOfMeasure, Merchant } from '../../types';
import { api } from '../../services/api';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const isEditMode = !!productToEdit;
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: Object.values(ProductCategory)[0],
        price: '',
        sizeValue: '',
        unitOfMeasure: Object.values(UnitOfMeasure)[0],
        flavorAroma: '',
    });

    const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
    const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
    const [isMerchantDropdownOpen, setIsMerchantDropdownOpen] = useState(false);
    const [merchantSearchText, setMerchantSearchText] = useState('');
    const merchantDropdownRef = useRef<HTMLDivElement>(null);
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const merchantData = await api.getMerchants();
                setAllMerchants(merchantData.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Failed to fetch merchants", error);
            }
        };

        if (isOpen) {
            fetchMerchants();
            if (isEditMode && productToEdit) {
                setFormData({
                    name: productToEdit.name,
                    brand: productToEdit.brand,
                    category: productToEdit.category,
                    price: String(productToEdit.price),
                    sizeValue: String(productToEdit.sizeValue || ''),
                    unitOfMeasure: productToEdit.unitOfMeasure || Object.values(UnitOfMeasure)[0],
                    flavorAroma: productToEdit.flavorAroma || '',
                });
                setImagePreview(productToEdit.imageUrl || null);
                setSelectedMerchants(productToEdit.merchantName ? [productToEdit.merchantName] : []);
            } else {
                setFormData({
                    name: '',
                    brand: '',
                    category: Object.values(ProductCategory)[0],
                    price: '',
                    sizeValue: '',
                    unitOfMeasure: Object.values(UnitOfMeasure)[0],
                    flavorAroma: '',
                });
                setImagePreview(null);
                setSelectedMerchants([]);
            }
            setError('');
            setMerchantSearchText('');
            setIsMerchantDropdownOpen(false);
        }
    }, [productToEdit, isEditMode, isOpen]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (merchantDropdownRef.current && !merchantDropdownRef.current.contains(event.target as Node)) {
                setIsMerchantDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMerchants = useMemo(() => {
        return allMerchants.filter(merchant => 
            merchant.name.toLowerCase().includes(merchantSearchText.toLowerCase())
        );
    }, [allMerchants, merchantSearchText]);

    const handleToggleMerchantSelection = (merchantName: string) => {
        setSelectedMerchants(prev => 
            prev.includes(merchantName) 
                ? prev.filter(name => name !== merchantName)
                : [...prev, merchantName]
        );
    };

    const handleSelectAllMerchants = () => {
        if (selectedMerchants.length === filteredMerchants.length) {
            setSelectedMerchants([]);
        } else {
            setSelectedMerchants(filteredMerchants.map(m => m.name));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = () => {
        setImagePreview(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const price = parseFloat(formData.price);
        const sizeValue = formData.sizeValue ? parseFloat(formData.sizeValue) : undefined;

        if (isNaN(price) || price < 0) {
            setError('El precio debe ser un número válido y positivo.');
            setIsSubmitting(false);
            return;
        }
        
        if (formData.sizeValue && (isNaN(sizeValue as number) || (sizeValue as number) < 0)) {
            setError('La cantidad debe ser un número válido y positivo.');
            setIsSubmitting(false);
            return;
        }

        const productPayload = {
            name: formData.name,
            brand: formData.brand,
            category: formData.category,
            price: price,
            imageUrl: imagePreview || undefined,
            sizeValue: sizeValue,
            unitOfMeasure: formData.unitOfMeasure as UnitOfMeasure,
            flavorAroma: formData.flavorAroma,
        };

        try {
            if (isEditMode && productToEdit) {
                if (productToEdit.merchantName) {
                    await api.updateProduct(productToEdit.id, { ...productPayload, merchantName: productToEdit.merchantName });
                } else {
                    await api.updateProduct(productToEdit.id, { ...productPayload, merchantName: undefined });
                    if (selectedMerchants.length > 0) {
                        await api.addProduct({ ...productPayload, stock: 0, merchantNames: selectedMerchants });
                    }
                }
            } else {
                await api.addProduct({ ...productPayload, stock: 0, merchantNames: selectedMerchants });
            }
            onSuccess();
        } catch (err) {
            setError('Ocurrió un error al guardar el producto.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isMerchantSelectionDisabled = isEditMode && !!productToEdit.merchantName;
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen del Producto</label>
                            <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div>
                                            <img src={imagePreview} alt="Vista previa del producto" className="mx-auto h-24 max-h-24 w-auto rounded-md object-contain" />
                                            <button type="button" onClick={handleRemoveImage} className="mt-2 text-xs text-red-500 hover:text-red-700">Eliminar imagen</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 focus-within:ring-primary-500">
                                                    <span>Sube un archivo</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                                </label>
                                                <p className="pl-1">o arrastra y suelta</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Producto</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comercios</label>
                            <div className="relative mt-1" ref={merchantDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsMerchantDropdownOpen(prev => !prev)}
                                    disabled={isMerchantSelectionDisabled}
                                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-200 dark:disabled:bg-gray-700"
                                >
                                    <span className="block truncate">
                                        {isMerchantSelectionDisabled ? productToEdit.merchantName : 
                                         selectedMerchants.length === 0 ? "Seleccionar (opcional: Catálogo Base)" :
                                         `${selectedMerchants.length} comercio(s) seleccionado(s)`}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06.04l2.7 2.92 2.7-2.92a.75.75 0 111.12 1.004l-3.25 3.5a.75.75 0 01-1.12 0l-3.25-3.5a.75.75 0 01.06-1.06z" clipRule="evenodd" /></svg>
                                    </span>
                                </button>
                                {isMerchantDropdownOpen && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        <div className="p-2 sticky top-0 bg-white dark:bg-gray-800">
                                            <input type="text" placeholder="Buscar comercio..." value={merchantSearchText} onChange={e => setMerchantSearchText(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500"/>
                                            <div className="mt-2 flex items-center justify-between px-1">
                                                <label htmlFor="select-all" className="text-xs font-medium text-gray-600 dark:text-gray-300">Seleccionar todos</label>
                                                <input id="select-all" type="checkbox"
                                                    checked={filteredMerchants.length > 0 && selectedMerchants.length === filteredMerchants.length}
                                                    onChange={handleSelectAllMerchants}
                                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                                />
                                            </div>
                                        </div>
                                        <ul className="overflow-y-auto">
                                            {filteredMerchants.map(merchant => (
                                                <li key={merchant.id} onClick={() => handleToggleMerchantSelection(merchant.name)} className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <span className="block truncate">{merchant.name}</span>
                                                    {selectedMerchants.includes(merchant.name) && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                            <select id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500">
                                {Object.values(ProductCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="sizeValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad (ej. 250)</label>
                            <input type="number" id="sizeValue" name="sizeValue" value={formData.sizeValue} onChange={handleChange} step="any" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad de Medida</label>
                            <select id="unitOfMeasure" name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500">
                                {Object.values(UnitOfMeasure).map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="flavorAroma" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sabor/Aroma (Opcional)</label>
                            <input type="text" id="flavorAroma" name="flavorAroma" value={formData.flavorAroma} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;