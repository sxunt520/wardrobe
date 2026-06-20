<template>
  <div class="app-container">
    <el-form :model="query" inline>
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" clearable placeholder="名称、账号或标题" @keyup.enter="load" />
      </el-form-item>
      <el-form-item v-if="statusOptions.length" label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 160px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="resource === 'clothing'" label="分类">
        <el-select v-model="query.category" clearable placeholder="全部分类" style="width: 160px">
          <el-option v-for="item in ['上衣','裤装','裙装','外套','鞋包','配饰']" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="search">搜索</el-button>
        <el-button icon="Refresh" @click="reset">重置</el-button>
        <el-button v-if="resource === 'challenges'" type="primary" plain icon="Plus" @click="openChallenge()">新增挑战</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows">
      <el-table-column v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <el-image v-if="column.type === 'image' && row[column.prop]" :src="row[column.prop]" fit="cover" class="thumb" :preview-src-list="[row[column.prop]]" />
          <el-tag v-else-if="column.type === 'status'" :type="statusType(row[column.prop])">{{ statusLabel(row[column.prop]) }}</el-tag>
          <span v-else-if="column.type === 'boolean'">{{ Number(row[column.prop]) ? '是' : '否' }}</span>
          <span v-else-if="column.type === 'time'">{{ parseTime(row[column.prop]) }}</span>
          <span v-else>{{ row[column.prop] ?? '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-if="resource === 'challenges'" link type="primary" icon="Edit" @click="openChallenge(row)">编辑</el-button>
          <el-button v-if="resource === 'submissions'" link type="success" @click="setStatus(row, 'auditStatus', '1')">通过</el-button>
          <el-button v-if="resource === 'submissions'" link type="warning" @click="setStatus(row, 'auditStatus', '2')">拒绝</el-button>
          <el-button v-if="resource === 'feedback'" link type="primary" @click="handleFeedback(row)">处理</el-button>
          <el-button v-if="resource === 'users'" link type="primary" @click="editMember(row)">会员</el-button>
          <el-button v-if="canDelete" link type="danger" icon="Delete" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />

    <el-dialog v-model="challengeOpen" :title="challengeForm.challengeId ? '编辑挑战' : '新增挑战'" width="560px">
      <el-form :model="challengeForm" label-width="90px">
        <el-form-item label="标签"><el-input v-model="challengeForm.tag" placeholder="#轻通勤" /></el-form-item>
        <el-form-item label="标题"><el-input v-model="challengeForm.title" /></el-form-item>
        <el-form-item label="奖励"><el-input v-model="challengeForm.reward" /></el-form-item>
        <el-form-item label="主题色"><el-input v-model="challengeColors" placeholder="#111111,#ffffff" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="challengeOpen=false">取消</el-button><el-button type="primary" @click="saveChallenge">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="memberOpen" title="会员状态" width="480px">
      <el-form :model="memberForm" label-width="90px">
        <el-form-item label="会员方案"><el-radio-group v-model="memberForm.planCode"><el-radio label="free">免费版</el-radio><el-radio label="pro">PRO</el-radio></el-radio-group></el-form-item>
        <el-form-item label="到期时间"><el-date-picker v-model="memberForm.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="memberForm.memberStatus"><el-option label="正常" value="0" /><el-option label="过期" value="1" /><el-option label="停用" value="2" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="memberOpen=false">取消</el-button><el-button type="primary" @click="saveMember">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { createChallenge, listResource, removeResource, updateChallenge, updateMembership, updateResource } from '@/api/wardrobe/admin'

const props = defineProps({
  resource: { type: String, required: true },
  columns: { type: Array, required: true },
  idField: { type: String, required: true },
  statusOptions: { type: Array, default: () => [] },
  canDelete: { type: Boolean, default: true }
})
const { proxy } = getCurrentInstance()
const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10, keyword: undefined, status: undefined, category: undefined })
const challengeOpen = ref(false)
const challengeForm = ref({})
const challengeColors = ref('')
const memberOpen = ref(false)
const memberForm = ref({})

function load() {
  loading.value = true
  listResource(props.resource, query).then(res => {
    rows.value = res.data.list
    total.value = res.data.total
  }).finally(() => loading.value = false)
}
function search() { query.pageNum = 1; load() }
function reset() { Object.assign(query, { pageNum: 1, keyword: undefined, status: undefined, category: undefined }); load() }
function statusLabel(value) { return props.statusOptions.find(item => item.value === String(value))?.label || value }
function statusType(value) { return props.statusOptions.find(item => item.value === String(value))?.type || 'info' }
function remove(row) {
  proxy.$modal.confirm('确认删除该记录？').then(() => removeResource(props.resource, row[props.idField])).then(() => { proxy.$modal.msgSuccess('删除成功'); load() })
}
function setStatus(row, field, value) {
  updateResource(props.resource, row[props.idField], { [field]: value }).then(() => { proxy.$modal.msgSuccess('操作成功'); load() })
}
function handleFeedback(row) {
  ElMessageBox.prompt('请输入回复内容', '处理反馈', { inputValue: row.reply || '' }).then(({ value }) => updateResource('feedback', row.feedbackId, { handleStatus: '2', reply: value })).then(() => { proxy.$modal.msgSuccess('已处理'); load() })
}
function openChallenge(row = {}) {
  challengeForm.value = { ...row }
  challengeColors.value = (row.colors || []).join(',')
  challengeOpen.value = true
}
function saveChallenge() {
  const data = { ...challengeForm.value, colors: challengeColors.value.split(',').map(v => v.trim()).filter(Boolean) }
  const request = data.challengeId ? updateChallenge(data) : createChallenge(data)
  request.then(() => { proxy.$modal.msgSuccess('保存成功'); challengeOpen.value = false; load() })
}
function editMember(row) {
  memberForm.value = { userId: row.userId, planCode: row.planCode || 'free', expireTime: row.expireTime, memberStatus: '0' }
  memberOpen.value = true
}
function saveMember() {
  updateMembership(memberForm.value.userId, memberForm.value).then(() => { proxy.$modal.msgSuccess('会员状态已更新'); memberOpen.value = false; load() })
}
load()
</script>

<style scoped>
.thumb { width: 54px; height: 54px; border-radius: 4px; }
</style>
