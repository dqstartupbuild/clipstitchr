# Zernio Product Account Settings

ClipStitchr uses a user-owned Zernio account. There is no ClipStitchr-managed or
fully embedded OAuth option.

## User Flow

The Zernio panel in Account settings links to Zernio signup and documentation.
Users connect their social accounts in Zernio, create a profile-scoped
read-write key, and paste it into ClipStitchr. Zernio provides the first two
connected social accounts for free; the user controls later upgrades and
billing directly with Zernio.

After a key passes GET /v1/accounts, ClipStitchr encrypts it and returns only
masked last-four metadata. The Choose accounts dialog then lets the user set
default posting accounts for every saved product. A schedule dialog may still
change those defaults for one post.

Removing or replacing the key clears every saved product account ID. This
prevents identifiers from one Zernio workspace being reused with another.

## Required Key Shape

The server accepts Zernio's documented sk_ prefix followed by 64 hexadecimal
characters. A profile-scoped read-write key limits exposure while still
allowing account reads, media uploads, post creation, and analytics reads.

## Source References

- <https://docs.zernio.com/>
- <https://docs.zernio.com/api-keys/create-api-key>
- <https://zernio.com/pricing>

## File Tree

- web/app/_components/settings/SettingsSocialPublishingPanel.tsx
- web/app/_components/settings/SettingsSocialPublishingProductConfigDialog.tsx
- web/app/_components/settings/SocialPublishingProductAccountConfigRow.tsx
- web/app/api/social-publishing/settings/route.ts
- web/app/api/social-publishing/accounts/route.ts
- web/lib/clipstitchr/server/socialPublishing/readSocialPublishingApiKeyInput.ts
- web/lib/clipstitchr/server/socialPublishing/encryptSocialPublishingApiKey.ts
- web/convex/socialPublishingSettings.ts
- web/convex/clearSocialPublishingSocialAccountIdsForOwner.ts
