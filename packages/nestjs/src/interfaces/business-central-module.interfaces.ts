import type { BcClientOptions } from '@chetodb/business-central';
import type { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface BusinessCentralModuleOptions extends BcClientOptions {
  isGlobal?: boolean;
}

export interface BusinessCentralOptionsFactory {
  createBusinessCentralOptions(): Promise<BcClientOptions> | BcClientOptions;
}

export interface BusinessCentralModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useExisting?: Type<BusinessCentralOptionsFactory>;
  useClass?: Type<BusinessCentralOptionsFactory>;
  // biome-ignore lint/suspicious/noExplicitAny: NestJS DI factory signature requires any[] — matches @nestjs/common async module pattern
  useFactory?: (...args: any[]) => Promise<BcClientOptions> | BcClientOptions;
  // biome-ignore lint/suspicious/noExplicitAny: NestJS DI inject tokens can be any injectable value
  inject?: any[];
  extraProviders?: Provider[];
}
