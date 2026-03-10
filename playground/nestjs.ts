import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BcFilter, type BusinessCentralClient } from '../packages/core/src/index.js';
import { BusinessCentralModule } from '../packages/nestjs/src/index.js';

// ============================================================================
// 1. Service (Uses the injected SDK)
// ============================================================================
@Injectable()
class AppService {
  constructor(private readonly bc: BusinessCentralClient) {}

  async getCompanyInfo() {
    return {
      message: 'Business Central SDK initialized successfully via NestJS',
      // biome-ignore lint/suspicious/noExplicitAny: testing internal properties
      activeOptions: (this.bc as any).resolvedOptions, // Just for debugging in playground
    };
  }

  async getCustomers() {
    // Basic GET operation
    return this.bc.get('customers', { top: 5 });
  }

  async getFilteredCustomers() {
    // GET operation with advanced BcFilter
    const filter = BcFilter.build().eq('blocked', false).and().gt('balance', 1000);

    return this.bc.get('customers', {
      filter,
      top: 5,
      select: ['id', 'displayName', 'balance', 'blocked'],
    });
  }

  async createCustomer(data: Record<string, unknown>) {
    // POST operation
    return this.bc.post<Record<string, unknown>>('customers', data);
  }

  async updateCustomer(id: string, data: Record<string, unknown>) {
    // PATCH operation (partial update)
    return this.bc.patch<Record<string, unknown>>('customers', { id }, data);
  }

  async replaceCustomer(id: string, data: Record<string, unknown>) {
    // PUT operation (full replace)
    return this.bc.put<Record<string, unknown>>('customers', { id }, data);
  }

  async deleteCustomer(id: string) {
    // DELETE operation
    return this.bc.delete('customers', { id });
  }

  async executeCustomAction() {
    // Execute unbound OData action
    return this.bc.executeAction('someAction', { parameter: 'value' });
  }
}

// ============================================================================
// 2. Controller (Exposes routes to test the SDK)
// ============================================================================
@Controller('bc')
class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('info')
  async getInfo() {
    return this.appService.getCompanyInfo();
  }

  @Get('customers/filtered')
  async getFilteredCustomers() {
    return this.appService.getFilteredCustomers();
  }

  @Get('customers')
  async getCustomers() {
    return this.appService.getCustomers();
  }

  @Post('customers')
  async createCustomer(@Body() data: Record<string, unknown>) {
    return this.appService.createCustomer(data);
  }

  @Patch('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.appService.updateCustomer(id, data);
  }

  @Put('customers/:id')
  async replaceCustomer(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.appService.replaceCustomer(id, data);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.appService.deleteCustomer(id);
  }

  @Post('action')
  async executeCustomAction() {
    return this.appService.executeCustomAction();
  }
}

// ============================================================================
// 3. Module (Configures the global Business Central module)
// ============================================================================
@Module({
  imports: [
    BusinessCentralModule.forRoot({
      isGlobal: true,
      tenantId: 'your-tenant-id-here',
      environment: 'Sandbox',
      companyName: 'CRONUS',
      azureKeys: [
        {
          name: 'Main App',
          clientId: 'your-client-id',
          clientSecret: 'your-client-secret',
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
class AppModule {}

// ============================================================================
// 4. Bootstrap
// ============================================================================
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  const port = 3001;
  await app.listen(port);
  console.log('\n🚀 NestJS Playground Server running!');
  console.log(`\nTest the SDK injection here: http://localhost:${port}/bc/info\n`);
}

bootstrap().catch(console.error);
