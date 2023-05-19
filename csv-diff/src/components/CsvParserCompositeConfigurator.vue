<template>
    <el-tabs v-model="activeCsvTab" class="csv-configurator-tabs">
        <el-tab-pane v-for="(csv, index) in csvData"
                     :name="index">
            <template #label>
              <span class="custom-tabs-label">
                    <template v-if="csvConfigs[index]">
                        <el-icon><Checked /></el-icon>
                    </template>
                    CSV {{index}}
              </span>
            </template>
            <CsvParserConfigurator :csv-data="csv"
                                   @configured="config => markConfigured(index, config)"
                                   @reset="() => resetConfigured(index)"/>
        </el-tab-pane>
    </el-tabs>

    <el-row style="margin-top: 28px;">
        <el-button type="primary"
                   size="large"
                   style="width: 100%"
                   :disabled="!isAllConfigured"
                   @click="onCompareClick">
            Compare<el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
    </el-row>
</template>

<script>
import CsvParserConfigurator from './CsvParserConfigurator.vue';
import { Checked, ArrowRight } from '@element-plus/icons-vue'

export default {
    name: "CsvParserCompositeConfigurator",

    components: {
        Checked,
        ArrowRight,
        CsvParserConfigurator,
    },

    props: {
        csvData: {
            type: Array,
            required: true
        }
    },

    data() {
        return {
            activeCsvTab: 0,
            csvConfigs: {}
        }
    },

    computed: {
      isAllConfigured() {
          return Object.keys(this.csvConfigs).length === this.csvData.length;
      }
    },

    methods: {
        markConfigured(csvIndex, config) {
            this.csvConfigs[csvIndex] = config;
            if (!this.isAllConfigured) {
                const configuredCsvIds = Object.keys(this.csvConfigs).map(key => Number(key));
                const allCsvIds = Array.from(this.csvData.keys());
                const csvToConfigure = allCsvIds.filter(id => !configuredCsvIds.includes(id))[0];
                this.activeCsvTab = csvToConfigure;
            }
        },
        resetConfigured(csvIndex) {
            delete this.csvConfigs[csvIndex];
        },
        onCompareClick() {
            this.$emit('configured', this.csvConfigs);
        }
    }
}
</script>

<style scoped>

</style>
