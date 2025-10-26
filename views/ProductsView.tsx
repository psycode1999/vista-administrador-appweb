import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Product, ProductCategory, Merchant, UnitOfMeasure } from '../types';
import ProductModal from '../components/modals/ProductModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';

type MerchantWithCount = Merchant & { productCount: number };
type ProductWithSales = Product & { totalSales: number; totalUnits: number; };
type ProductWithGlobalSales = Product & { totalSales: number; totalUnits: number; };

const MerchantsTabContent = () => {
    const [merchants, setMerchants] = useState<MerchantWithCount[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithCount | null>(null);
    const [merchantProducts, setMerchantProducts] = useState<ProductWithSales[]>([]);
    const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingMerchants(true);
            try {
                const [merchantsData, productsData] = await Promise.all([
                    api.getMerchants(),
                    api.getProducts()
                ]);

                const productCounts = productsData.reduce((acc, product) => {
                    const merchant = merchantsData.find(m => m.name === product.merchantName);
                    if (merchant) {
                        acc[merchant.id] = (acc[merchant.id] || 0) + 1;
                    }
                    return acc;
                }, {} as Record<string, number>);

                const merchantsWithCount = merchantsData.map(m => ({
                    ...m,
                    productCount: productCounts[m.id] || 0,
                })).sort((a, b) => a.name.localeCompare(b.name));

                setMerchants(merchantsWithCount);
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch initial data for merchants tab", error);
            } finally {
                setIsLoadingMerchants(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!selectedMerchant) {
                setMerchantProducts([]);
                return;
            }
            setIsLoadingProducts(true);
            try {
                const productsForMerchant = products.filter(p => p.merchantName === selectedMerchant.name);
                const productIds = productsForMerchant.map(p => p.id);
                const salesMap = await api.getSalesForProductsByMerchant(selectedMerchant.id, productIds);
                
                const productsWithSales = productsForMerchant.map(p => {
                    const salesData = salesMap.get(p.id) || { totalSales: 0, totalUnits: 0 };
                    return {
                        ...p,
                        totalSales: salesData.totalSales,
                        totalUnits: salesData.totalUnits,
                    };
                });

                setMerchantProducts(productsWithSales);
            } catch (error) {
                console.error("Failed to fetch product sales data", error);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchProductDetails();
    }, [selectedMerchant, products]);
    
    const productHeaders = ['Nombre', 'Marca', 'Cantidad', 'Unidad', 'Sabor/Aroma', 'Categoría', 'Precio', 'Total Ventas', 'Total Unidades Vendidas'];

    return (
        <div className="flex flex-col md:flex-row gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="w-full md:w-1/3 border-r dark:border-gray-700 pr-0 md:pr-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Comercios</h3>
                {isLoadingMerchants ? (
                     <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : (
                    <ul className="overflow-y-auto h-full space-y-1">
                        {merchants.map(merchant => (
                            <li key={merchant.id}>
                                <button 
                                    onClick={() => setSelectedMerchant(merchant)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedMerchant?.id === merchant.id ? 'bg-primary-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-900/50'}`}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white">{merchant.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{merchant.productCount} producto{merchant.productCount !== 1 ? 's' : ''}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-full md:w-2/3">
                 {!selectedMerchant ? (
                    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-gray-500">Selecciona un comercio para ver su catálogo.</p>
                    </div>
                 ) : (
                     <div className="h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Catálogo de: <span className="text-primary-600">{selectedMerchant.name}</span></h3>
                        <div className="flex-grow overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {productHeaders.map(header => (
                                             <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {isLoadingProducts ? (
                                        <tr><td colSpan={productHeaders.length} className="text-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div></td></tr>
                                    ) : merchantProducts.length > 0 ? (
                                        merchantProducts.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.brand}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.sizeValue ?? '-'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.unitOfMeasure ?? '-'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.flavorAroma ?? '-'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.category}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${p.price.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${p.totalSales.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{p.totalUnits}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={productHeaders.length} className="text-center py-10 text-gray-500">Este comercio no tiene productos.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
};

const ProductMerchantsPanel: React.FC<{
    product: Product;
    allProducts: Product[];
    onClose: () => void;
}> = ({ product, allProducts, onClose }) => {
    const merchantsSelling = useMemo(() => {
        const merchantNames = new Set<string>();
        allProducts
            .filter(p => p.name === product.name && p.brand === product.brand)
            .forEach(p => merchantNames.add(p.merchantName));
        return Array.from(merchantNames);
    }, [product, allProducts]);

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose}></div>
            <div className="fixed bottom-0 right-0 left-0 h-2/5 bg-white dark:bg-gray-800 shadow-2xl rounded-t-2xl z-40 flex flex-col p-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
                <div className="flex-shrink-0 flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Comercios con "{product.name}"</h2>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {merchantsSelling.length > 0 ? (
                        <ul className="space-y-2">
                            {merchantsSelling.map(name => (
                                <li key={name} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500">No se encontraron otros comercios con este producto.</p>
                    )}
                </div>
            </div>
        </>
    );
};

const BaseTabContent = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [salesData, setSalesData] = useState<Map<string, { totalSales: number; totalUnits: number }>>(new Map());
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
    const [panelProduct, setPanelProduct] = useState<ProductWithGlobalSales | null>(null);
    const [sortOrder, setSortOrder] = useState<'createdAt' | 'totalSales' | 'totalUnits'>('createdAt');


    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const [productsData, salesDataMap] = await Promise.all([
                api.getProducts(),
                api.getSalesForAllProducts()
            ]);
            setProducts(productsData);
            setSalesData(salesDataMap);
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

    const processedProducts = useMemo(() => {
        const normalizeString = (str: string) => 
            str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

        const combinedData: ProductWithGlobalSales[] = products.map(p => {
            const sales = salesData.get(p.id) || { totalSales: 0, totalUnits: 0 };
            return { ...p, ...sales };
        });

        const filtered = combinedData.filter(p => {
                const minPrice = parseFloat(filters.minPrice);
                const maxPrice = parseFloat(filters.maxPrice);
                return (
                    normalizeString(p.name).includes(normalizeString(filters.name)) &&
                    normalizeString(p.brand).includes(normalizeString(filters.brand)) &&
                    (isNaN(minPrice) || p.price >= minPrice) &&
                    (isNaN(maxPrice) || p.price <= maxPrice) &&
                    (filters.category === '' || p.category === filters.category)
                );
            });
        
        return filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'totalSales':
                    return b.totalSales - a.totalSales;
                case 'totalUnits':
                    return b.totalUnits - a.totalUnits;
                case 'createdAt':
                default:
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
        });
    }, [products, salesData, filters, sortOrder]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProductIds(processedProducts.map(p => p.id));
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
    
    const baseHeaders = ['Producto', 'Marca', 'Comercio', 'Cantidad', 'Unidad', 'Sabor/Aroma', 'Categoría', 'Precio', 'Total Ventas', 'Total Unidades', 'Fecha'];

    return (
         <div>
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
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

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={handleAddClick} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm">Agregar producto</button>
                    <button onClick={handleEditClick} disabled={selectedProductIds.length !== 1} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Editar producto</button>
                    <button onClick={handleDeleteClick} disabled={selectedProductIds.length === 0} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Eliminar producto seleccionado</button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordenar por:</span>
                    <button onClick={() => setSortOrder('createdAt')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${sortOrder === 'createdAt' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Fecha</button>
                    <button onClick={() => setSortOrder('totalSales')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${sortOrder === 'totalSales' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Total Ventas</button>
                    <button onClick={() => setSortOrder('totalUnits')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${sortOrder === 'totalUnits' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Unidades Vendidas</button>
                </div>
            </div>

             <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={processedProducts.length > 0 && selectedProductIds.length === processedProducts.length}
                                    disabled={processedProducts.length === 0}
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                />
                            </th>
                            {baseHeaders.map(header => (
                                <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                        <tr>
                            <td colSpan={baseHeaders.length + 1} className="text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Cargando productos...</p>
                            </td>
                        </tr>
                    ) : processedProducts.length > 0 ? (
                        processedProducts.map(product => (
                           <tr key={product.id} onClick={() => setPanelProduct(product)} className={`cursor-pointer ${selectedProductIds.includes(product.id) ? 'bg-primary-50 dark:bg-gray-900/50' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                                <td className="px-6 py-4">
                                    <input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={(e) => { e.stopPropagation(); handleSelectOne(product.id); }} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.brand}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.merchantName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.sizeValue ?? '-'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.unitOfMeasure ?? '-'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.flavorAroma ?? '-'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.category}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.price.toFixed(2)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${product.totalSales.toFixed(2)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{product.totalUnits}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('es-ES') : '-'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={baseHeaders.length + 1} className="text-center py-10 text-gray-500 dark:text-gray-400">
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
            {panelProduct && (
                <ProductMerchantsPanel
                    product={panelProduct}
                    allProducts={products}
                    onClose={() => setPanelProduct(null)}
                />
            )}
        </div>
    );
}

const ProductsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'comercios' | 'base'>('comercios');
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Catálogo de Productos</h1>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('comercios')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'comercios'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Comercios
                    </button>
                    <button
                        onClick={() => setActiveTab('base')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'base'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Base
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'comercios' && <MerchantsTabContent />}
                {activeTab === 'base' && <BaseTabContent />}
            </div>
        </div>
    );
};

export default ProductsView;