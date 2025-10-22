import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import Table from '../components/ui/Table';

const ProductsView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchProducts();
    }, []);

    const headers = ['Nombre', 'Comercio', 'Categoría', 'Precio', 'Stock'];
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Productos</h1>
            <Table
                headers={headers}
                data={products}
                isLoading={isLoading}
// Fix: Explicitly type the 'product' parameter to 'Product' to fix type inference issues.
                renderRow={(product: Product) => (
                    <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.merchantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
};

export default ProductsView;