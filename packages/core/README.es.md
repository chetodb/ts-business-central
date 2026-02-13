# Business Central SDK Core (Español)

**SDK de TypeScript moderno, resiliente y con tipos seguros para Microsoft Dynamics 365 Business Central.**

[English (README.md)](./README.md)

---

Este es el núcleo (Core SDK) del proyecto, diseñado para ser ligero, independiente de framework y extremadamente robusto en entornos de producción.

### ✨ Características clave

- 🔄 **Resiliencia Nativa**: Reintentos automáticos con *backoff exponencial* para errores transitorios.
- 🔑 **Rotación de Claves**: Soporta múltiples `azureKeys` para gestionar fallos de credenciales de forma automática.
- 🏗️ **Fluent OData**: Constructor de filtros tipado (`BcFilter`).
- 📦 **Pure ESM**: Construido aprovechando los estándares modernos de módulos de JavaScript.

### 🚀 Instalación

```bash
pnpm add @chetodb/business-central
```

### 🛠️ Uso básico

```ts
import { BcFilter, BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'your-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [
    { name: 'main', clientId: '...', clientSecret: '...' }
  ],
});

// Consulta tipada con filtros complejos
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

### 📖 Referencia de API y Ejemplos

El `BusinessCentralClient` proporciona un conjunto completo de métodos para interactuar con la API de BC.

#### `get<T>(endpoint, options)`
Recupera registros con paginación automática y soporte OData.

```ts
// Ejemplo: Usando BcFilter y opciones estándar de OData
const filter = new BcFilter().eq('Item_No', 'item-001');
const items = await client.get('item', {
  filter: filter,
  top: 5
});
```

#### `post<T>(endpoint, body)`
Crea un nuevo registro.

```ts
const newItem = {
  Item_No: 'item-001',
  Description: 'SDK-TEST'
};
const created = await client.post('item', newItem);
```

#### `patch<T>(endpoint, criteria, data)`
Actualiza parcialmente un registro existente. Gestiona automáticamente el predicado de clave OData e incluye `If-Match: *` por defecto.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
const newData = { Description: 'Actualizado mediante SDK' };

await client.patch('item', criteria, newData);
```

#### `put<T>(endpoint, criteria, data)`
Reemplaza un registro existente por completo. También incluye `If-Match: *` por defecto.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
const fullData = {
  Item_No: 'item-001',
  Description: 'Reemplazo total mediante SDK'
};

await client.put('item', criteria, fullData);
```

#### `delete(endpoint, criteria)`
Elimina un registro basado en criterios de clave.

```ts
const criteria = { Item_No: 'item-001', Description: 'SDK-TEST' };
await client.delete('item', criteria);
```

#### `executeAction<T>(endpoint, data)`
Ejecuta una acción OData **no vinculada** (unbound). Nota: En Business Central, las acciones no vinculadas usan una ruta específica (`ODataV4/NombreAccion`).

```ts
await client.executeAction('MiAccionPersonalizada', {
  documentNo: '123'
});
```

### ⚙️ Configuración avanzada

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
