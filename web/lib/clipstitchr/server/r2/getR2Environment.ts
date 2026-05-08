type R2Environment = {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getRequiredR2EnvironmentValue(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

export function getR2Environment(): R2Environment {
  return {
    accountId: getRequiredR2EnvironmentValue("R2_ACCOUNT_ID"),
    bucketName: getRequiredR2EnvironmentValue("R2_BUCKET_NAME"),
    accessKeyId: getRequiredR2EnvironmentValue("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredR2EnvironmentValue("R2_SECRET_ACCESS_KEY"),
  };
}
