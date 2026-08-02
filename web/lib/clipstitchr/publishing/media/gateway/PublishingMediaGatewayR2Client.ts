import type {
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";

export type PublishingMediaGatewayR2Client = {
  send: (
    command: GetObjectCommand | HeadObjectCommand,
  ) => Promise<GetObjectCommandOutput | HeadObjectCommandOutput>;
};
