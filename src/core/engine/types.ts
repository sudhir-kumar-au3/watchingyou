import type { ComponentType } from 'react';
import type { Frame, Timeline } from '@/core/timeline/types';

export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graph'
  | 'dp'
  | 'tree'
  | 'hashing'
  | 'structure'
  | 'backtracking'
  | 'math';

export interface ComplexityProfile {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  space: string;
}

export interface AlgorithmInfo {
  explanation: string;
  complexity: ComplexityProfile;
  useCases: string[];
  realWorld: string[];
}

export interface MetricLabels {
  comparisons: string;
  swaps: string;
  accesses: string;
}

export interface AlgorithmModule<TState, TInput> {
  id: string;
  name: string;
  category: AlgorithmCategory;
  tagline: string;
  accent: string;
  sourceCode: string;
  info: AlgorithmInfo;
  metricLabels?: MetricLabels;
  createDefaultInput: () => TInput;
  generate: (input: TInput) => Timeline<TState>;
}

export interface RendererProps<TState> {
  frame: Frame<TState>;
  previous: Frame<TState> | null;
}

export interface ControlsProps<TInput> {
  input: TInput;
  onChange: (input: TInput) => void;
}

export interface VisualModule<TState, TInput> {
  algorithm: AlgorithmModule<TState, TInput>;
  Renderer: ComponentType<RendererProps<TState>>;
  Controls?: ComponentType<ControlsProps<TInput>>;
  Legend?: ComponentType;
}

export type AnyVisualModule = VisualModule<unknown, unknown>;

export const defineModule = <TState, TInput>(
  module: VisualModule<TState, TInput>
): AnyVisualModule => module as unknown as AnyVisualModule;
