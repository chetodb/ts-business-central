# @chetodb/nestjs-business-central

**Seamless integration module for Microsoft Dynamics 365 Business Central in NestJS applications.**

[Español (README.es.md)](./README.es.md) | [**Return to Monorepo Root**](../../README.md)

---

This package provides a native NestJS wrapper over the @chetodb/business-central Core SDK to facilitate robust dependency injection and centralized asynchronous configuration.

It also re-exports a curated subset of the Core SDK from this package entrypoint, so NestJS consumers can import the most common runtime symbols and types without adding a second direct dependency.

## 📦 Installation

```bash
npm install @chetodb/nestjs-business-central
# or
pnpm add @chetodb/nestjs-business-central
```

Common imports available directly from this package:

```typescript
import {
  BcFilter,
  BusinessCentralClient,
  type BcClientOptions,
  type BcGetOptions,
  type BcGetResponse,
} from '@chetodb/nestjs-business-central';
```

## 🚀 Setup

Import the BusinessCentralModule into your root AppModule or any feature module.

### Synchronous Configuration

Use `forRoot` if your configuration is static.

```typescript
import { Module } from
\@nestjs/common\';
import { BusinessCentralModule } from \@chetodb/nestjs-business-central\';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      isGlobal: true, // Make it available across all modules without re-importing
      tenantId: \your-tenant-id\',
      environment: \Sandbox\',
      companyName: \CRONUS\',
      azureKeys: [
        {
          name: \Primary\',
          clientId: \your-client-id\',
          clientSecret: \your-client-secret\',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### Asynchronous Configuration

Use `forRootAsync` if your configuration depends on other modules (e.g., ConfigModule).

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

## 💡 Usage

Once configured, simply inject the core BusinessCentralClient natively in your services or controllers.

✨ **No custom decorators required!** Thanks to NestJS class-based provider tokens.

```typescript
import { Injectable } from \@nestjs/common\';
import { BusinessCentralClient, BcFilter } from \@chetodb/nestjs-business-central\';

@Injectable()
export class CustomersService {
  constructor(
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
