<template><ResourceList resource="users" id-field="userId" :columns="columns" :can-delete="false" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const columns = [
  { label:'用户ID', prop:'userId', width:80 }, { label:'账号', prop:'userName' }, { label:'昵称', prop:'nickName' },
  { label:'邮箱', prop:'email' }, { label:'衣物数', prop:'clothingCount', width:90 }, { label:'会员', prop:'planCode', width:90 },
  { label:'注册时间', prop:'createTime', type:'time', width:170 }
]
</script>
