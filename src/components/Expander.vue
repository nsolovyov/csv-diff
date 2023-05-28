<template>
  <div class="expander">
    <div class="expander-title" @click="show = !show">
      <el-icon v-if="showArrow"
               class="expander-title__arrow"
               :class="{ 'is-active': show }"
               :size="12">
        <ArrowRight />
      </el-icon>
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <div class="expander-body">
      <el-collapse-transition>
        <div v-show="show">
          <slot></slot>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
import {ArrowLeft, ArrowRight} from "@element-plus/icons-vue";

export default {
  name: "Expander",
  components: {ArrowRight, ArrowLeft},

  props: {
    title: String,
    showArrow: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      show: false
    };
  },

}
</script>

<style scoped>

.expander-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}

.expander-title:hover {
  cursor: pointer;
}

.expander-title .expander-title__arrow {
  margin-right: 6px;
  transition: transform 0.3s;
}

.expander-title .expander-title__arrow.is-active {
  transform: rotate(90deg);
}

.expander-body {
  margin-top: 8px;
  padding-left: 18px;
  padding-right: 18px;
}

</style>
