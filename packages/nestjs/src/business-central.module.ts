import { type BcClientOptions, BusinessCentralClient } from '@chetodb/business-central';
import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { BUSINESS_CENTRAL_MODULE_OPTIONS } from './constants/business-central.constants.js';
import type {
  BusinessCentralModuleAsyncOptions,
  BusinessCentralModuleOptions,
  BusinessCentralOptionsFactory,
} from './interfaces/business-central-module.interfaces.js';

@Module({})
export class BusinessCentralModule {
  public static forRoot(options: BusinessCentralModuleOptions): DynamicModule {
    const { isGlobal, ...bcOptions } = options;

    const optionsProvider: Provider = {
      provide: BUSINESS_CENTRAL_MODULE_OPTIONS,
      useValue: bcOptions,
    };

    const clientProvider: Provider = {
      provide: BusinessCentralClient,
      useFactory: (opts: BcClientOptions) => {
        return new BusinessCentralClient(opts);
      },
      inject: [BUSINESS_CENTRAL_MODULE_OPTIONS],
    };

    return {
      global: isGlobal,
      module: BusinessCentralModule,
      providers: [optionsProvider, clientProvider],
      exports: [clientProvider],
    };
  }

  public static forRootAsync(options: BusinessCentralModuleAsyncOptions): DynamicModule {
    const clientProvider: Provider = {
      provide: BusinessCentralClient,
      useFactory: (opts: BcClientOptions) => {
        return new BusinessCentralClient(opts);
      },
      inject: [BUSINESS_CENTRAL_MODULE_OPTIONS],
    };

    return {
      global: options.isGlobal,
      module: BusinessCentralModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        clientProvider,
        ...(options.extraProviders || []),
      ],
      exports: [clientProvider],
    };
  }

  private static createAsyncProviders(options: BusinessCentralModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    return [];
  }

  private static createAsyncOptionsProvider(options: BusinessCentralModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: BUSINESS_CENTRAL_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    if (options.useExisting) {
      return {
        provide: BUSINESS_CENTRAL_MODULE_OPTIONS,
        useFactory: async (optionsFactory: BusinessCentralOptionsFactory) =>
          await optionsFactory.createBusinessCentralOptions(),
        inject: [options.useExisting],
      };
    }

    if (options.useClass) {
      return {
        provide: BUSINESS_CENTRAL_MODULE_OPTIONS,
        useFactory: async (optionsFactory: BusinessCentralOptionsFactory) =>
          await optionsFactory.createBusinessCentralOptions(),
        inject: [options.useClass],
      };
    }

    throw new Error('Invalid BusinessCentralModuleAsyncOptions configuration.');
  }
}
