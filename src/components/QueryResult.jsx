import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  DataObject,
  TableChart
} from '@mui/icons-material';

const QueryResult = ({ data, loading, error, query }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Executing query...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="h6">Query Error</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <DataObject sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary">
          Click "Run Query" to see results
        </Typography>
      </Paper>
    );
  }

  const { columns = [], rows = [], totalRows = 0, executionTime } = data;

  return (
    <Paper sx={{ p: 2 }}>
      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          icon={<TableChart />}
          label={`${totalRows} rows`}
          color="primary"
          size="small"
        />
        <Chip 
          icon={<AccessTime />}
          label={`${Date.now() - executionTime}ms`}
          color="secondary"
          size="small"
        />
        <Chip 
          icon={<DataObject />}
          label={`${columns.length} columns`}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Query Display */}
      {query && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block" gutterBottom>
            Executed Query:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
            {query}
          </Typography>
        </Box>
      )}

      {/* Data Table */}
      {rows.length > 0 ? (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {row[column] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No data returned from query
          </Typography>
        </Box>
      )}

      {/* If results truncated */}
      {totalRows >= 100 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Results limited to 100 rows. Use more specific filters to see different data.
        </Alert>
      )}
    </Paper>
  );
};

export default QueryResult;
