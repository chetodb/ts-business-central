# Módulo NestJS para Business Central

**Módulo de integración nativa para conectar con Microsoft Dynamics 365 Business Central en aplicaciones NestJS.**

[English (README.md)](./README.md) | [**Volver al Repositorio Principal**](../../README.es.md)

---

Este paquete proporciona un envoltorio (wrapper) nativo para NestJS del Core SDK @chetodb/business-central para facilitar una inyección de dependencias robusta y una configuración asíncrona centralizada.

También re-exporta un subconjunto curado del Core SDK desde este mismo punto de entrada, para que los consumidores de NestJS puedan importar los símbolos y tipos más comunes sin añadir una segunda dependencia directa.

## 📦 Instalación

```bash
npm install @chetodb/nestjs-business-central
# o con pnpm
pnpm add @chetodb/nestjs-business-central
```

Importaciones comunes disponibles directamente desde este paquete:

```typescript
import {
  BcFilter,
  BusinessCentralClient,
  type BcClientOptions,
  type BcGetOptions,
  type BcGetResponse,
} from '@chetodb/nestjs-business-central';
```

## 🚀 Configuración

Importa el BusinessCentralModule en tu módulo principal AppModule o cualquier módulo específico.

### Configuración Síncrona

Usa `forRoot` si tu configuración es estática y no depende de variables de entorno mediante un servicio.

```typescript
import { Module } from
\@nestjs/common\';
import { BusinessCentralModule } from \@chetodb/nestjs-business-central\';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      isGlobal: true, // Lo hace disponible en todos los módulos de NestJS sin reimporar
      tenantId: \tu-tenant-id\',
      environment: \Sandbox\',
      companyName: \CRONUS\',
      azureKeys: [
        {
          name: \Primary\',
          clientId: \tu-client-id\',
          clientSecret: \tu-client-secret\',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### Configuración Asíncrona

Usa `forRootAsync` si tu configuración depende de otros módulos (ej. ConfigModule).

```typescript
import { Module } from \@nestjs/common\';
import { ConfigModule, ConfigService } from \@nestjs/config\';
import { BusinessCentralModule } from \@chetodb/nestjs-business-central\';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BusinessCentralModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        tenantId: configService.get<string>(\BC_TENANT_ID\')!,
        environment: configService.get<string>(\BC_ENVIRONMENT\')!,
        companyName: configService.get<string>(\BC_COMPANY_NAME\'),
        azureKeys: [
          {
            name: \Primary\',
            clientId: configService.get<string>(\BC_CLIENT_ID\')!,
            clientSecret: configService.get<string>(\BC_CLIENT_SECRET\')!,
          },
        ],
      }),
    }),
  ],
})
export class AppModule {}
```

## 💡 Uso

Una vez configurado, simplemente inyecta la clase principal BusinessCentralClient de forma nativa desde el constructor de cualquier servicio (o controlador).

✨ **¡Sin utilizar decoradores personalizados complejos!** Gracias al soporte de proveedores nativos de clases de NestJS.

```typescript
import { Injectable } from \@nestjs/common\';
import { BusinessCentralClient, BcFilter } from \@chetodb/nestjs-business-central\';

@Injectable()
export class CustomersService {
  constructor(
    // Inyección nativa limpia a través del constructor
    private readonly bcClient: BusinessCentralClient
  ) {}

  async getTopCustomers() {
    const filter = BcFilter.build().gt(\balance\', 1000);

    return this.bcClient.get(\customers\', {
      top: 10,
      filter
    });
  }
}
```
