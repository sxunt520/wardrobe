<template><ResourceList resource="submissions" id-field="submissionId" :columns="columns" :status-options="statuses" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const statuses = [{label:'待审核',value:'0',type:'warning'},{label:'已通过',value:'1',type:'success'},{label:'已拒绝',value:'2',type:'danger'}]
const columns = [
  { label:'图片', prop:'imageUrl', type:'image', width:80 }, { label:'用户ID', prop:'userId' }, { label:'标题', prop:'title' },
  { label:'AI评分', prop:'aiScore', width:90 }, { label:'审核状态', prop:'auditStatus', type:'status', width:100 },
  { label:'投稿时间', prop:'createTime', type:'time', width:170 }
]
</script>
