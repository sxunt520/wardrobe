<template><ResourceList resource="outfits" id-field="outfitId" :columns="columns" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const columns = [
  { label:'用户', prop:'userName' }, { label:'场景', prop:'scene', width:90 }, { label:'标题', prop:'title' },
  { label:'评分', prop:'score', width:80 }, { label:'天气', prop:'weather' }, { label:'收藏', prop:'isSaved', type:'boolean', width:70 },
  { label:'生成时间', prop:'createTime', type:'time', width:170 }
]
</script>
