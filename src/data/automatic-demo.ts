import { createColumnsFromData } from "../components/table/tableColumns";

// 🎯 SIMPLE AUTOMATIC APPROACH
// Just pass your data - that's it! No configuration needed.

// Example 1: Basic data - completely automatic
const userData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    salary: 75000,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    age: 28,
    salary: 80000,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 35,
    salary: 70000,
  },
];

// ONE LINE to create all columns automatically!
export const userColumns = createColumnsFromData(userData);

// Example 2: Product data with smart detection
export const productData = [
  {
    productCode: "LAP001", // Auto-detected as postalCode type
    productName: "Gaming Laptop", // Auto-detected as text
    price: 1299.99, // Auto-detected as currency (contains 'price')
    quantity: 15, // Auto-detected as numeric
    category: "Electronics", // Auto-detected as text
  },
  {
    productCode: "MOU002",
    productName: "Wireless Mouse",
    price: 49.99,
    quantity: 50,
    category: "Electronics",
  },
];

// ONE LINE - smart defaults applied automatically!
export const productColumns = createColumnsFromData(productData);
