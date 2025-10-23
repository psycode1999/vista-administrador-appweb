import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Product, ProductCategory } from '../types';
import ProductModal from '../components/modals/ProductModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const ProductsView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [filters, setFilters] = useState({
        name: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        category: ''
    });

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredProducts = useMemo(() => {
        const normalizeString = (str: string) => 
            str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

        return products
            .filter(p => {
                const minPrice = parseFloat(filters.minPrice);
                const maxPrice = parseFloat(filters.maxPrice);
                return (
                    normalizeString(p.name).includes(normalizeString(filters.name)) &&
                    normalizeString(p.brand).includes(normalizeString(filters.brand)) &&
                    (isNaN(minPrice) || p.price >= minPrice) &&
                    (isNaN(maxPrice) || p.price <= maxPrice) &&
                    (filters.category === '' || p.category === filters.category)
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products, filters]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProductIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleAddClick = () => {
        setProductToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleEditClick = () => {
        if (selectedProductIds.length !== 1) return;
        const product = products.find(p => p.id === selectedProductIds[0]);
        if (product) {
            setProductToEdit(product);
            setIsAddEditModalOpen(true);
        }
    };

    const handleDeleteClick = () => {
        if (selectedProductIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.deleteProducts(selectedProductIds);
            setSelectedProductIds([]);
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete products", error);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleModalSuccess = () => {
        setIsAddEditModalOpen(false);
        setProductToEdit(null);
        setSelectedProductIds([]);
        fetchProducts();
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Catálogo de Productos</h1>
            
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <input type="text" name="name" placeholder="Filtrar por producto..." value={filters.name} onChange={handleFilterChange} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="text" name="brand" placeholder="Filtrar por marca..." value={filters.brand} onChange={handleFilterChange} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="number" name="minPrice" placeholder="Precio mín." value={filters.minPrice} onChange={handleFilterChange} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="number" name="maxPrice" placeholder="Precio máx." value={filters.maxPrice} onChange={handleFilterChange} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Todas las categorías</option>
                        {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6 flex space-x-3">
                <button onClick={handleAddClick} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm">Agregar producto</button>
                <button onClick={handleEditClick} disabled={selectedProductIds.length !== 1} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Editar producto</button>
                <button onClick={handleDeleteClick} disabled={selectedProductIds.length === 0} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Eliminar producto seleccionado</button>
            </div>

             <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                    disabled={filteredProducts.length === 0}
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Producto</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marca</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comercio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Cargando productos...</p>
                            </td>
                        </tr>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                           <tr key={product.id} className={`${selectedProductIds.includes(product.id) ? 'bg-primary-50 dark:bg-gray-900/50' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                                <td className="px-6 py-4">
                                    <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => handleSelectOne(product.id)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.brand}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.merchantName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock}</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                No hay productos que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            
             <ProductModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSuccess={handleModalSuccess}
                productToEdit={productToEdit}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isConfirming={isDeleting}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar ${selectedProductIds.length} producto(s) seleccionado(s)? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
            />
        </div>
    );
};

export default ProductsView;