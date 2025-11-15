
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// --- DATABASE SETUP ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL and Service Role Key must be provided in .env file.");
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);


// --- MOCK DATA (Adapted from api.ts to match Supabase schema) ---
const AccountStatus = {
  ACTIVE: 'active',
  PENDING_PAYMENT: 'pending_payment',
  SUSPENDED: 'suspended',
  DELETION_PENDING: 'deletion_pending'
};

const OrderStatus = {
  PENDING: 'pending',
  PREPARED: 'prepared',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const UserRole = {
  ADMIN: 'admin',
  CLIENT: 'client',
  COMMERCE: 'commerce'
};

const UnitOfMeasure = { 
  GRAMS: 'g', 
  KILOGRAMS: 'kg', 
  MILLILITERS: 'ml', 
  UNITS: 'unidades' 
};

const toDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MOCK_MERCHANTS = [
    { mockId: 'MERCH-1', name: 'Café del Sol', address: 'Av. Siempre Viva 123', platform_tip_rate: 0.25, last_payout_date: '2023-10-10', account_status: AccountStatus.PENDING_PAYMENT },
    { mockId: 'MERCH-2', name: 'Libros y Letras', address: 'Calle Falsa 456', platform_tip_rate: 0.15, last_payout_date: '2023-11-01', account_status: AccountStatus.ACTIVE },
    { mockId: 'MERCH-5', name: 'Verde Fresco', address: 'Insurgentes Sur 202', platform_tip_rate: 0.10, last_payout_date: '2023-10-25', account_status: AccountStatus.ACTIVE },
    { mockId: 'MERCH-6', name: 'El Rincón del Gourmet', address: 'Plaza de la Constitución 1', platform_tip_rate: 0.25, last_payout_date: '2023-09-15', account_status: AccountStatus.PENDING_PAYMENT },
    { mockId: 'MERCH-7', name: 'La Esquina Creativa', address: 'Calle de la Imaginación 303', platform_tip_rate: 0.18, last_payout_date: toDateString(new Date()), account_status: AccountStatus.ACTIVE },
];

const MOCK_CATEGORIES = [
  'Alimentos frescos', 'Panadería y repostería', 'Despensa / productos no perecederos',
  'Snacks y dulces', 'Bebidas', 'Bebidas alcohólicas', 'Limpieza del hogar',
  'Higiene personal', 'Mascotas', 'Papelería y oficina',
];

const MOCK_PRODUCTS = [
    { mockId: 'PROD-1', name: 'Café Americano', brand: 'Cafetal', merchantName: 'Café del Sol', category: 'Bebidas', price: 3.50, stock: 100, image_url: 'https://picsum.photos/seed/PROD-1/400/300', size_value: 250, unit_of_measure: UnitOfMeasure.GRAMS, flavor_aroma: 'Tostado medio', created_at: '2023-01-15T10:00:00Z' },
    { mockId: 'PROD-2', name: 'Libro de Ficción', brand: 'Ediciones Imaginarias', merchantName: 'Libros y Letras', category: 'Papelería y oficina', price: 15.00, stock: 50, image_url: 'https://picsum.photos/seed/PROD-2/400/300', size_value: 1, unit_of_measure: UnitOfMeasure.UNITS, created_at: '2023-02-20T11:30:00Z' },
    { mockId: 'PROD-5', name: 'Manzanas Orgánicas (kg)', brand: 'Naturaleza Viva', merchantName: 'Verde Fresco', category: 'Alimentos frescos', price: 4.50, stock: 200, image_url: 'https://picsum.photos/seed/PROD-5/400/300', size_value: 1, unit_of_measure: UnitOfMeasure.KILOGRAMS, created_at: '2023-05-01T08:20:00Z' },
    { mockId: 'PROD-6', name: 'Queso Brie Francés', brand: 'Le Gourmet', merchantName: 'El Rincón del Gourmet', category: 'Alimentos frescos', price: 12.75, stock: 40, image_url: 'https://picsum.photos/seed/PROD-6/400/300', size_value: 200, unit_of_measure: UnitOfMeasure.GRAMS, created_at: '2023-05-18T18:00:00Z' },
    { mockId: 'PROD-7', name: 'Latte', brand: 'Cafetal', merchantName: 'Café del Sol', category: 'Bebidas', price: 4.00, stock: 100, image_url: 'https://picsum.photos/seed/PROD-7/400/300', size_value: 350, unit_of_measure: UnitOfMeasure.MILLILITERS, flavor_aroma: 'Vainilla', created_at: '2023-06-02T10:45:00Z' },
];

const MOCK_ORDERS = [
    { mockId: 'ORD-101', merchantMockId: 'MERCH-1', customerName: 'Ana García', customerAddress: 'Calle A #1', location_zone: 'Centro', created_at: '2023-09-15', status: OrderStatus.DELIVERED, items: [{productMockId: 'PROD-1', quantity: 2}], merchant_tip: 1.00, platform_tip: 10.50, payment_method: 'Tarjeta de Crédito' },
    { mockId: 'ORD-102', merchantMockId: 'MERCH-1', customerName: 'Luis Hernández', customerAddress: 'Calle D #4', location_zone: 'Condesa', created_at: '2023-10-01', status: OrderStatus.DELIVERED, items: [{productMockId: 'PROD-7', quantity: 1}], merchant_tip: 1.50, platform_tip: 15.25, payment_method: 'Efectivo' },
    { mockId: 'ORD-103', merchantMockId: 'MERCH-1', customerName: 'Sofía Martínez', customerAddress: 'Calle C #3', location_zone: 'Condesa', created_at: toDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), status: OrderStatus.IN_TRANSIT, items: [{productMockId: 'PROD-7', quantity: 1}], merchant_tip: 1.50, platform_tip: 8.75, payment_method: 'Efectivo' },
    { mockId: 'ORD-104', merchantMockId: 'MERCH-1', customerName: 'Ana García', customerAddress: 'Calle A #1', location_zone: 'Centro', created_at: toDateString(new Date()), status: OrderStatus.PREPARED, items: [{productMockId: 'PROD-1', quantity: 2}], merchant_tip: 1.00, platform_tip: 5.25, payment_method: 'Tarjeta de Crédito' },
    { mockId: 'ORD-201', merchantMockId: 'MERCH-2', customerName: 'Carlos Rodríguez', customerAddress: 'Calle B #2', location_zone: 'Polanco', created_at: '2023-10-20', status: OrderStatus.DELIVERED, items: [{productMockId: 'PROD-2', quantity: 1}], merchant_tip: 2.00, platform_tip: 12.00, payment_method: 'PayPal' },
    { mockId: 'ORD-202', merchantMockId: 'MERCH-2', customerName: 'Elena Pérez', customerAddress: 'Calle E #5', location_zone: 'Polanco', created_at: '2023-10-28', status: OrderStatus.DELIVERED, items: [{productMockId: 'PROD-2', quantity: 1}], merchant_tip: 2.00, platform_tip: 13.50, payment_method: 'PayPal' },
];

