import { Injectable } from '@nestjs/common';
import { MediaRepository } from '@gitroom/nestjs-libraries/database/prisma/media/media.repository';

/**
 * Focused media lookup seam derived from Postiz's MediaService.
 *
 * Upload, deletion, AI generation, and video-generation behavior is excluded.
 * ClipStitchr must replace this with its tenant-scoped durable media bridge.
 */
@Injectable()
export class MediaService {
  constructor(private _mediaRepository: MediaRepository) {}

  getMediaById(id: string) {
    return this._mediaRepository.getMediaById(id);
  }
}
