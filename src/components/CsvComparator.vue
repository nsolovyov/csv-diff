<template>
  <template v-if="parsingErrors && parsingErrors.length > 0">
      <el-row style="margin-bottom: 20px">
          <el-col>
              <Title title="CSV parsing failed!">
                  Check console for more details about the error
              </Title>
          </el-col>
      </el-row>
      <el-alert v-for="(error, index) in parsingErrors"
                :key="`parsing-error-${index}`"
                type="error"
                style="margin-bottom: 10px"
                :closable="false">
        {{ error }}
      </el-alert>
  </template>
  <template v-else>

      <el-row align="middle">
          <el-switch
              v-model="isFirstRowHeader"
              size="small"
              active-text="First row headers"
          />

          <el-divider direction="vertical" />

          <el-button-group>
              <el-tooltip content="Previous difference" placement="left" show-after="500">
                  <el-button size="small" text @click="() => scrollToPreviousDifference()" :disabled="!csvDifferent">
                      <el-icon> <Top /> </el-icon>
                  </el-button>
              </el-tooltip>
              <el-tooltip content="Next difference" placement="top" show-after="500">
                  <el-button size="small" text @click="() => scrollToNextDifference()" :disabled="!csvDifferent">
                      <el-icon> <Bottom /> </el-icon>
                  </el-button>
              </el-tooltip>
          </el-button-group>

          <el-button-group>
              <el-tooltip content="Collapse unchanged rows" placement="right" show-after="500">
                  <el-button size="small"
                             :type="isCollapseRowsModeActive ? 'primary' : 'default'"
                             :text="!isCollapseRowsModeActive"
                             @click="isCollapseRowsModeActive = !isCollapseRowsModeActive">
                      <el-icon> <Sort /> </el-icon>
                  </el-button>
              </el-tooltip>
              <el-tooltip content="Collapse unchanged columns" placement="right" show-after="500">
                  <el-button size="small"
                             :type="isCollapseColumnsModeActive ? 'primary' : 'default'"
                             :text="!isCollapseColumnsModeActive"
                             @click="isCollapseColumnsModeActive = !isCollapseColumnsModeActive">
                      <el-icon> <Switch /> </el-icon>
                  </el-button>
              </el-tooltip>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-tooltip content="Show changed values from source" placement="right" show-after="500">
              <el-button size="small"
                         :type="showSourceValue ? 'primary' : 'default'"
                         :text="!showSourceValue"
                         @click="showSourceValue = !showSourceValue">
                  <el-icon>
                      <View v-if="!showSourceValue" />
                      <Hide v-else />
                  </el-icon>
              </el-button>
          </el-tooltip>

          <el-divider direction="vertical" />


          <el-select v-model="sortBy"
                     placeholder="Sort by"
                     size="small"
                     clearable>
              <el-option v-for="column in columns.slice(1)"
                         :key="column.key"
                         :label="column.title"
                         :value="column.key"/>
          </el-select>
      </el-row>



      <div style="height: 80vh; margin-top: 8px">
          <el-auto-resizer>
              <template #default="{ height, width }">
                  <el-table-v2 :columns="columns"
                               size="small"
                               :data="data"
                               :width="width"
                               :height="height"
                               :row-class="rowClass"
                               class="diff-table"
                               ref="diff-table"
                               @rows-rendered="onRowRendered"
                               border
                               fixed>
                      <template #header-cell="data">
                          <template v-if="columnsWithDiff.includes(data.column.id + 1)">
                              <span style="font-weight: 700; color: #579be0">{{ data.column.title }}</span>
                              <el-button-group  style="display: flex">
                                  <el-tooltip content="Previous difference" placement="left" show-after="500">
                                      <el-button size="small" text @click="() => scrollToPreviousDifference(data.column.id)">
                                          <el-icon> <Top /> </el-icon>
                                      </el-button>
                                  </el-tooltip>
                                  <el-tooltip content="Next difference" placement="top" show-after="500">
                                      <el-button size="small" text @click="() => scrollToNextDifference(data.column.id)">
                                          <el-icon> <Bottom /> </el-icon>
                                      </el-button>
                                  </el-tooltip>
                              </el-button-group>
                          </template>
                          <template v-else>
                              {{ data.column.title }}
                          </template>

                      </template>
                      <template #cell="data">
                          <span :class="{
                              'table-cell--modified': findDiffInRow(data.rowData.diff, data.column.id)?.type === DiffType.MODIFIED,
                              'table-cell--added': findDiffInRow(data.rowData.diff, data.column.id)?.type === DiffType.ADDED,
                              'table-cell--removed': findDiffInRow(data.rowData.diff, data.column.id)?.type === DiffType.REMOVED,
                          }">
                              <template v-if="showSourceValue && findDiffInRow(data.rowData.diff, data.column.id)">
                                <template v-if="findDiffInRow(data.rowData.diff, data.column.id).type === DiffType.MODIFIED">
                                    <el-text tag="del">{{ findDiffInRow(data.rowData.diff, data.column.id).oldValue }}</el-text>
                                    -> {{ data.rowData[data.column.dataKey] }}
                                </template>
                                  <template v-else-if="findDiffInRow(data.rowData.diff, data.column.id).type === DiffType.REMOVED">
                                      {{ data.rowData[data.column.dataKey] }}
                                  </template>
                              </template>
                              <template v-else>
                                {{ data.rowData[data.column.dataKey] }}
                              </template>
                          </span>
                      </template>
                  </el-table-v2>
              </template>
          </el-auto-resizer>
      </div>

      <el-row v-if="csvDifferent"
              justify="space-between" class="changes-stats" style="margin-top: 32px">
          <el-statistic title="All changes" :value="statistics.allChanges">
              <template #suffix>
                  / {{ statistics.totalCellsCount }}
                  <sup class="changes-stats_percentage">{{ Math.floor(statistics.allChanges * 100 / statistics.totalCellsCount) }}%</sup>
              </template>
          </el-statistic>
          <el-statistic title="Row changes" :value="statistics.rowChanges">
              <template #suffix>
                  / {{ csvDiff.length }}
                  <sup class="changes-stats_percentage">{{ Math.floor(statistics.rowChanges * 100 / csvDiff.length) }}%</sup>
              </template>
          </el-statistic>
          <el-statistic title="Removals" :value="statistics.removals"/>
          <el-statistic title="Additions" :value="statistics.additions"/>
          <el-statistic title="Modifications" :value="statistics.modification"/>
      </el-row>
      <el-alert v-else
                title="CSVs are identical. Great job!"
                style="margin-top: 32px"
                type="success"
                center
                :closable="false"
                show-icon />
  </template>