const MOCK_PAYOUTS = [
    { merchantMockId: 'MERCH-1', balance_before_payout: 25.75, amount_paid: 20.00, created_at: new Date('2023-10-10T11:00:00Z').toISOString() },
    { merchantMockId: 'MERCH-2', balance_before_payout: 25.50, amount_paid: 25.50, created_at: new Date('2023-11-01T10:00:00Z').toISOString() },
];

const ADMIN_USER = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Usuario Administrador',
    avatar_url: 'https://i.pravatar.cc/150?u=admin',
    role: UserRole.ADMIN,
};

// --- SEEDING LOGIC ---

async function cleanup() {
    console.log("Cleaning up database...");
    const tables = ['order_items', 'orders', 'payouts', 'products', 'categories', 'commerces', 'clients', 'profiles'];
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', 0); // Trick to delete all
        if (error) console.error(`Error cleaning ${table}:`, error.message);
    }
}

async function seed() {
    console.log("Seeding data...");

    // 1. Profiles (Users)
    const uniqueCustomerNames = [...new Set(MOCK_ORDERS.map(o => o.customerName))];
    const profilesToInsert = [
        ADMIN_USER,
        ...MOCK_MERCHANTS.map(m => ({ id: m.mockId, name: m.name, avatar_url: `https://i.pravatar.cc/150?u=${m.name.replace(/\s/g, '')}`, role: UserRole.COMMERCE })),
        ...uniqueCustomerNames.map((name, i) => ({ id: `CLIENT-${i+1}`, name, avatar_url: `https://i.pravatar.cc/150?u=${name.toLowerCase().replace(/\s/g, '')}`, role: UserRole.CLIENT })),
    ];
    const { data: profiles, error: profileError } = await supabase.from('profiles').insert(profilesToInsert).select();
    if (profileError) throw new Error(`Profile seeding failed: ${profileError.message}`);
    console.log(`${profiles.length} profiles seeded.`);
    const profilesMap = new Map(profiles.map(p => [p.name, p]));
    profilesMap.set(ADMIN_USER.name, ADMIN_USER);
    const mockIdToProfileMap = new Map(MOCK_MERCHANTS.map(m => [m.mockId, profiles.find(p => p.name === m.name)]));
    uniqueCustomerNames.forEach((name, i) => mockIdToProfileMap.set(`CLIENT-${i+1}`, profiles.find(p => p.name === name)));


    // 2. Clients & Commerces (Roles)
    const clientsToInsert = profiles.filter(p => p.role === 'client').map(p => ({ id: p.id }));
    const { error: clientError } = await supabase.from('clients').insert(clientsToInsert);
    if (clientError) throw new Error(`Client seeding failed: ${clientError.message}`);

    const commercesToInsert = MOCK_MERCHANTS.map(m => ({
        // FIX: Use optional chaining to prevent a crash if a merchant profile is not found in the map.
        id: mockIdToProfileMap.get(m.mockId)?.id,
        ...m,
        latitude: 19.4326 + (Math.random() - 0.5) * 0.1, // Simulate geo data
        longitude: -99.1332 + (Math.random() - 0.5) * 0.1,
    }));
    const { error: commerceError } = await supabase.from('commerces').insert(commercesToInsert);
    if (commerceError) throw new Error(`Commerce seeding failed: ${commerceError.message}`);
    console.log(`${clientsToInsert.length} clients and ${commercesToInsert.length} commerces seeded.`);

    // 3. Categories
    const { data: categories, error: categoryError } = await supabase.from('categories').insert(MOCK_CATEGORIES.map(name => ({ name }))).select();
    if (categoryError) throw new Error(`Category seeding failed: ${categoryError.message}`);
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));
    console.log(`${categories.length} categories seeded.`);
    
    // 4. Products
    const productsToInsert = MOCK_PRODUCTS.map(p => ({
        ...p,
        commerce_id: mockIdToProfileMap.get(MOCK_MERCHANTS.find(m => m.name === p.merchantName)?.mockId)?.id,
        category_id: categoryMap.get(p.category),
    }));
    const { data: seededProducts, error: productError } = await supabase.from('products').insert(productsToInsert).select();
    if (productError) throw new Error(`Product seeding failed: ${productError.message}`);
    const productMockIdMap = new Map(seededProducts.map((p, i) => [MOCK_PRODUCTS[i].mockId, p]));
    console.log(`${seededProducts.length} products seeded.`);

    // 5. Orders and Order Items
    for (const order of MOCK_ORDERS) {
        const subtotal = order.items.reduce((acc, item) => {
            const product = MOCK_PRODUCTS.find(p => p.mockId === item.productMockId);
            return acc + (product.price * item.quantity);
        }, 0);
        
        const total_amount = subtotal + (order.merchant_tip ?? 0) + (order.platform_tip ?? 0);
        
        const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
            // FIX: Use optional chaining to prevent a crash if a profile is not found in the map.
            client_id: profilesMap.get(order.customerName)?.id,
            // FIX: Use optional chaining to prevent a crash if a merchant profile is not found in the map.
            commerce_id: mockIdToProfileMap.get(order.merchantMockId)?.id,
            customer_name: order.customerName,
            customer_address: order.customerAddress,
            location_zone: order.location_zone,
            created_at: order.created_at,
            status: order.status,
            subtotal,
            total_amount,
            merchant_tip: order.merchant_tip,
            platform_tip: order.platform_tip,
            payment_method: order.payment_method,
        }).select().single();
        if (orderError) throw new Error(`Order seeding failed for ${order.mockId}: ${orderError.message}`);

        const itemsToInsert = order.items.map(item => {
            const product = productMockIdMap.get(item.productMockId);
            return {
                order_id: insertedOrder.id,
                // FIX: Use optional chaining to prevent a crash if a product is not found in the map.
                product_id: product?.id,
                quantity: item.quantity,
                // FIX: Use optional chaining to prevent a crash if a product is not found in the map.
                price_at_purchase: product?.price,
                // FIX: Use optional chaining to prevent a crash if a product is not found in the map.
                item_snapshot: { name: product?.name, brand: product?.brand },
            };
        });
        const { error: itemError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemError) throw new Error(`Order item seeding failed for order ${order.mockId}: ${itemError.message}`);
    }
    console.log(`${MOCK_ORDERS.length} orders and their items seeded.`);

    // 6. Payouts
    const payoutsToInsert = MOCK_PAYOUTS.map(p => ({
        ...p,
        // FIX: Use optional chaining to prevent a crash if a merchant profile is not found in the map.
        commerce_id: mockIdToProfileMap.get(p.merchantMockId)?.id,
        admin_id: ADMIN_USER.id,
        balance_after_payout: p.balance_before_payout - p.amount_paid,
    }));
    const { error: payoutError } = await supabase.from('payouts').insert(payoutsToInsert);
    if (payoutError) throw new Error(`Payout seeding failed: ${payoutError.message}`);
    console.log(`${payoutsToInsert.length} payouts seeded.`);
}


async function main() {
  try {
    await cleanup();
    await seed();
    console.log("✅ Database seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

main();