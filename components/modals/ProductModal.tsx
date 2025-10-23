import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../../types';
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
        merchantName: '',
        category: Object.values(ProductCategory)[0],
        price: '',
        stock: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && productToEdit) {
                setFormData({
                    name: productToEdit.name,
                    brand: productToEdit.brand,
                    merchantName: productToEdit.merchantName,
                    category: productToEdit.category,
                    price: String(productToEdit.price),
                    stock: String(productToEdit.stock),
                });
            } else {
                setFormData({
                    name: '',
                    brand: '',
                    merchantName: 'Café del Sol', 
                    category: Object.values(ProductCategory)[0],
                    price: '',
                    stock: ''
                });
            }
        }
    }, [productToEdit, isEditMode, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const productData = {
            name: formData.name,
            brand: formData.brand,
            merchantName: formData.merchantName,
            category: formData.category,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
        };

        if (isNaN(productData.price) || isNaN(productData.stock) || productData.price < 0 || productData.stock < 0) {
            setError('Precio y Stock deben ser números válidos y positivos.');
            setIsSubmitting(false);
            return;
        }

        try {
            if (isEditMode && productToEdit) {
                await api.updateProduct(productToEdit.id, productData);
            } else {
                await api.addProduct(productData as Omit<Product, 'id'>);
            }
            onSuccess();
        } catch (err) {
            setError('Ocurrió un error al guardar el producto.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
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
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Producto</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                         <div>
                            <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comercio</label>
                            <select id="merchantName" name="merchantName" value={formData.merchantName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500">
                                <option>Café del Sol</option>
                                <option>Libros y Letras</option>
                                <option>Ropa Urbana Co.</option>
                                <option>TecnoGadgets</option>
                                <option>Verde Fresco</option>
                                <option>El Rincón del Gourmet</option>
                            </select>
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
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required step="1" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
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
