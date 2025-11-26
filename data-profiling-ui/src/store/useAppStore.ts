import { create } from 'zustand';
import { Connection, ProfilingJob, DatasetProfile, EntityProfile } from '../types';

interface AppStore {
  // Connections
  connections: Connection[];
  selectedConnection: Connection | null;
  setConnections: (connections: Connection[]) => void;
  setSelectedConnection: (connection: Connection | null) => void;
  
  // Current Job
  currentJob: ProfilingJob | null;
  setCurrentJob: (job: ProfilingJob | null) => void;
  
  // Dataset Profile
  datasetProfile: DatasetProfile | null;
  setDatasetProfile: (profile: DatasetProfile | null) => void;
  
  // Entities
  entities: EntityProfile[];
  setEntities: (entities: EntityProfile[]) => void;
  selectedEntity: EntityProfile | null;
  setSelectedEntity: (entity: EntityProfile | null) => void;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Connections
  connections: [],
  selectedConnection: null,
  setConnections: (connections) => set({ connections }),
  setSelectedConnection: (connection) => set({ selectedConnection: connection }),
  
  // Current Job
  currentJob: null,
  setCurrentJob: (job) => set({ currentJob: job }),
  
  // Dataset Profile
  datasetProfile: null,
  setDatasetProfile: (profile) => set({ datasetProfile: profile }),
  
  // Entities
  entities: [],
  setEntities: (entities) => set({ entities }),
  selectedEntity: null,
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  
  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
