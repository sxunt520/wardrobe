import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AliyunAiService } from './aliyun-ai.service';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';
import { ClothingItemEntity } from './entities/clothing-item.entity';
import { OutfitEntity } from './entities/outfit.entity';
import { StyleChallengeEntity } from './entities/style-challenge.entity';
import { WardrobeProfileEntity } from './entities/wardrobe-profile.entity';
import { CommunitySubmissionEntity } from './entities/community-submission.entity';
import { AiCallLogEntity } from './entities/ai-call-log.entity';
import { UserFeedbackEntity } from './entities/user-feedback.entity';
import { UserMembershipEntity } from './entities/user-membership.entity';
import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';
import { WardrobeAdminController } from './wardrobe-admin.controller';
import { WardrobeAdminService } from './wardrobe-admin.service';
import { OutfitRenderService } from './outfit-render.service';
import { AliyunTryOnService } from './aliyun-try-on.service';
import { TryOnRecordEntity } from './entities/try-on-record.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      WardrobeProfileEntity,
      ClothingItemEntity,
      OutfitEntity,
      TryOnRecordEntity,
      StyleChallengeEntity,
      CommunitySubmissionEntity,
      AiCallLogEntity,
      UserFeedbackEntity,
      UserMembershipEntity,
      UserEntity,
    ]),
  ],
  controllers: [WardrobeController, WardrobeAdminController],
  providers: [WardrobeService, AliyunAiService, WardrobeAdminService, OutfitRenderService, AliyunTryOnService],
  exports: [WardrobeService],
})
export class WardrobeModule {}
