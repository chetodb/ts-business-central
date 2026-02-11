# TS Business Central

**La suite definitiva de TypeScript para Integraciones con Microsoft Business Central.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

Este monorepo alberga un conjunto de librerías modernas y resilientes diseñadas para conectar aplicaciones Node.js con el ERP de Microsoft Business Central (API Cloud).

## 📦 Paquetes

Este proyecto se divide en módulos especializados para mantener tu código limpio y ligero:

| Paquete                                                     | Descripción                                                                                             | NPM    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| **[`@chetodb/business-central`](./packages/core)**          | **Core SDK.** Cliente HTTP puro, agnóstico de frameworks. Ideal para scripts, AWS Lambda, Express, etc. | `Soon` |
| **[`@chetodb/nestjs-business-central`](./packages/nestjs)** | **NestJS Module.** Adaptador nativo para inyección de dependencias y configuración en proyectos NestJS. | `Soon` |

## ✨ Características Principales

Diseñado para resolver los problemas reales de integración en producción:

- 🔒 **Autenticación Gestionada**: Olvídate de renovar tokens. El sistema gestiona automáticamente el ciclo de vida de los tokens de Azure AD.
- 🔄 **Rotación de Claves Inteligente**: Soporte para múltiples credenciales (Azure Client Secrets) que rotan automáticamente para evitar errores de límite de tasa (429 Too Many Requests).
- 🛡️ **Resiliencia Integrada**: Lógica de reintentos avanzada con _exponential backoff_ para fallos de red y errores transitorios del servidor.
- ⚡ **Fluent OData Query**: Utilidades tipadas para construir consultas complejas (`$filter`, `$select`, `$expand`) sin concatenar strings manualmente.
- 📝 **Tipado Fuerte**: Interfaces TypeScript completas para una experiencia de desarrollo segura y con autocompletado.

## 🚀 Instalación

Elige el paquete que mejor se adapte a tu arquitectura:

### Para aplicaciones TypeScript/Node.js estándar

```bash
pnpm add @chetodb/business-central
```

### Para aplicaciones NestJS

```bash
pnpm add @chetodb/nestjs-business-central @chetodb/business-central
```

## 📚 Uso Rápido

### Core SDK

```typescript
import { BcClient } from '@chetodb/business-central';

const client = new BcClient({
  tenantId: 'your-tenant-id',
  environment: 'Production',
  companyId: 'your-company-id',
  auth: { clientId: '...', clientSecret: '...' },
});

const customers = await client.resource('customers').find({
  $filter: 'balance gt 0',
});
```

### NestJS Module

```typescript
// app.module.ts
@Module({
  imports: [
    BcModule.forRoot({
      tenantId: 'your-tenant-id',
      // ... configuración
    }),
  ],
})
export class AppModule {}

// tu-servicio.ts
@Injectable()
export class InvoiceService {
  constructor(private readonly bcClient: BcClient) {}

  async getInvoices() {
    return this.bcClient.resource('salesInvoices').getAll();
  }
}
```

## 🛠️ Desarrollo (Monorepo)

Este proyecto utiliza **pnpm workspaces**. Para empezar a contribuir:

```bash
# Instalar dependencias
pnpm install

# Compilar todos los paquetes
pnpm build

# Ejecutar tests
pnpm test
```

## 📄 Licencia

MIT © [ChetoDB](https://github.com/chetodb)
