<template>
  <el-tooltip v-bind="$props">
    <el-icon class="icon" :size="14" style=""><QuestionFilled /></el-icon>
  </el-tooltip>
</template>

<script>
import {QuestionFilled} from "@element-plus/icons-vue";

export default {
  name: 'InfoTooltip',
  components: {QuestionFilled},
}
</script>

<style scoped>
.icon {
  cursor: pointer;
}
</style>
