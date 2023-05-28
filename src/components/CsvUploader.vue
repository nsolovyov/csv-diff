<template>
  <el-tabs v-model="activeTab" class="csv-input-tabs" stretch>
    <el-tab-pane label="From .csv file" name="file-tab">
      <div v-loading="isLoading">
        <el-upload
            v-model:file-list="files"
            class="csv-upload"
            drag
            multiple
            :limit="2"
            accept="text/csv"
            :auto-upload="false"
            :on-exceed="onExceed"
            :on-remove="onRemove"
            :on-change="onChange"
        >
          <el-icon class="el-icon--upload">
            <upload-filled/>
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <div class="el-upload__text">{{ files.length }} / 2</div>
        </el-upload>
      </div>
    </el-tab-pane>
    <el-tab-pane label="Enter manually" name="input-tab" style="margin-bottom: 8px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
              v-model="csvInputSource"
              :rows="8"
              type="textarea"
              placeholder="Source"
          />
        </el-col>
        <el-col :span="12">
          <el-input
              v-model="csvInputTarget"
              :rows="8"
              type="textarea"
              placeholder="Target"
          />
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>

  <Expander title="Advanced options" style="margin-top: 8px">
    <el-form label-width="120px"
             label-position="left"
             size="small"
             style="margin-top: 20px">
      <el-form-item label="New Line">
        <el-col :span="15">
          <el-input v-model="config.newline"
                    :disabled="config.newlineAutoDetect">
          </el-input>
        </el-col>
        <el-col :span="8" :offset="1">
          <el-switch v-model="config.newlineAutoDetect"
                     active-text="Auto detect"/>
        </el-col>
      </el-form-item>

      <el-form-item label="Delimiter">
        <el-col :span="15">
          <el-input v-model="config.delimiter"
                    :disabled="config.delimiterAutoDetect">
          </el-input>
        </el-col>
        <el-col :span="8" :offset="1">
          <el-switch v-model="config.delimiterAutoDetect"
                     active-text="Auto detect"/>
        </el-col>
      </el-form-item>

      <el-form-item>
        <template #label>
          <el-row align="middle">
            <span style="margin-right: 8px">Quote Char</span>
            <InfoTooltip content="The character used to quote fields. The quoting of all fields is not mandatory. Any field which is not quoted will correctly read."/>
          </el-row>
        </template>
        <el-input v-model="config.quoteChar"/>
      </el-form-item>

      <el-form-item>
        <template #label>
          <el-row align="middle">
            <span style="margin-right: 8px">Escape Char</span>
            <InfoTooltip content="The character used to escape the quote character within a field. If not set, this option will default to the value of quoteChar, meaning that the default escaping of quote character within a quoted field is using the quote character two times. (e.g. &quot;column&quot; with &quot;&quot;quotes&quot;&quot; in text&quot;)"/>
          </el-row>
        </template>
        <el-input v-model="config.escapeChar"/>
      </el-form-item>

      <el-form-item label="Skip empty lines:">
        <el-switch v-model="config.skipEmptyLines" />
      </el-form-item>

      <el-form-item>
        <template #label>
          <el-row align="middle">
            <span style="margin-right: 8px">Preview</span>
            <InfoTooltip content="If > 0, only that many rows will be parsed."/>
          </el-row>
        </template>
        <el-input-number v-model="config.preview" />
      </el-form-item>
    </el-form>
  </Expander>

  <el-row style="margin-top: 16px;">
    <el-button type="primary"
               size="large"
               style="width: 100%"
               :disabled="!canCompare"
               @click="onCompareClick">
      Compare
      <el-icon class="el-icon--right">
        <ArrowRight/>
      </el-icon>
    </el-button>
  </el-row>


</template>

<script>
import {UploadFilled, ArrowRight} from '@element-plus/icons-vue';
import Expander from "@/components/Expander.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";

export default {
  components: {
    InfoTooltip,
    Expander,
    UploadFilled,
    ArrowRight
  },
  data() {
    return {
      activeTab: 'file-tab',
      isLoading: false,
      files: [],
      filesContent: {},
      csvInputSource: "",
      csvInputTarget: "",

      config: {
        newlineAutoDetect: true,
        delimiterAutoDetect: true,
        newline: undefined,
        delimiter: undefined,
        quoteChar: '"',
        escapeChar: '"',
        preview: 0,
        skipEmptyLines: false,
      },
    }
  },

  computed: {
    canCompare() {
      switch (this.activeTab) {
        case 'file-tab':
          return !this.isLoading && Object.keys(this.filesContent).length === 2;
        default:
          return this.csvInputSource && this.csvInputTarget;
      }
    }
  },

  methods: {
    onCompareClick() {
      const csvData = this.getCsvContentToCompare();
      const config = {
        newline: this.config.newlineAutoDetect ? undefined : this.config.newline,
        delimiter: this.config.delimiterAutoDetect ? undefined : this.config.delimiter,
        quoteChar: this.config.quoteChar,
        escapeChar: this.config.escapeChar,
        preview: this.config.preview,
        skipEmptyLines: this.config.skipEmptyLines
      }
      this.$emit('upload', { csvData, config });
    },
    getCsvContentToCompare() {
      switch (this.activeTab) {
        case 'file-tab':
          return Object.values(this.filesContent);
        default:
          return [this.csvInputSource, this.csvInputTarget];
      }
    },
    onChange(uploadFile) {
      this.isLoading = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.isLoading = false;
        this.filesContent[uploadFile.uid] = reader.result;
      }
      try {
        reader.readAsText(uploadFile.raw);
      } catch (error) {
        ElMessage.error(`Error loading file ${uploadFile.name}. Check console for details`);
        console.error(`Failed to load file ${uploadFile.name}. Error ${error}`)
        this.isLoading = false;
      }
    },
    onRemove(file) {
      delete this.filesContent[file.uid];
    },
    onExceed() {
      ElMessage.error(`2 files maximum!`)
    }
  }
}

</script>
