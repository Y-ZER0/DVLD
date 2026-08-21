import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImageKitService {
  private readonly imagekit: ImageKit | null;
  private readonly folder = 'dvld/people';

  constructor(private readonly config: ConfigService) {
    const publicKey = this.config.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.config.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.config.get<string>('IMAGEKIT_URL_ENDPOINT');
    if (publicKey && privateKey && urlEndpoint) {
      this.imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    } else {
      this.imagekit = null;
    }
  }

  async upload(file: Express.Multer.File, fileName: string): Promise<string> {
    if (!this.imagekit) {
      throw new BadRequestException('ImageKit is not configured');
    }
    const result = await this.imagekit.upload({
      file: file.buffer.toString('base64'),
      fileName,
      folder: this.folder,
      useUniqueFileName: true,
    });
    return result.url;
  }
}
