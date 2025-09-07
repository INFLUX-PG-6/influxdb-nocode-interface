import { Request, Response } from 'express';
import { influxService } from '../services/influxService';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * Get all buckets
 */
export const getBuckets = async (req: Request, res: Response) => {
  try {
    const session = req.session!;
    const client = influxService.getClient(session.credentials);
    const queryApi = client.getQueryApi(session.credentials.org);
    
    // 使用Flux查询获取buckets
    const fluxQuery = `buckets()`;
    
    const bucketList: any[] = [];
    
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row: string[], tableMeta) => {
          // 解析bucket信息
          const nameIndex = tableMeta.columns.findIndex(col => col.label === 'name');
          const idIndex = tableMeta.columns.findIndex(col => col.label === 'id');
          
          if (nameIndex !== -1 && idIndex !== -1) {
            bucketList.push({
              id: row[idIndex],
              name: row[nameIndex],
              description: '',
              retentionRules: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      data: bucketList
    };

    logger.info(`Retrieved ${bucketList.length} buckets for org: ${session.credentials.org}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Failed to get buckets:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve buckets. Please check your InfluxDB connection.'
    };
    
    res.status(500).json(response);
  }
};

/**
 * 获取指定bucket的measurements
 */
export const getMeasurements = async (req: Request, res: Response) => {
  try {
    const session = req.session!;
    const { bucketName } = req.params;
    
    if (!bucketName) {
      return res.status(400).json({
        success: false,
        error: 'Bucket name is required'
      });
    }

    const client = influxService.getClient(session.credentials);
    const queryApi = client.getQueryApi(session.credentials.org);
    
    // Flux查询Get measurements
    const fluxQuery = `
      import "influxdata/influxdb/schema"
      
      schema.measurements(bucket: "${bucketName}")
    `;

    const measurements: string[] = [];
    
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row: string[], tableMeta) => {
          // measurements查询返回的数据格式
          const measurementIndex = tableMeta.columns.findIndex(col => col.label === '_value');
          if (measurementIndex !== -1 && row[measurementIndex]) {
            measurements.push(row[measurementIndex]);
          }
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      data: [...new Set(measurements)] // 去重
    };

    logger.info(`Retrieved ${measurements.length} measurements for bucket: ${bucketName}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Failed to get measurements:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve measurements. Please check your bucket name.'
    };
    
    res.status(500).json(response);
  }
};

/**
 * 获取指定measurement的字段信息
 */
export const getFields = async (req: Request, res: Response) => {
  try {
    const session = req.session!;
    const { bucketName, measurement } = req.params;
    
    if (!bucketName || !measurement) {
      return res.status(400).json({
        success: false,
        error: 'Bucket name and measurement are required'
      });
    }

    const client = influxService.getClient(session.credentials);
    const queryApi = client.getQueryApi(session.credentials.org);
    
    // Get fields and tags信息
    const fluxQuery = `
      import "influxdata/influxdb/schema"
      
      schema.fieldKeys(
        bucket: "${bucketName}",
        predicate: (r) => r._measurement == "${measurement}",
        start: -7d
      )
    `;

    const fields: string[] = [];
    
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row: string[], tableMeta) => {
          const fieldIndex = tableMeta.columns.findIndex(col => col.label === '_value');
          if (fieldIndex !== -1 && row[fieldIndex]) {
            fields.push(row[fieldIndex]);
          }
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      data: [...new Set(fields)]
    };

    logger.info(`Retrieved ${fields.length} fields for ${bucketName}/${measurement}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Failed to get fields:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve fields. Please check your parameters.'
    };
    
    res.status(500).json(response);
  }
};

/**
 * 获取标签信息
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const session = req.session!;
    const { bucketName, measurement } = req.params;
    
    if (!bucketName || !measurement) {
      return res.status(400).json({
        success: false,
        error: 'Bucket name and measurement are required'
      });
    }

    const client = influxService.getClient(session.credentials);
    const queryApi = client.getQueryApi(session.credentials.org);
    
    const fluxQuery = `
      import "influxdata/influxdb/schema"
      
      schema.tagKeys(
        bucket: "${bucketName}",
        predicate: (r) => r._measurement == "${measurement}",
        start: -7d
      )
    `;

    const tags: string[] = [];
    
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row: string[], tableMeta) => {
          const tagIndex = tableMeta.columns.findIndex(col => col.label === '_value');
          if (tagIndex !== -1 && row[tagIndex]) {
            tags.push(row[tagIndex]);
          }
        },
        error: (error: Error) => {
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      data: [...new Set(tags)]
    };

    logger.info(`Retrieved ${tags.length} tags for ${bucketName}/${measurement}`);
    res.json(response);

  } catch (error: any) {
    logger.error('Failed to get tags:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve tags. Please check your parameters.'
    };
    
    res.status(500).json(response);
  }
};
