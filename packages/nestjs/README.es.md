# Módulo NestJS para Business Central (Español)

> 🚧 **Work In Progress (En Construcción).** Este módulo es actualmente un prototipo y se encuentra en desarrollo activo. Aún no está listo para uso en producción.

**Módulo de integración fluida para Microsoft Dynamics 365 Business Central en aplicaciones NestJS.**

[English (README.md)](./README.md) | [**Volver al Repositorio Principal**](../../README.es.md)

---

Este paquete proporcionará un envoltorio (wrapper) sobre el Core SDK para facilitar la inyección de dependencias y la configuración centralizada en entornos NestJS.

### ✨ Características Planeadas

- 🧩 **Integración Nativa**: Diseñado siguiendo los patrones de módulos de NestJS.
- 💉 **Inyección de Dependencias**: Acceso sencillo al `BusinessCentralClient` en cualquier servicio.
- 🔄 **Configuración Asíncrona**: Soporte para `forRootAsync` usando ConfigModule.

---

## Desarrollo Local

Desde la raíz del monorepo:

```bash
pnpm --filter @chetodb/nestjs-business-central build
```
