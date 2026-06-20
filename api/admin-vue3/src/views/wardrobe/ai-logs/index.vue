<template><ResourceList resource="ai-logs" id-field="logId" :columns="columns" :status-options="statuses" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const statuses = [{label:'成功',value:'0',type:'success'},{label:'失败',value:'1',type:'danger'},{label:'规则回退',value:'2',type:'warning'}]
const columns = [
  { label:'日志ID', prop:'logId', width:90 }, { label:'场景', prop:'scene', width:100 }, { label:'模型', prop:'model' },
  { label:'状态', prop:'callStatus', type:'status', width:100 }, { label:'耗时(ms)', prop:'durationMs', width:100 },
  { label:'错误信息', prop:'errorMessage' }, { label:'调用时间', prop:'createTime', type:'time', width:170 }
]
</script>
