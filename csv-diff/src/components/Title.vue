<template>
    <h1 style="font-size: var(--el-font-size-extra-large);">
        {{ title }}
    </h1>
    <p style="font-size: var(--el-font-size-base); color: var(--el-color-info)">
        <slot></slot>
    </p>
</template>

<script>
export default {
    name: "Title",

    props: {
        title: String
    }
}
</script>

<style scoped>

</style>
