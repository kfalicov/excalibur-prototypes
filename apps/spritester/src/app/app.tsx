// Uncomment this line to use CSS modules
import { cva } from 'class-variance-authority';
import { Atlas } from '../components/atlas';
import { Tabs } from 'radix-ui';
import styles from './app.module.css';

const TabButtonVariantGenerator = cva(
  'px-4 py-2 hover:bg-gray-200 active:bg-gray-400 cursor-pointer',
);

export function App() {
  return (
    <>
      <Tabs.Root defaultValue="atlas" className={styles.tabContainer}>
        <Tabs.List>
          <Tabs.Trigger value="atlas" className={TabButtonVariantGenerator()}>
            Atlas Editor
          </Tabs.Trigger>
          <Tabs.Trigger value="anim" className={TabButtonVariantGenerator()}>
            Animation Builder
          </Tabs.Trigger>
          <Tabs.Trigger value="graph" className={TabButtonVariantGenerator()}>
            Animation Graph
          </Tabs.Trigger>
          <Tabs.Trigger value="palette" className={TabButtonVariantGenerator()}>
            Palette Swapper
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="atlas" className="grid grid-cols-2">
          <Atlas />
          <div className="bg-gray-300 h-48 p-4 grid">
            <div className="border border-2 border-dashed border-white p-4 rounded-lg">
              Select a Frame
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default App;
