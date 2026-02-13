# Módulo NestJS para Business Central (Español)

**Módulo de integración fluida para Microsoft Dynamics 365 Business Central en aplicaciones NestJS.**

[Español](#español) | [English (README.md)](./README.md)

---

Este paquete proporciona un envoltorio (wrapper) sobre el Core SDK para facilitar la inyección de dependencias y la configuración centralizada en entornos NestJS.

> **Estado**: Este paquete está actualmente en una fase inicial de desarrollo. La API está sujeta a cambios.

### ✨ Características clave

- 🧩 **Integración Nativa**: Diseñado siguiendo los patrones de módulos de NestJS.
- 💉 **Inyección de Dependencias**: Acceso sencillo al `BusinessCentralClient` en cualquier servicio.

### 🚀 Instalación

```bash
pnpm add @chetodb/nestjs-business-central @chetodb/business-central
```

### 🛠️ Uso básico (Vista previa)

```ts
import { Module } from '@nestjs/common';
import { BusinessCentralModule } from '@chetodb/nestjs-business-central';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      tenantId: 'your-tenant-id',
      companyName: 'CRONUS',
      azureKeys: [
        { name: 'main', clientId: '...', clientSecret: '...' }
      ],
    }),
  ],
})
export class AppModule {}
```

---

## Desarrollo Local

Desde la raíz del monorepo:

```bash
pnpm --filter @chetodb/nestjs-business-central build
```
