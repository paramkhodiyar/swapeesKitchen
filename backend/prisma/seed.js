
import prisma from "../src/config/prisma.js";
import { hashValue } from "../src/config/bcrypt.js";
import fs from "fs";
import path from "path";

async function main() {
    console.log("🌱 Starting detailed seeding...");

    // 1. Clear existing data
    console.log("🧹 Cleaning database...");
    await prisma.orderStatusHistory.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.address.deleteMany();
    await prisma.savedPayment.deleteMany();
    await prisma.user.deleteMany();

    const adminPassword = await hashValue("admin123");
    const customerPassword = await hashValue("user123");

    // 2. Create Owner
    const owner = await prisma.user.create({
        data: {
            name: "Param Admin",
            phone: "9999999999",
            email: "admin@swapeeskitchen.com",
            role: "OWNER",
            passwordHash: adminPassword,
        },
    });
    console.log("✅ Owner created");

    // 3. Load Image Map
    const imageMapContent = fs.readFileSync(path.join(process.cwd(), "menu-image-map.json"), "utf-8");
    const imageMap = JSON.parse(imageMapContent);
    const getUrl = (slug) => imageMap.find(img => img.slug === slug)?.url || null;

    // 4. Create Menu Items
    const menuItemsData = [
        { name: "Kadhai Paneer", slug: "KadhaiPaneer", price: 240, type: "FOOD", category: "Main Course", description: "Fresh cottage cheese cooked with bell peppers and freshly ground spices." },
        { name: "Masale Bhat", slug: "MasaleBhat", price: 160, type: "FOOD", category: "Rice", description: "Authentic Maharashtrian spiced rice with ivy gourd and traditional goda masala." },
        { name: "Paneer Bhurji", slug: "PaneerBhurji", price: 210, type: "FOOD", category: "Main Course", description: "Scrambled cottage cheese with onions, tomatoes and green chillies." },
        { name: "Paneer Butter Masala", slug: "PaneerButterMasala", price: 250, type: "FOOD", category: "Main Course", description: "Rich and creamy tomato-based gravy with soft paneer cubes." },
        { name: "Shahi Paneer", slug: "ShahiPaneer", price: 260, type: "FOOD", category: "Main Course", description: "A royal Mughal-style dish with paneer in a thick, nutty, creamy gravy." },
        { name: "Aloo Paratha", slug: "alooParatha", price: 80, type: "FOOD", category: "Breakfast", description: "Whole wheat flatbread stuffed with spiced mashed potatoes." },
        { name: "Aloo Pyaz Paratha", slug: "alooPyazParatha", price: 90, type: "FOOD", category: "Breakfast", description: "Flatbread stuffed with a mix of potatoes and onions." },
        { name: "Aloo Sandwich", slug: "alooSandwitch", price: 70, type: "FOOD", category: "Breakfast", description: "Grilled sandwich with spiced potato filling." },
        { name: "Butter Tawa Roti", slug: "butterTawaRoti", price: 15, type: "FOOD", category: "Breads", description: "Freshly made tawa roti with a dollop of butter." },
        { name: "Dal Tadka", slug: "dalTadka", price: 180, type: "FOOD", category: "Main Course", description: "Smooth yellow lentils tempered with ghee, garlic and red chillies." },
        { name: "Jeera Rice", slug: "jeeraRice", price: 140, type: "FOOD", category: "Rice", description: "Basmati rice tempered with cumin seeds." },
        { name: "Mix Veg", slug: "mixVeg", price: 200, type: "FOOD", category: "Main Course", description: "Fresh assorted vegetables cooked in a semi-dry gravy." },
        { name: "Paneer Paratha", slug: "paneerParatha", price: 120, type: "FOOD", category: "Breakfast", description: "Stuffed flatbread with spiced grated paneer." },
        { name: "Paneer Pulao", slug: "paneerPulao", price: 190, type: "FOOD", category: "Rice", description: "Fragrant rice cooked with paneer chunks and mild spices." },
        { name: "Paneer Sandwich", slug: "paneerSandwitch", price: 110, type: "FOOD", category: "Breakfast", description: "High protein grilled sandwich with paneer filling." },
        { name: "Plain Paratha", slug: "plainParatha", price: 40, type: "FOOD", category: "Breads", description: "Layered whole wheat flatbread." },
        { name: "Poha", slug: "poha", price: 60, type: "FOOD", category: "Breakfast", description: "Flattened rice tempered with peanuts, curry leaves and turmeric." },
        { name: "Pyaz Paratha", slug: "pyazParatha", price: 85, type: "FOOD", category: "Breakfast", description: "Crispy flatbread stuffed with finely chopped onions and herbs." },
        { name: "Roti", slug: "roti", price: 10, type: "FOOD", category: "Breads", description: "Whole wheat tawa roti." },
        { name: "Sev Bhaji", slug: "sevBhaji", price: 170, type: "FOOD", category: "Main Course", description: "Spicy Khandeshi style curry topped with crispy sev." },
        { name: "Veg Sandwich", slug: "vegSandwitch", price: 80, type: "FOOD", category: "Breakfast", description: "Healthy sandwich loaded with fresh vegetables and green chutney." },
        { name: "Alphonso Mango", slug: null, price: 800, type: "FRUIT", category: "Fruits", description: "Premium Ratnagiri Alphonso Mangoes (1 Dozen).", customUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800" },
        { name: "Fresh Strawberries", slug: null, price: 120, type: "FRUIT", category: "Fruits", description: "Handpicked Mahabaleshwar strawberries (250g).", customUrl: "https://images.unsplash.com/photo-1464965224029-aa44346e929d?q=80&w=800" },
        { name: "Organic Banana", slug: null, price: 60, type: "FRUIT", category: "Fruits", description: "Naturally ripened organic bananas (1 Dozen).", customUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800" },
    ];

    const menuItems = [];
    for (const item of menuItemsData) {
        const created = await prisma.menuItem.create({
            data: {
                name: item.name,
                description: item.description,
                price: item.price,
                type: item.type,
                category: item.category,
                imageUrl: item.customUrl || getUrl(item.slug),
                isAvailable: true,
            }
        });
        menuItems.push(created);
    }
    console.log(`✅ ${menuItems.length} Menu items created`);

    // 5. Create Customers
    const customersData = [
        { name: "Rahul Sharma", phone: "8888888881", email: "rahul@gmail.com" },
        { name: "Param Kumar", phone: "8888888888", email: "param@gmail.com" },
        { name: "Priya Patel", phone: "8888888882", email: "priya@gmail.com" },
        { name: "Amit Singh", phone: "8888888883", email: "amit@gmail.com" },
        { name: "Sneha Reddy", phone: "8888888884", email: "sneha@gmail.com" },
    ];

    const customers = [];
    for (const c of customersData) {
        const user = await prisma.user.create({
            data: {
                name: c.name,
                phone: c.phone,
                email: c.email,
                role: "CUSTOMER",
                passwordHash: customerPassword,
                addresses: {
                    create: [
                        { street: "Bungalow No 4, Green Valley", city: "Mumbai", state: "Maharashtra", zip: "400001", isDefault: true },
                        { street: "Flat 202, Skyline Apts", city: "Pune", state: "Maharashtra", zip: "411001", isDefault: false }
                    ]
                },
                savedPayments: {
                    create: [
                        { type: "UPI", provider: "PhonePe", identifier: `${c.name.split(' ')[0].toLowerCase()}@ybl`, isDefault: true },
                        { type: "CARD", provider: "HDFC Bank", identifier: "**** **** **** 4321", isDefault: false }
                    ]
                }
            }
        });
        customers.push(user);
    }
    console.log(`✅ ${customers.length} Customers created with addresses and payments`);

    // 6. Create Past Orders for Analytics
    console.log("📊 Generating past orders...");
    const statuses = ["DELIVERED", "ACCEPTED", "PENDING_ACCEPTANCE"];
    const paymentStatuses = ["PAID", "PAYMENT_PENDING"];

    // Last 30 days
    for (let i = 29; i >= 0; i--) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - i);

        // Random number of orders per day (2 to 8)
        const dailyOrdersCount = Math.floor(Math.random() * 7) + 2;

        for (let j = 0; j < dailyOrdersCount; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const status = i === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : "DELIVERED";
            const pStatus = (status === "DELIVERED" || status === "ACCEPTED") ? "PAID" : "PAYMENT_PENDING";

            // Random items (1 to 4)
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const selectedItems = [];
            let total = 0;

            for (let k = 0; k < itemCount; k++) {
                const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const subtotal = Number(menuItem.price) * qty;
                total += subtotal;
                selectedItems.push({
                    menuItemId: menuItem.id,
                    itemNameSnapshot: menuItem.name,
                    priceSnapshot: menuItem.price,
                    quantity: qty,
                    subtotal: subtotal
                });
            }

            const order = await prisma.order.create({
                data: {
                    orderNumber: `ORD-${orderDate.getTime()}-${Math.floor(Math.random() * 1000)}`,
                    userId: customer.id,
                    status: status,
                    paymentStatus: pStatus,
                    totalAmount: total,
                    deliveryAddress: "Bungalow No 4, Green Valley, Mumbai - 400001",
                    customerNote: j % 3 === 0 ? "Please make it extra spicy" : null,
                    createdAt: orderDate,
                    acceptedAt: status !== "PENDING_ACCEPTANCE" ? orderDate : null,
                    paidAt: pStatus === "PAID" ? orderDate : null,
                    deliveredAt: status === "DELIVERED" ? orderDate : null,
                    items: {
                        create: selectedItems
                    },
                    statusHistory: {
                        create: {
                            newStatus: status,
                            changedBy: "SYSTEM",
                            createdAt: orderDate
                        }
                    }
                }
            });

            if (pStatus === "PAID") {
                await prisma.payment.create({
                    data: {
                        orderId: order.id,
                        gateway: "RAZORPAY",
                        gatewayPaymentId: `pay_${Math.random().toString(36).substring(7)}`,
                        amount: total,
                        result: "SUCCESS",
                        createdAt: orderDate
                    }
                });
            }
        }
    }

    console.log("✅ Analytics data seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
