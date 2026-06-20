<template><ResourceList resource="challenges" id-field="challengeId" :columns="columns" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const columns = [
  { label:'标签', prop:'tag' }, { label:'标题', prop:'title' }, { label:'奖励', prop:'reward' },
  { label:'参与人数', prop:'participants', width:100 }, { label:'创建时间', prop:'createTime', type:'time', width:170 }
]
</script>
