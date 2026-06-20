import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDto } from 'src/module/system/user/user.decorator';
import {
  AnalyzeClothingDto,
  ClothingQueryDto,
  CreateClothingDto,
  CreateFeedbackDto,
  CreateSubmissionDto,
  GenerateOutfitDto,
  SaveOutfitDto,
  ScoreChallengeDto,
  StartTryOnDto,
  UpsertProfileDto,
  WardrobePageQueryDto,
} from './dto';
import { WardrobeService } from './wardrobe.service';
import { Operlog } from 'src/common/decorators/operlog.decorator';
import { BusinessType } from 'src/common/constant/business.constant';

@ApiTags('衣橱管家APP')
@Controller('app/wardrobe')
export class WardrobeController {
  constructor(private readonly wardrobeService: WardrobeService) {}

  @Get('health')
  @ApiOperation({ summary: 'APP健康检查' })
  health() {
    return { ok: true, service: 'wardrobe-manager-api' };
  }

  @Get('profile')
  @ApiOperation({ summary: '获取身材档案和偏好' })
  getProfile(@User() user: UserDto) {
    return this.wardrobeService.getProfile(String(user.userId));
  }

  @Post('profile')
  @ApiOperation({ summary: '创建或更新身材档案和偏好' })
  @Operlog({ businessType: BusinessType.UPDATE })
  upsertProfile(@User() user: UserDto, @Body() dto: UpsertProfileDto) {
    return this.wardrobeService.upsertProfile(String(user.userId), dto);
  }

  @Get('clothing')
  @ApiOperation({ summary: '查询衣橱单品' })
  listClothing(@User() user: UserDto, @Query() query: ClothingQueryDto) {
    return this.wardrobeService.listClothing(String(user.userId), query);
  }

  @Post('clothing')
  @ApiOperation({ summary: '新增衣物' })
  @Operlog({ businessType: BusinessType.INSERT })
  createClothing(@User() user: UserDto, @Body() dto: CreateClothingDto) {
    return this.wardrobeService.createClothing(String(user.userId), dto);
  }

  @Patch('clothing/:id')
  @ApiOperation({ summary: '更新衣物' })
  @Operlog({ businessType: BusinessType.UPDATE })
  updateClothing(@User() user: UserDto, @Param('id') id: string, @Body() dto: Partial<CreateClothingDto>) {
    return this.wardrobeService.updateClothing(String(user.userId), id, dto);
  }

  @Delete('clothing/:id')
  @ApiOperation({ summary: '删除衣物' })
  @Operlog({ businessType: BusinessType.DELETE })
  deleteClothing(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.deleteClothing(String(user.userId), id);
  }

  @Post('ai/analyze-clothing')
  @ApiOperation({ summary: 'AI识别衣物图片' })
  analyzeClothing(@Body() dto: AnalyzeClothingDto) {
    return this.wardrobeService.analyzeClothing(dto);
  }

  @Post('outfits/generate')
  @ApiOperation({ summary: 'AI生成搭配' })
  @Operlog({ businessType: BusinessType.INSERT })
  generateOutfits(@User() user: UserDto, @Body() dto: GenerateOutfitDto) {
    return this.wardrobeService.generateOutfits(String(user.userId), dto);
  }

  @Get('outfits/history')
  @ApiOperation({ summary: '搭配历史' })
  history(@User() user: UserDto, @Query() query: WardrobePageQueryDto) {
    return this.wardrobeService.history(String(user.userId), query);
  }

  @Get('try-on/history')
  @ApiOperation({ summary: '真人试穿历史' })
  listTryOnHistory(@User() user: UserDto, @Query() query: WardrobePageQueryDto) {
    return this.wardrobeService.listTryOnHistory(String(user.userId), query);
  }

  @Get('try-on/history/:id')
  @ApiOperation({ summary: '真人试穿历史详情' })
  getTryOnHistory(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.getTryOnHistory(String(user.userId), id);
  }

  @Delete('try-on/history/:id')
  @ApiOperation({ summary: '删除真人试穿历史' })
  @Operlog({ businessType: BusinessType.DELETE })
  deleteTryOnHistory(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.deleteTryOnHistory(String(user.userId), id);
  }

  @Get('outfits/:id')
  @ApiOperation({ summary: '搭配详情' })
  getOutfit(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.getOutfit(String(user.userId), id);
  }

  @Patch('outfits/:id/save')
  @ApiOperation({ summary: '收藏或取消收藏搭配' })
  @Operlog({ businessType: BusinessType.UPDATE })
  saveOutfit(@User() user: UserDto, @Param('id') id: string, @Body() dto: SaveOutfitDto) {
    return this.wardrobeService.saveOutfit(String(user.userId), id, dto.isSaved);
  }

  @Post('outfits/:id/render')
  @ApiOperation({ summary: '重新生成搭配平铺效果图' })
  @Operlog({ businessType: BusinessType.INSERT })
  renderOutfit(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.renderOutfit(String(user.userId), id);
  }

  @Post('outfits/:id/try-on')
  @ApiOperation({ summary: '提交真人试穿任务' })
  @Operlog({ businessType: BusinessType.INSERT })
  startTryOn(@User() user: UserDto, @Param('id') id: string, @Body() dto: StartTryOnDto) {
    return this.wardrobeService.startTryOn(String(user.userId), id, dto.personImageUrl);
  }

  @Get('outfits/:id/try-on')
  @ApiOperation({ summary: '查询真人试穿任务状态' })
  getTryOnStatus(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.getTryOnStatus(String(user.userId), id);
  }

  @Delete('outfits/:id')
  @ApiOperation({ summary: '删除搭配记录' })
  @Operlog({ businessType: BusinessType.DELETE })
  deleteOutfit(@User() user: UserDto, @Param('id') id: string) {
    return this.wardrobeService.deleteOutfit(String(user.userId), id);
  }

  @Get('explore')
  @ApiOperation({ summary: '灵感探索' })
  explore() {
    return this.wardrobeService.explore();
  }

  @Post('challenge/score')
  @ApiOperation({ summary: 'AI挑战评分' })
  scoreChallenge(@User() user: UserDto, @Body() dto: ScoreChallengeDto) {
    return this.wardrobeService.scoreChallenge(String(user.userId), dto);
  }

  @Post('submissions')
  @ApiOperation({ summary: '提交社区穿搭审核' })
  @Operlog({ businessType: BusinessType.INSERT })
  createSubmission(@User() user: UserDto, @Body() dto: CreateSubmissionDto) {
    return this.wardrobeService.createSubmission(String(user.userId), dto);
  }

  @Post('feedback')
  @ApiOperation({ summary: '提交用户反馈' })
  @Operlog({ businessType: BusinessType.INSERT })
  createFeedback(@User() user: UserDto, @Body() dto: CreateFeedbackDto) {
    return this.wardrobeService.createFeedback(String(user.userId), dto);
  }

  @Get('report')
  @ApiOperation({ summary: '衣橱报告' })
  report(@User() user: UserDto) {
    return this.wardrobeService.report(String(user.userId));
  }
}
