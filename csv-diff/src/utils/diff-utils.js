export const DiffType = Object.freeze({
    MODIFIED: 'MODIFIED',
    ADDED: 'ADDED',
    REMOVED: 'REMOVED',
});

export default async function compare(sourceCsv, targetCsv) {
    let result = [];
    const rowsCount = Math.max(sourceCsv.length, targetCsv.length);
    for (let i = 0; i < rowsCount; i++) {
        result.push(compareRow((sourceCsv[i] || []), (targetCsv[i] || [])));
    }
    return result;
};

export function compareRow(sourceRow, targetRow) {
    let result = {
        row: [],
        diff: []
    };
    const cellCount = Math.max(sourceRow.length, targetRow.length);
    for (let i = 0; i < cellCount; i++) {
        const cellDiff = compareCell(sourceRow[i], targetRow[i]);
        result.row.push(cellDiff.resultedCell);
        if (cellDiff.diff) {
            result.diff.push({column: i, ...cellDiff.diff});
        }
    }
    return result;
}

export function compareCell(sourceCell, targetCell) {
    if (sourceCell === targetCell) {
        return { resultedCell: targetCell };
    }

    if (!sourceCell || sourceCell.length === 0) {
        return { resultedCell: targetCell, diff: { type: DiffType.ADDED } };
    }

    if (!targetCell || targetCell.length === 0) {
        return { resultedCell: sourceCell, diff: { type: DiffType.REMOVED } };
    }

    return {
        resultedCell: targetCell,
        diff: {
            type: DiffType.MODIFIED,
            oldValue: sourceCell
        }
    }
}
