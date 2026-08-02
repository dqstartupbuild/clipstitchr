import { Injectable } from '@nestjs/common';
import { SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { InstagramProvider } from '@gitroom/nestjs-libraries/integrations/social/instagram.provider';
import { TiktokProvider } from '@gitroom/nestjs-libraries/integrations/social/tiktok.provider';
import { InstagramStandaloneProvider } from '@gitroom/nestjs-libraries/integrations/social/instagram.standalone.provider';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';

export const socialIntegrationList: Array<SocialAbstract & SocialProvider> = [
  new InstagramProvider(),
  new InstagramStandaloneProvider(),
  new TiktokProvider(),
];

@Injectable()
export class IntegrationManager {
  async getAllIntegrations() {
    return {
      social: await Promise.all(
        socialIntegrationList.map(async (p) => ({
          name: p.name,
          identifier: p.identifier,
          toolTip: p.toolTip,
          editor: p.editor,
          isExternal: !!p.externalUrl,
          isWeb3: !!p.isWeb3,
          isChromeExtension: !!p.isChromeExtension,
          ...(p.extensionCookies
            ? { extensionCookies: p.extensionCookies }
            : {}),
          ...(p.customFields ? { customFields: await p.customFields() } : {}),
        }))
      ),
      article: [] as any[],
    };
  }

  getAllowedSocialsIntegrations() {
    return socialIntegrationList.map((p) => p.identifier);
  }
  getSocialIntegration(integration: string): SocialProvider {
    return socialIntegrationList.find((i) => i.identifier === integration)!;
  }
}
