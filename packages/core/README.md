# Business Central SDK Core

**Modern, resilient, and type-safe TypeScript SDK for Microsoft Dynamics 365 Business Central.**

[Español (README.es.md)](./README.es.md)

---

This is the Core SDK of the project, designed to be lightweight, framework-agnostic, and extremely robust for production environments.

### ✨ Key Features

- 🔄 **Native Resilience**: Automatic retries with *exponential backoff* for transient errors.
- 🔑 **Key Rotation**: Supports multiple `azureKeys` to handle failed credentials.
- 🏗️ **Fluent OData**: Type-safe filter builder (`BcFilter`).
- 📦 **Pure ESM**: Built leveraging modern JavaScript module standards.

### 🚀 Installation

```bash
pnpm add @chetodb/business-central
```

### 🛠️ Basic Usage

```ts
import { BcFilter, BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'your-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [
    { name: 'main', clientId: '...', clientSecret: '...' }
  ],
});

// Type-safe query with complex filters
interface Customer {
  id: string;
  displayName: string;
}

const customers = await client.get<Customer>('customers', {
  filter: BcFilter.where('balance').gt(0),
  select: ['id', 'displayName'],
  top: 10,
});
```

### 📖 API Reference & Examples

The `BusinessCentralClient` provides a full set of methods for interacting with the BC API.

#### `get<T>(endpoint, options)`
Retrieves records with automatic pagination and OData support.

```ts
// Example: Using BcFilter and standard OData options
const filter = new BcFilter().eq('Item_No', 'item-001');
const items = await client.get('item', {
  filter: filter,
  top: 5
});
```

#### `post<T>(endpoint, body)`
Creates a new record.

```ts
const newItem = {
  Item_No: 'item-001',
  Description: 'SDK-TEST'
};
const created = await client.post('item', newItem);
```

#### `patch<T>(endpoint, criteria, data)`
Partially updates an existing record. It handles the OData key predicate and includes `If-Match: *` by default.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
const newData = { Description: 'Updated via SDK' };

await client.patch('item', criteria, newData);
```

#### `put<T>(endpoint, criteria, data)`
Replaces an existing record entirely. It also includes `If-Match: *` by default.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
const fullData = {
  Item_No: 'item-001',
  Description: 'Full replacement via SDK'
};

await client.put('item', criteria, fullData);
```

#### `delete(endpoint, criteria)`
Deletes a record based on key criteria.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
await client.delete('item', criteria);
```

#### `executeAction<T>(endpoint, data)`
Executes an **unbound** OData action. Note: In Business Central, unbound actions use a specific route (`ODataV4/ActionName`).

```ts
await client.executeAction('MyCustomAction', {
  documentNo: '123'
});
```

### ⚙️ Advanced Configuration

```ts
const client = new BusinessCentralClient({
  requestOptions: {
    maxRetries: 5,
    timeout: 30000,
  },
  debugOptions: {
    duration: true,
  }
});
```

---

- **License**: [MIT](./LICENSE) © 2026 David Cheto (ChetoDB)
