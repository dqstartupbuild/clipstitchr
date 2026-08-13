export class PublishingCheckpointConflictError extends Error {
  public constructor() {
    super("The publishing attempt checkpoint changed before it could be saved.");
    this.name = "PublishingCheckpointConflictError";
  }
}
