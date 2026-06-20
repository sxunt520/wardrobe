<template><ResourceList resource="clothing" id-field="clothingId" :columns="columns" /></template>
<script setup>
import ResourceList from '../components/ResourceList.vue'
const columns = [
  { label:'图片', prop:'imageUrl', type:'image', width:80 }, { label:'用户', prop:'userName' }, { label:'名称', prop:'name' },
  { label:'分类', prop:'category', width:90 }, { label:'颜色', prop:'color', width:100 }, { label:'品牌', prop:'brand' },
  { label:'收藏', prop:'isFavorite', type:'boolean', width:70 }, { label:'常穿', prop:'isFrequent', type:'boolean', width:70 },
  { label:'创建时间', prop:'createTime', type:'time', width:170 }
]
</script>
