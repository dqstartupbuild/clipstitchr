import type {
  HeadObjectCommand,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";

export type PublishingMediaHeadClient = {
  send: (command: HeadObjectCommand) => Promise<HeadObjectCommandOutput>;
};
