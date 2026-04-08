/**
 * Fast-Check Configuration and Utilities
 * 
 * This module provides configuration presets and utility functions
 * for consistent property-based testing across the project.
 */

import * as fc from 'fast-check';

/**
 * Default configuration for property-based tests
 * 
 * Balances between test coverage and execution time
 */
export const defaultFastCheckConfig: fc.Parameters<any> = {
  numRuns: 100,           // Number of test cases to generate
  maxSkipsPerRun: 10,     // Max skipped cases before failure
  timeout: 5000,          // Timeout per test case (ms)
  seed: undefined,        // Seed for reproducibility (undefined = random)
  verbose: false,         // Verbose output
  interruptAfterTimeLimit: 60000, // Stop after 60 seconds
};

/**
 * Configuration for quick smoke tests
 * 
 * Fewer test cases for faster feedback during development
 */
export const quickFastCheckConfig: fc.Parameters<any> = {
  numRuns: 10,
  maxSkipsPerRun: 5,
  timeout: 1000,
  verbose: false,
};

/**
 * Configuration for thorough testing
 * 
 * More test cases for comprehensive coverage
 */
export const thoroughFastCheckConfig: fc.Parameters<any> = {
  numRuns: 1000,
  maxSkipsPerRun: 50,
  timeout: 10000,
  verbose: true,
};

/**
 * Configuration for CI/CD pipelines
 * 
 * Balanced for reliability and speed in automated environments
 */
export const cicdFastCheckConfig: fc.Parameters<any> = {
  numRuns: 500,
  maxSkipsPerRun: 25,
  timeout: 5000,
  verbose: true,
  interruptAfterTimeLimit: 120000, // 2 minutes max
};

/**
 * Helper function to run a property test with default configuration
 * 
 * @param property - The property to test
 * @param config - Optional configuration overrides
 */
export function assertProperty<T>(
  property: fc.IRawProperty<any, any>,
  config?: Partial<fc.Parameters<T>>
): void {
  const finalConfig = { ...defaultFastCheckConfig, ...config };
  fc.assert(property, finalConfig);
}

/**
 * Helper function to run a property test with quick configuration
 * 
 * Useful for development and quick feedback loops
 * 
 * @param property - The property to test
 * @param config - Optional configuration overrides
 */
export function assertPropertyQuick<T>(
  property: fc.IRawProperty<any, any>,
  config?: Partial<fc.Parameters<T>>
): void {
  const finalConfig = { ...quickFastCheckConfig, ...config };
  fc.assert(property, finalConfig);
}

/**
 * Helper function to run a property test with thorough configuration
 * 
 * Useful for critical business logic and before releases
 * 
 * @param property - The property to test
 * @param config - Optional configuration overrides
 */
export function assertPropertyThorough<T>(
  property: fc.IRawProperty<any, any>,
  config?: Partial<fc.Parameters<T>>
): void {
  const finalConfig = { ...thoroughFastCheckConfig, ...config };
  fc.assert(property, finalConfig);
}

/**
 * Helper function to run a property test with CI/CD configuration
 * 
 * Useful for automated testing in pipelines
 * 
 * @param property - The property to test
 * @param config - Optional configuration overrides
 */
export function assertPropertyCICD<T>(
  property: fc.IRawProperty<any, any>,
  config?: Partial<fc.Parameters<T>>
): void {
  const finalConfig = { ...cicdFastCheckConfig, ...config };
  fc.assert(property, finalConfig);
}

/**
 * Utility to create a reproducible test with a specific seed
 * 
 * Useful for debugging failing tests
 * 
 * @param property - The property to test
 * @param seed - The seed value for reproducibility
 * @param config - Optional configuration overrides
 */
export function assertPropertyWithSeed<T>(
  property: fc.IRawProperty<any, any>,
  seed: number,
  config?: Partial<fc.Parameters<T>>
): void {
  const finalConfig = { ...defaultFastCheckConfig, ...config, seed };
  fc.assert(property, finalConfig);
}

/**
 * Utility to sample test data without running assertions
 * 
 * Useful for understanding what data is being generated
 * 
 * @param arbitrary - The arbitrary to sample from
 * @param count - Number of samples to generate
 */
export function sampleArbitrary<T>(
  arbitrary: fc.Arbitrary<T>,
  count: number = 10
): T[] {
  return fc.sample(arbitrary, count);
}

