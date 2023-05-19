<template>
    <pre class="code-block">
<code v-for="(codeLine, index) in codeLines" :key="`code-line-${index}`">{{codeLine}}
</code></pre>

</template>

<script>
export default {
    name: "CodeBlock",

    props: {
        code: String,
        crop: {
            type: Boolean,
            default: false
        },
        linesLimit: {
            type: Number,
            default: 10
        }
    },

    computed: {
        codeLines() {
            const codeLines = this.code.split(/\r\n|\r|\n/);
            if (!this.crop) {
                return codeLines;
            }

            return codeLines.slice(0, this.linesLimit);
        }
    }
}
</script>

<style scoped>
pre.code-block {
    background: #eee;
    border-radius: 4px;
    overflow: auto;
}
pre.code-block::before {
    counter-reset: listing;
}
pre.code-block code {
    counter-increment: listing;
}
pre.code-block code::before {
    content: counter(listing) "  ";
    display: inline-block;
    margin-left: auto;  /* now works */
    text-align: right;  /* now works */
    padding-left: 8px;
    background: #e6e6e6;
    margin-right: 12px;
    border-right: 1px solid #c5c5c5;
    color: #a8a8a8;
}

pre.code-block code:first-child::before {
    border-top-left-radius: 4px;
    padding-top: 4px;
}

pre.code-block code:last-child::before {
    border-bottom-left-radius: 4px;
    padding-bottom: 4px;
}

</style>
