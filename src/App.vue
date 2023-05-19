<template>
<div class="common-layout">
    <el-container>
      <el-main>
          <template v-if="stage === 'csv-upload'">
              <el-row justify="center" style="margin-bottom: 16px; margin-top: 100px">
                  <el-col :span="18" :offset="6">
                      <Title title="Upload CSV files">
                          Please upload CSV file or enter its content manually to continues
                      </Title>
                  </el-col>
              </el-row>
              <el-row>
                  <el-col :span="12" :offset="6">
                      <CsvUploader @upload="onCsvUpload" />
                  </el-col>
              </el-row>
          </template>
          <template v-else-if="stage === 'csv-parser-configuration'">
              <el-row justify="center" style="margin-bottom: 16px; margin-top: 100px">
                  <el-col :span="18" :offset="6">
                      <Title title="Configure CSV format">
                          CSVs need to be parsed in order to do proper comparison
                      </Title>
                  </el-col>
              </el-row>
              <el-row style="margin-bottom: 16px">
                  <el-col :span="12" :offset="6">
                      <CsvParserCompositeConfigurator :csv-data="csvData" @configured="onCsvConfigured"/>
                  </el-col>
              </el-row>
          </template>
          <template v-else-if="stage === 'csv-compare'">
            <CsvComparator :csv-data="csvData" />
          </template>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Title from './components/Title.vue';
import CsvUploader from './components/CsvUploader.vue';
import CsvComparator from "./components/CsvComparator.vue";
import CsvParserCompositeConfigurator from './components/CsvParserCompositeConfigurator.vue';
export default {
    components: {
        Title,
        CsvUploader,
        CsvComparator,
        CsvParserCompositeConfigurator
    },

    data() {
        return {
            stage: 'csv-upload',
            csvData: [],
            csvParserConfig: {}
        }
    },

    methods: {
        onCsvUpload(csvData) {
            this.csvData = csvData;
            // this.stage = 'csv-parser-configuration'
            this.stage = 'csv-compare'
        },
        onCsvConfigured(csvConfigs) {
            this.csvParserConfig = csvConfigs;
            this.stage = 'csv-compare'
        }
    }
}

</script>
