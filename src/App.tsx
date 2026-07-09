/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRouter } from './components/providers/AppRouter';
import { ThemeProvider } from './components/providers/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
