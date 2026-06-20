<template><ResourceList resource="memberships" id-field="membershipId" :columns="columns" :status-options="statuses" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const statuses = [{label:'正常',value:'0',type:'success'},{label:'过期',value:'1',type:'warning'},{label:'停用',value:'2',type:'danger'}]
const columns = [
  { label:'用户ID', prop:'userId' }, { label:'方案', prop:'planCode', width:100 }, { label:'衣橱上限', prop:'wardrobeLimit', width:100 },
  { label:'到期时间', prop:'expireTime', type:'time', width:170 }, { label:'状态', prop:'memberStatus', type:'status', width:90 },
  { label:'更新时间', prop:'updateTime', type:'time', width:170 }
]
</script>
