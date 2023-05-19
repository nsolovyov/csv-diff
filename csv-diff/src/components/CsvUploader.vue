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

    <el-row style="margin-top: 12px;">
        <el-button type="primary"
                   size="large"
                   style="width: 100%"
                   :disabled="!canCompare"
                   @click="onCompareClick">
            Compare<el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
    </el-row>


</template>

<script>
import { UploadFilled, ArrowRight } from '@element-plus/icons-vue';

export default {
    components: {
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
            csvInputTarget: ""
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
            const csvContent = this.getCsvContentToCompare();
            this.$emit('upload', csvContent);
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
