import { IsIn } from 'class-validator';
import { InstagramDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/instagram.dto';
import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';

export type ProviderExtension<T extends string, M> = { __type: T } & M;

export type AllProvidersSettings =
  | ProviderExtension<'instagram', InstagramDto>
  | ProviderExtension<'instagram-standalone', InstagramDto>
  | ProviderExtension<'tiktok', TikTokDto>;

export const allProviders = () => [
  { value: InstagramDto, name: 'instagram' },
  { value: InstagramDto, name: 'instagram-standalone' },
  { value: TikTokDto, name: 'tiktok' },
];

export class EmptySettings {
  @IsIn(allProviders().map((provider) => provider.name), {
    message: `"__type" must be ${allProviders()
      .map((provider) => provider.name)
      .join(', ')}`,
  })
  __type: string;
}
