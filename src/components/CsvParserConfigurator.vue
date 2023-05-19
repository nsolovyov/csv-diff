<template>
  <el-row>
      <CodeBlock crop
                 :lines-limit="5"
                 :code="csvData" />
  </el-row>
  <el-form ref="formRef"
           :model="config"
           :rules="configRules"
           label-width="120px"
           label-position="left"
           style="margin-top: 16px"
           status-icon>
    <el-alert title="Info" type="info" show-icon :closable="false" style="margin-bottom: 12px">
        <p>Character set in <el-text tag="b">Wrap</el-text> is the character that field values are wrapped in</p>
    </el-alert>
    <el-form-item label="End Of Line" prop="eol">
        <el-input v-model="config.eol" />
    </el-form-item>
    <el-form-item label="Field delimiter" prop="field">
        <el-input v-model="config.field" />
    </el-form-item>
    <el-form-item label="Wrap" prop="wrap">
        <el-input v-model="config.wrap" />
    </el-form-item>
  </el-form>
    <el-button type="primary" @click="submitForm('formRef')">
        Apply
    </el-button>
    <el-button @click="resetForm('formRef')">Reset</el-button>
</template>

<script>
import CodeBlock from "./CodeBlock.vue";

export default {
    name: "CsvParserConfigurator",

    components: {
        CodeBlock
    },

    props: {
        csvData: {
            type: String,
            default: ""
        }
    },

    data() {
        return {
            config: {
              eol: "\\n",
              field: ",",
              wrap: "\"",
            },
            configRules: {
                eol: [{ required: true, message: 'Please input End Of Line delimiter', trigger: 'blur' }],
                field: [{ required: true, message: 'Please input End Of Line delimiter', trigger: 'blur' }],
                wrap: [{ required: true, message: 'Please input End Of Line delimiter', trigger: 'blur' }],
            }
        }
    },

    methods: {
        async submitForm(formName) {
            await this.$refs[formName].validate((valid, fields) => {
                if (valid) {
                    this.$emit('configured', this.config);
                }
            })
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.$emit('reset');
        }
    }
}
</script>

<style scoped>

</style>
