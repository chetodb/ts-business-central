import { BusinessCentralClient } from '@chetodb/business-central';
import { Inject, Injectable } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { BusinessCentralModule } from './business-central.module.js';

@Injectable()
class TestService {
  constructor(@Inject(BusinessCentralClient) public readonly bcClient: BusinessCentralClient) {}
}

const mockOptions = {
  tenantId: 'test-tenant',
  environment: 'production',
  companyName: 'CRONUS',
  azureKeys: [
    {
      name: 'primary',
      clientId: 'foo',
      clientSecret: 'bar',
    },
  ],
};

describe('BusinessCentralModule', () => {
  describe('forRoot', () => {
    it('should provide BusinessCentralClient using forRoot', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [BusinessCentralModule.forRoot(mockOptions)],
        providers: [TestService],
      }).compile();

      const service = module.get<TestService>(TestService);

      expect(service).toBeDefined();
      expect(service.bcClient).toBeInstanceOf(BusinessCentralClient);

      // Confirm options were injected successfully
      // biome-ignore lint/suspicious/noExplicitAny: testing internal properties
      const opts = (service.bcClient as any).resolvedOptions;
      expect(opts.tenantId).toBe('test-tenant');
      expect(opts.companyName).toBe('CRONUS');
    });

    it('should register BusinessCentralClient globally when isGlobal is true', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [BusinessCentralModule.forRoot({ ...mockOptions, isGlobal: true })],
      }).compile();

      const client = module.get<BusinessCentralClient>(BusinessCentralClient);
      expect(client).toBeDefined();
    });
  });

  describe('forRootAsync', () => {
    it('should provide BusinessCentralClient using forRootAsync with useFactory', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          BusinessCentralModule.forRootAsync({
            useFactory: () => mockOptions,
          }),
        ],
        providers: [TestService],
      }).compile();

      const service = module.get<TestService>(TestService);
      const client = module.get<BusinessCentralClient>(BusinessCentralClient);

      expect(service).toBeDefined();
      expect(service.bcClient).toBe(client);
      expect(service.bcClient).toBeInstanceOf(BusinessCentralClient);
    });

    it('should register BusinessCentralClient globally when using forRootAsync and isGlobal is true', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          BusinessCentralModule.forRootAsync({
            isGlobal: true,
            useFactory: () => mockOptions,
          }),
        ],
      }).compile();

      const client = module.get<BusinessCentralClient>(BusinessCentralClient);
      expect(client).toBeDefined();
    });

    it('should inject dependencies into useFactory', async () => {
      @Injectable()
      class ConfigService {
        getOptions() {
          return mockOptions;
        }
      }

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          BusinessCentralModule.forRootAsync({
            extraProviders: [ConfigService],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.getOptions(),
          }),
        ],
        providers: [TestService],
      }).compile();

      const service = module.get<TestService>(TestService);
      expect(service.bcClient).toBeInstanceOf(BusinessCentralClient);

      // biome-ignore lint/suspicious/noExplicitAny: testing internal properties
      const opts = (service.bcClient as any).resolvedOptions;
      expect(opts.tenantId).toBe('test-tenant');
    });
  });
});
