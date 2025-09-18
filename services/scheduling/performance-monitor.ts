/**
 * Enterprise Performance Monitoring and Caching for Scheduling System
 * 
 * Provides comprehensive performance monitoring, caching, and optimization
 * for the scheduling system with metrics collection and analysis.
 */

import { ScheduleData, WorkingDay } from '@/types/schedule-types';

// Performance Metrics
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// Cache Configuration
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  enableMetrics: boolean;
}

// Cache Entry
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
}

// Performance Monitor Class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  public startTimer(
    operation: string
  ): (success?: boolean, error?: string, metadata?: Record<string, any>) => void {
    const startTime = Date.now();
    
    return (success: boolean = true, error?: string, metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        success,
        error,
        metadata
      });
    };
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance statistics
   */
  public getStats(operation?: string): {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    errorRate: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        successRate: 0,
        errorRate: 0,
        p95Duration: 0,
        p99Duration: 0
      };
    }

    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const successfulOps = filteredMetrics.filter(m => m.success).length;
    const failedOps = filteredMetrics.length - successfulOps;

    return {
      totalOperations: filteredMetrics.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      successRate: (successfulOps / filteredMetrics.length) * 100,
      errorRate: (failedOps / filteredMetrics.length) * 100,
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)]
    };
  }

  /**
   * Get recent metrics
   */
  public getRecentMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }
}

// Cache Manager Class
export class CacheManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Get data from cache
   */
  public get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Set data in cache
   */
  public set(key: string, data: T, customTtl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: customTtl || this.config.ttl,
      accessCount: 0,
      lastAccessed: new Date()
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete data from cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    averageAccessCount: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalEntries = entries.length;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalEntries > 0 ? (totalAccesses / totalEntries) : 0,
      averageAccessCount: totalEntries > 0 ? totalAccesses / totalEntries : 0
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = new Date();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean expired entries
   */
  public cleanExpired(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Scheduling Cache Manager
export class SchedulingCacheManager {
  private static instance: SchedulingCacheManager;
  private scheduleCache: CacheManager<ScheduleData>;
  private workingDaysCache: CacheManager<WorkingDay[]>;
  private performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.scheduleCache = new CacheManager<ScheduleData>({
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enableMetrics: true
    });

    this.workingDaysCache = new CacheManager<WorkingDay[]>({
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 200,
      enableMetrics: true
    });

    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  public static getInstance(): SchedulingCacheManager {
    if (!SchedulingCacheManager.instance) {
      SchedulingCacheManager.instance = new SchedulingCacheManager();
    }
    return SchedulingCacheManager.instance;
  }

  /**
   * Get doctor schedule from cache
   */
  public getDoctorSchedule(doctorId: string): ScheduleData | null {
    const timer = this.performanceMonitor.startTimer('cache.getDoctorSchedule');
    
    try {
      const result = this.scheduleCache.get(`schedule:${doctorId}`);
      timer(true, undefined, { doctorId, cacheHit: !!result });
      return result;
    } catch (error) {
      timer(false, error instanceof Error ? error.message : 'Unknown error', { doctorId });
      return null;
    }
  }

  /**
   * Set doctor schedule in cache
   */
  public setDoctorSchedule(doctorId: string, schedule: ScheduleData): void {
    const timer = this.performanceMonitor.startTimer('cache.setDoctorSchedule');
    
    try {
      this.scheduleCache.set(`schedule:${doctorId}`, schedule);
      timer(true, undefined, { doctorId });
    } catch (error) {
      timer(false, error instanceof Error ? error.message : 'Unknown error', { doctorId });
    }
  }

  /**
   * Get working days from cache
   */
  public getWorkingDays(doctorId: string): WorkingDay[] | null {
    const timer = this.performanceMonitor.startTimer('cache.getWorkingDays');
    
    try {
      const result = this.workingDaysCache.get(`workingDays:${doctorId}`);
      timer(true, undefined, { doctorId, cacheHit: !!result });
      return result;
    } catch (error) {
      timer(false, error instanceof Error ? error.message : 'Unknown error', { doctorId });
      return null;
    }
  }

  /**
   * Set working days in cache
   */
  public setWorkingDays(doctorId: string, workingDays: WorkingDay[]): void {
    const timer = this.performanceMonitor.startTimer('cache.setWorkingDays');
    
    try {
      this.workingDaysCache.set(`workingDays:${doctorId}`, workingDays);
      timer(true, undefined, { doctorId });
    } catch (error) {
      timer(false, error instanceof Error ? error.message : 'Unknown error', { doctorId });
    }
  }

  /**
   * Invalidate doctor's cache
   */
  public invalidateDoctor(doctorId: string): void {
    this.scheduleCache.delete(`schedule:${doctorId}`);
    this.workingDaysCache.delete(`workingDays:${doctorId}`);
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.scheduleCache.clear();
    this.workingDaysCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    scheduleCache: ReturnType<CacheManager<ScheduleData>['getStats']>;
    workingDaysCache: ReturnType<CacheManager<WorkingDay[]>['getStats']>;
    performance: ReturnType<PerformanceMonitor['getStats']>;
  } {
    return {
      scheduleCache: this.scheduleCache.getStats(),
      workingDaysCache: this.workingDaysCache.getStats(),
      performance: this.performanceMonitor.getStats()
    };
  }

  /**
   * Clean expired cache entries
   */
  public cleanExpired(): { scheduleCleaned: number; workingDaysCleaned: number } {
    return {
      scheduleCleaned: this.scheduleCache.cleanExpired(),
      workingDaysCleaned: this.workingDaysCache.cleanExpired()
    };
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const schedulingCache = SchedulingCacheManager.getInstance();

