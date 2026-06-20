<template><ResourceList resource="feedback" id-field="feedbackId" :columns="columns" :status-options="statuses" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const statuses = [{label:'待处理',value:'0',type:'warning'},{label:'处理中',value:'1',type:'primary'},{label:'已完成',value:'2',type:'success'}]
const columns = [
  { label:'类型', prop:'feedbackType', width:90 }, { label:'标题', prop:'title' }, { label:'内容', prop:'content' },
  { label:'联系方式', prop:'contact' }, { label:'状态', prop:'handleStatus', type:'status', width:100 },
  { label:'提交时间', prop:'createTime', type:'time', width:170 }
]
</script>