/**
 * Utility to generate a single random value
 * 
 * @param arbitrary - The arbitrary to generate from
 */
export function generateSingle<T>(arbitrary: fc.Arbitrary<T>): T {
  return fc.sample(arbitrary, 1)[0]!;
}

/**
 * Utility to check if a property holds for specific examples
 * 
 * Useful for testing edge cases
 * 
 * @param property - The property to test
 * @param examples - Specific examples to test
 */
export function assertPropertyForExamples<T>(
  property: (value: T) => boolean,
  examples: T[]
): void {
  for (const example of examples) {
    if (!property(example)) {
      throw new Error(`Property failed for example: ${JSON.stringify(example)}`);
    }
  }
}

/**
 * Utility to combine multiple arbitraries into a single one
 * 
 * @param arbitraries - Array of arbitraries to combine
 */
export function combineArbitraries<T extends any[]>(
  ...arbitraries: { [K in keyof T]: fc.Arbitrary<T[K]> }
): fc.Arbitrary<T> {
  return fc.tuple(...arbitraries) as unknown as fc.Arbitrary<T>;
}

/**
 * Utility to create a filtered arbitrary
 * 
 * @param arbitrary - The base arbitrary
 * @param predicate - Filter function
 */
export function filterArbitrary<T>(
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => boolean
): fc.Arbitrary<T> {
  return arbitrary.filter(predicate);
}

/**
 * Utility to map an arbitrary to a different type
 * 
 * @param arbitrary - The base arbitrary
 * @param mapper - Mapping function
 */
export function mapArbitrary<T, U>(
  arbitrary: fc.Arbitrary<T>,
  mapper: (value: T) => U
): fc.Arbitrary<U> {
  return arbitrary.map(mapper);
}

/**
 * Utility to create a chain of arbitraries
 * 
 * Useful for dependent data generation
 * 
 * @param arbitrary - The base arbitrary
 * @param chainer - Function that returns next arbitrary based on previous value
 */
export function chainArbitraries<T, U>(
  arbitrary: fc.Arbitrary<T>,
  chainer: (value: T) => fc.Arbitrary<U>
): fc.Arbitrary<U> {
  return arbitrary.chain(chainer);
}

/**
 * Utility to create a shrinkable arbitrary
 * 
 * Ensures that when a test fails, fast-check finds the minimal failing case
 * 
 * @param arbitrary - The arbitrary to make shrinkable
 */
export function ensureShrinkable<T>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<T> {
  return arbitrary;
}

/**
 * Utility to log generated test data for debugging
 * 
 * @param arbitrary - The arbitrary to sample from
 * @param count - Number of samples to log
 * @param label - Label for the output
 */
export function debugArbitrary<T>(
  arbitrary: fc.Arbitrary<T>,
  count: number = 5,
  label: string = 'Generated Data'
): void {
  const samples = fc.sample(arbitrary, count);
  console.log(`\n${label}:`);
  samples.forEach((sample, index) => {
    console.log(`  [${index}]:`, JSON.stringify(sample, null, 2));
  });
}

/**
 * Utility to create a property that always passes
 * 
 * Useful for testing the test infrastructure itself
 */
export function alwaysPassProperty<T>(arbitrary: fc.Arbitrary<T>): fc.IRawProperty<any, any> {
  return fc.property(arbitrary, () => true);
}

/**
 * Utility to create a property that always fails
 * 
 * Useful for testing the test infrastructure itself
 */
export function alwaysFailProperty<T>(arbitrary: fc.Arbitrary<T>): fc.IRawProperty<any, any> {
  return fc.property(arbitrary, () => {
    throw new Error('Intentional failure for testing');
  });
}

/**
 * Utility to measure property test performance
 * 
 * @param property - The property to test
 * @param config - Optional configuration
 */
export function measurePropertyPerformance<T>(
  property: fc.IRawProperty<any, any>,
  config?: Partial<fc.Parameters<T>>
): { duration: number; runsPerSecond: number } {
  const finalConfig = { ...defaultFastCheckConfig, ...config };
  const startTime = Date.now();

  try {
    fc.assert(property, finalConfig);
  } catch (error) {
    // Ignore assertion errors for performance measurement
  }

  const duration = Date.now() - startTime;
  const runsPerSecond = ((finalConfig.numRuns || 100) / duration) * 1000;

  return { duration, runsPerSecond };
}
