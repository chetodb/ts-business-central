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
  // biome-ignore lint/suspicious/noExplicitAny: --- IGNORE ---
  useFactory?: (...args: any[]) => Promise<BcClientOptions> | BcClientOptions;
  // biome-ignore lint/suspicious/noExplicitAny: --- IGNORE ---
  inject?: any[];
  extraProviders?: Provider[];
}
