import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { WardrobeAdminQueryDto } from './dto/admin';
import { WardrobeAdminService } from './wardrobe-admin.service';
import { Operlog } from 'src/common/decorators/operlog.decorator';
import { BusinessType } from 'src/common/constant/business.constant';

@ApiTags('衣橱管家管理端')
@ApiBearerAuth('Authorization')
@Controller('wardrobe/admin')
export class WardrobeAdminController {
  constructor(private readonly service: WardrobeAdminService) {}

  @Get('overview')
  @RequirePermission('wardrobe:overview:list')
  overview() {
    return this.service.overview();
  }

  @Get('users')
  @RequirePermission('wardrobe:user:list')
  users(@Query() query: WardrobeAdminQueryDto) {
    return this.service.listUsers(query);
  }

  @Put('users/:userId/membership')
  @RequirePermission('wardrobe:member:edit')
  @Operlog({ businessType: BusinessType.UPDATE })
  membership(@Param('userId') userId: string, @Body() body: any) {
    return this.service.updateMembership(userId, body);
  }

  @Get('clothing')
  @RequirePermission('wardrobe:clothing:list')
  clothing(@Query() query: WardrobeAdminQueryDto) {
    return this.service.listClothing(query);
  }

  @Get('outfits')
  @RequirePermission('wardrobe:outfit:list')
  outfits(@Query() query: WardrobeAdminQueryDto) {
    return this.service.listOutfits(query);
  }

  @Get(':type')
  @RequirePermission('wardrobe:admin:list')
  list(@Param('type') type: string, @Query() query: WardrobeAdminQueryDto) {
    return this.service.listEntity(type, query);
  }

  @Post('challenges')
  @RequirePermission('wardrobe:challenge:add')
  @Operlog({ businessType: BusinessType.INSERT })
  createChallenge(@Body() body: any) {
    return this.service.saveChallenge(body);
  }

  @Put('challenges')
  @RequirePermission('wardrobe:challenge:edit')
  @Operlog({ businessType: BusinessType.UPDATE })
  updateChallenge(@Body() body: any) {
    return this.service.saveChallenge(body);
  }

  @Put(':type/:id')
  @RequirePermission('wardrobe:admin:edit')
  @Operlog({ businessType: BusinessType.UPDATE })
  update(@Param('type') type: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateEntity(type, id, body);
  }

  @Delete(':type/:id')
  @RequirePermission('wardrobe:admin:remove')
  @Operlog({ businessType: BusinessType.DELETE })
  remove(@Param('type') type: string, @Param('id') id: string) {
    return this.service.removeEntity(type, id);
  }
}