</template>

<script>
import Papa from 'papaparse';
import {Top, Bottom, Sort, Switch, View, Hide} from '@element-plus/icons-vue';
import compare, {DiffType} from '../utils/diff-utils';


export default {
    name: "CsvComparator",

    components: {
        Switch,
        Top, Bottom, Sort, View, Hide
    },

    props: {
        csvData: {
            type: Array,
            required: true
        }
    },

    data() {
      return {
          sortBy: '',
          isFirstRowHeader: true,
          isCollapseRowsModeActive: false,
          isCollapseColumnsModeActive: false,
          showSourceValue: false,
          parsingErrors: [],
          parsedCsvData: [],
          csvDiff: [],

          rowVisible: {
              start: 0,
              end: 0,
          },
          diffPointer: {
            row: -1,
            col: -1
          },

          statistics: {
            allChanges: 0,
            totalCellsCount: 0,
            rowChanges: 0,
            removals: 0,
            additions: 0,
            modification: 0,
          },
          columns: [],
          columnsWithDiff: [],
          data: [],
      }
    },

    watch: {
        isFirstRowHeader() {
            this.updateColumns();
            this.updateData();
        },
        isCollapseRowsModeActive() {
            this.updateColumns();
            this.updateData();
        },
        isCollapseColumnsModeActive() {
            this.updateColumns();
            this.updateData();
        }
    },

    computed: {
        DiffType() {
            return DiffType
        },
        csvDifferent() {
            return this.statistics.allChanges > 0;
        }
    },

    async created() {
        await this.parseAll();
        await this.compare();
        this.updateColumns();
        this.updateData();
    },

    methods: {
        parse(csv) {
            return new Promise((resolve, reject) => {
                Papa.parse(csv, {
                    complete: (results, file) => {
                        if (results.error && results.error.length > 0) {
                            console.log(results)
                            reject(results.error);
                        } else {
                            resolve(results, file);
                        }
                    }
                })
            })
        },
        async parseAll() {
            const loader = ElLoading.service({
                text: "Parsing CSVs"
            });

            try {
                const data = await Promise.all(this.csvData.map(this.parse));
                this.parsedCsvData = data.map(d => d.data);
            } catch (error) {
                this.parsingErrors = error;
            } finally {
                loader.close();
            }
        },
        async compare() {
            const loader = ElLoading.service({ text: "Looking for difference..." });
            this.csvDiff = await compare(this.parsedCsvData[0], this.parsedCsvData[1]);
            loader.close();
        },
        updateColumns() {
            const rows = this.csvDiff.map(diff => diff.row);
            const maxRowSize = Math.max(...(rows.map(row => row.length)));
            const columns = Array.from(Array(maxRowSize).keys()).map(id => `Column ${id}`);
            if (this.isFirstRowHeader) {
                rows[0].forEach((row, id) => {
                    columns[id] = row;
                })
            }
            this.columns = columns.map((col, id) => ({
                id,
                key: `column-${id}`,
                dataKey: `column-${id}`,
                title: col,
                width: 220
            }));
            this.columns.unshift({
                key: 'column-n',
                dataKey: 'column-n',
                width: 50,
                title: '#',
                align: 'center',
            });

            this.columnsWithDiff = Array.from(
                this.csvDiff.reduce((diffColumns, currentRow) => {
                    currentRow.diff.map(d => d.column + 1).forEach(d => diffColumns.add(d));
                    return diffColumns;
                }, new Set())
            );

            if (this.isCollapseColumnsModeActive) {
                const columnsToKeep = [ ...this.columnsWithDiff ];
                columnsToKeep.push(0);

                this.columns = this.columns.filter((column, index) => {
                    return columnsToKeep.includes(index);
                });
            }

        },
        updateData() {
            this.data = this.csvDiff.filter((diff, index) => this.isFirstRowHeader ? index !== 0 : true)
                .map((rowDiff, rowId) => {
                    const row = rowDiff.row.reduce((o, row, idx) => {
                        o[`column-${idx}`] = row;
                        return o;
                    }, {});
                    row['column-n'] = rowId + 1;
                    row.id = `row-${rowId}`;
                    row.diff = rowDiff.diff;
                    return row;
                });
            if (this.isCollapseRowsModeActive) {
                this.data = this.data.filter(rowData => rowData.diff && rowData.diff.length > 0)
            }
            this.updateStatistics();
        },
        updateStatistics() {
            this.statistics.allChanges = this.data.reduce((value, row) => value + (row.diff || []).length, 0);
            this.statistics.totalCellsCount = this.csvDiff.reduce((value, diff) => value + (diff.row || []).length, 0);
            this.statistics.rowChanges = this.data.reduce((value, row) => value + ((row.diff || []).length > 0 ? 1 : 0), 0);
            this.statistics.removals = this.data.reduce((value, row) => {
                return value + (row.diff || []).filter(diff => diff.type === DiffType.REMOVED).length
            }, 0);
            this.statistics.additions = this.data.reduce((value, row) => {
                return value + (row.diff || []).filter(diff => diff.type === DiffType.ADDED).length
            }, 0);
            this.statistics.modification = this.data.reduce((value, row) => {
                return value + (row.diff || []).filter(diff => diff.type === DiffType.MODIFIED).length
            }, 0);
        },
        findDiffInRow(diff, columnIndex) {
            return diff?.find(d => d.column === columnIndex);
        },
        onRowRendered({ rowVisibleStart, rowVisibleEnd }) {
            this.rowVisible.start = rowVisibleStart;
            this.rowVisible.end = rowVisibleEnd;
            if (this.diffPointer.row !== -1 && !this.isRowVisible(this.diffPointer.row)) {
                this.diffPointer.row = -1;
            }
        },
        scrollToNextDifference(column, startOver = false) {
            const currentRowPointer = this.isRowVisible(this.diffPointer.row) ? this.diffPointer.row : this.rowVisible.start;
            const dataToLook = this.data.map((row, id) => ({id, diff: row.diff}))
                                        .slice(startOver ? 0 : currentRowPointer + 1)
                                        .filter(row => (row.diff || []).length > 0)
                                        .filter(row => {
                                            if (!column) {
                                                return true;
                                            }
                                            return !!row.diff.find(diff => diff.column === column);
                                        });
            const rowToScroll = dataToLook[0];
            if (!rowToScroll) {
                this.scrollToNextDifference(column, true);
                return;
            }

            this.$refs['diff-table'].scrollToRow(rowToScroll.id)
            this.diffPointer.row = rowToScroll.id;
        },
        scrollToPreviousDifference(column, startOver = false) {
            const currentRowPointer = this.isRowVisible(this.diffPointer.row) ? this.diffPointer.row : this.rowVisible.end;
            const dataToLook = this.data.map((row, id) => ({id, diff: row.diff}))
                                        .slice(0, startOver ? this.data.length : currentRowPointer)
                                        .filter(row => (row.diff || []).length > 0)
                                        .filter(row => {
                                            if (!column) {
                                                return true;
                                            }
                                            return !!row.diff.find(diff => diff.column === column);
                                        });
            const rowToScroll = dataToLook[dataToLook.length - 1];
            if (!rowToScroll) {
                this.scrollToPreviousDifference(column, true);
                return;
            }

            this.$refs['diff-table'].scrollToRow(rowToScroll.id)
            this.diffPointer.row = rowToScroll.id;
        },
        isRowVisible(rowNumber) {
            return this.rowVisible.start <= rowNumber && this.rowVisible.end >= rowNumber;
        },
        rowClass({ rowIndex }) {
            if (rowIndex === this.diffPointer.row) {
                return 'diff-table__row--highlighted';
            }
        }
    }
}
</script>

<style>

.diff-table .el-table-v2__row > .el-table-v2__row-cell .table-cell--modified {
    background: #e2eaff;
}

.diff-table .el-table-v2__row > .el-table-v2__row-cell .table-cell--added {
    background: #e1f8d8;
}

.diff-table .el-table-v2__row > .el-table-v2__row-cell .table-cell--removed {
    background: #ffebeb;
}

.diff-table .el-table-v2__row.diff-table__row--highlighted {
    background: #eef0f7;
}

.changes-stats .el-col {
    text-align: center;
}

.changes-stats .changes-stats_percentage {
    font-size: 12px;
    color: #f03838;
}

</style>
