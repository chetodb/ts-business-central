# TS Business Central (Español)

**El toolkit de TypeScript para integraciones con Microsoft Dynamics 365 Business Central.**

[Español](#español) | [English (README.md)](./README.md)

---

## 🌟 Visión General

`ts-business-central` es un monorepo profesional que contiene un conjunto de librerías diseñadas para que las integraciones con Business Central sean fiables, seguras (type-safe) y fáciles de mantener.

### 📦 Paquetes Incluidos

| Paquete | Versión | Descripción |
| --- | --- | --- |
| [**`@chetodb/business-central`**](./packages/core) | ![NPM](https://img.shields.io/npm/v/@chetodb/business-central?color=blue) | **Core SDK**: Resiliencia, Rotación de Claves y CRUD OData. |
| [**`@chetodb/nestjs-business-central`**](./packages/nestjs) | ![NPM](https://img.shields.io/npm/v/@chetodb/nestjs-business-central?color=green) | **Módulo NestJS**: Integración nativa con el framework. |

---

## 🚀 Empezando

Para instalar el Core SDK en tu proyecto:

```bash
pnpm add @chetodb/business-central
# o
npm install @chetodb/business-central
```

### 🛠 Ejemplo Rápido

```ts
import { BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'tu-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [{ name: 'principal', clientId: '...', clientSecret: '...' }]
});

const customers = await client.get('customers', { top: 5 });
```

---

## 🧪 Desarrollo y Monorepo

Este proyecto utiliza workspaces de `pnpm` para una gestión eficiente.

```bash
# Instalar todas las dependencias
pnpm install

# Construir todos los paquetes
pnpm build

# Ejecutar tests en todo el monorepo
pnpm test
```

---

## 🤝 Contribución y Gobernanza

¡Las contribuciones son bienvenidas! Consulta nuestra [Guía de Contribución](./CONTRIBUTING.md) para más detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

- **Licencia**: [MIT](./LICENSE) © 2026 David Cheto (ChetoDB)
- **Estado**: Desarrollo activo 🏗️
