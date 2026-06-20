<template>
  <div class="app-container">
    <el-row :gutter="16">
      <el-col v-for="item in cards" :key="item.label" :xs="12" :sm="8" :lg="6">
        <div class="metric"><div class="metric-label">{{ item.label }}</div><div class="metric-value">{{ overview[item.key] || 0 }}</div></div>
      </el-col>
    </el-row>
    <el-alert title="衣橱管家运营中心" description="管理 APP 用户、衣物、AI 搭配、社区内容、反馈和会员状态。" type="info" :closable="false" class="intro" />
  </div>
</template>
<script setup>
import { getOverview } from '@/api/wardrobe/admin'
const overview = ref({})
const cards = [
  { label: 'APP 用户', key: 'users' }, { label: '衣物总数', key: 'clothing' },
  { label: '搭配记录', key: 'outfits' }, { label: '待审投稿', key: 'pendingSubmissions' },
  { label: 'AI 失败', key: 'failedAi' }, { label: '待处理反馈', key: 'pendingFeedback' },
  { label: 'PRO 会员', key: 'proMembers' }
]
getOverview().then(res => overview.value = res.data)
</script>
<style scoped>
.metric { background:#fff; border:1px solid #ebeef5; padding:20px; margin-bottom:16px; border-radius:6px; }
.metric-label { color:#606266; font-size:14px; }
.metric-value { color:#303133; font-size:30px; font-weight:700; margin-top:8px; }
.intro { margin-top:8px; }
</style>
