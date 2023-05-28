<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <template v-if="stage === Stage.CSV_UPLOAD">
          <el-row justify="center" style="margin-bottom: 16px; margin-top: 100px">
            <el-col :span="18" :offset="6">
              <Title title="Upload CSV files">
                Please upload CSV file or enter its content manually to continues
              </Title>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="6">
              <CsvUploader @upload="onCsvUpload"/>
            </el-col>
          </el-row>
        </template>
        <template v-else-if="stage === Stage.CSV_COMPARE">
          <CsvComparator :csv-data="csvData" :parser-config="csvParserConfig" />
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Title from './components/Title.vue';
import CsvUploader from './components/CsvUploader.vue';
import CsvComparator from "./components/CsvComparator.vue";

const Stage = Object.freeze({
  CSV_UPLOAD: 'csv-upload',
  CSV_COMPARE: 'csv-compare'
});

export default {
  components: {
    Title,
    CsvUploader,
    CsvComparator,
  },

  data() {
    return {
      stage: Stage.CSV_UPLOAD,
      csvData: [],
      csvParserConfig: {}
    }
  },

  computed: {
    Stage() {
      return Stage;
    }
  },

  methods: {
    onCsvUpload({csvData, config}) {
      this.csvData = csvData;
      this.csvParserConfig = config;
      this.stage = Stage.CSV_COMPARE;
    },
  }
}

</script>
