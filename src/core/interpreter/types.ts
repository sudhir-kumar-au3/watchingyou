export interface VariableView {
  name: string;
  kind: 'global' | 'local';
  preview: string;
  array: number[] | null;
  changed: boolean;
}

export interface ProgramState {
  line: number;
  variables: VariableView[];
  callStack: string[];
  output: string[];
  depth: number;
}

export const createProgramState = (
  partial: Partial<ProgramState> = {}
): ProgramState => ({
  line: 0,
  variables: [],
  callStack: [],
  output: [],
  depth: 0,
  ...partial,
});
