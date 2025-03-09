// Uncomment this line to use CSS modules
import styles from './app.module.css';
import { Atlas } from '../components/atlas';
import { Tabs } from 'radix-ui';

export function App() {
  return (
    <>
      <Tabs.Root defaultValue="atlas">
        <Tabs.List>
          <Tabs.Trigger value="atlas">Atlas Editor</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="atlas">
          <div className={styles.container}>
            <Atlas />
            <div className="bg-gray-300 h-48">test</div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default App;
