# Simple Automatic Table Columns

A clean, basic approach to creating table columns with zero configuration required.

## 🎯 Core Philosophy

- **No Configuration**: Just pass your data
- **Smart Auto-Detection**: Automatically detects column types
- **Intelligent Defaults**: Smart filters and aggregations
- **Type Safe**: Full TypeScript support

## 🚀 Usage

### Basic Usage

```typescript
import { createColumnsFromData } from "./tableColumns";

const data = [
  { id: 1, name: "John", price: 99.99, code: "ABC123" },
  { id: 2, name: "Jane", price: 149.99, code: "XYZ456" },
];

// One line - that's it!
const columns = createColumnsFromData(data);
```

### API Integration

```typescript
const response = await fetch("/api/data");
const data = await response.json();
const columns = createColumnsFromData(data);
```

## 🔍 Auto-Detection Rules

The system automatically detects column types based on:

- **Field Names**:
  - `price`, `cost`, `amount` → Currency type
  - `code`, `id` → Postal code type
- **Data Types**:
  - Numbers → Numeric type
  - Strings → Text type

## 📊 Smart Defaults

| Column Type | Filter          | Aggregation | Formatting |
| ----------- | --------------- | ----------- | ---------- |
| Currency    | Numeric         | Sum         | $1,234.56  |
| Numeric     | Numeric         | Sum         | 1,234      |
| Postal Code | NumericWithText | Count       | ABC123     |
| Text        | Text            | Count       | Plain text |

## 🎨 Styling

Each column type gets appropriate default styling:

- **Currency**: Bold, semibold weight
- **Numeric**: Medium weight
- **Postal Code**: Monospace font
- **Text**: Standard weight

## 📁 Files

- `tableColumns.tsx` - Main implementation
- `example-usage.tsx` - Usage examples
- `automatic-demo.tsx` - Live demonstration

## 🔄 Backward Compatibility

The original `tableColumns` export is still available for existing code.
