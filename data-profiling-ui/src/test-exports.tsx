// Test file to verify exports work at runtime
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Test the problematic import
try {
  console.log('Testing import from profiling.ts...');
  import('./types/profiling').then((module) => {
    console.log('✅ profiling.ts exports:', Object.keys(module));
    console.log('✅ Dataset exists:', 'Dataset' in module);
    console.log('✅ JobResult exists:', 'JobResult' in module);
    console.log('✅ Job exists:', 'Job' in module);
  }).catch((error) => {
    console.error('❌ Error importing from profiling.ts:', error);
  });

  console.log('Testing import from index.ts...');
  import('./types/index').then((module) => {
    console.log('✅ index.ts exports:', Object.keys(module));
    console.log('✅ Dataset exists in index:', 'Dataset' in module);
  }).catch((error) => {
    console.error('❌ Error importing from index.ts:', error);
  });
} catch (error) {
  console.error('❌ Synchronous error:', error);
}

// Render a simple test component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Export Test</h1>
      <p>Check the browser console for test results</p>
      <p>If you see ✅ messages, exports are working</p>
      <p>If you see ❌ messages, there's an import error</p>
    </div>
  </StrictMode>,
)
