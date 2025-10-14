import React, { useState, useEffect, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  getGridColumns,
  listenForOrientationChange,
  getAdaptivePadding,
} from '../utils/responsive';
import { theme } from '../styles/theme';

const ResponsiveGrid = ({
  data = [],
  renderItem,
  numColumns,
  spacing = theme.spacing.sm,
  contentContainerStyle,
}) => {
  // Log every render for debugging
  console.log(`🔁 ResponsiveGrid rendered with ${data.length} items`);

  const [columns, setColumns] = useState(numColumns || getGridColumns());

  useEffect(() => {
    console.log('📡 ResponsiveGrid: Listening for orientation changes...');
    const subscription = listenForOrientationChange(() => {
      const newCols = numColumns || getGridColumns();
      console.log(`📐 ResponsiveGrid updated columns → ${newCols}`);
      setColumns(newCols);
    });

    return () => {
      console.log('🧹 ResponsiveGrid: Removed orientation listener');
      subscription?.remove();
    };
  }, [numColumns]);

  /**
   * Groups data into rows based on current column count
   */
  const groupedData = [];
  for (let i = 0; i < data.length; i += columns) {
    const row = data.slice(i, i + columns);
    while (row.length < columns) {
      row.push(null); // fill incomplete rows
    }
    groupedData.push(row);
  }

  console.log(
    `📊 ResponsiveGrid layout: ${columns} columns, ${groupedData.length} rows`,
  );

  const renderRow = (rowData, rowIndex) => {
    console.log(`🧩 Rendering row ${rowIndex + 1}/${groupedData.length}`);
    return (
      <View
        key={rowIndex}
        style={[styles.row, { marginHorizontal: -spacing / 2 }]}
      >
        {rowData.map((item, itemIndex) => {
          if (!item) {
            console.log(`⚪ Placeholder cell in row ${rowIndex + 1}`);
            return <View key={itemIndex} style={[styles.item, { flex: 1 }]} />;
          }
          console.log(
            `🎨 Rendering item in row ${rowIndex + 1}:`,
            item.title || item.id,
          );
          return (
            <View
              key={item.id || itemIndex}
              style={[
                styles.item,
                {
                  flex: 1,
                  marginHorizontal: spacing / 2,
                  marginBottom: spacing,
                },
              ]}
            >
              {renderItem(item, itemIndex)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, contentContainerStyle]}>
      {groupedData.map((rowData, rowIndex) => renderRow(rowData, rowIndex))}
    </View>
  );
};

/* ----------------------------- STYLES ----------------------------- */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getAdaptivePadding(),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    // Base item styles
  },
});

/**
 * React.memo helps prevent unnecessary re-renders
 * - The grid only re-renders when props (data, numColumns, etc.) actually change.
 */
export default memo(ResponsiveGrid);
