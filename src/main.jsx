import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

import DataProvider from './context/DataProvider.jsx'
import AuthProvider from './context/AuthProvider.jsx'

import './styles/mantine.css'

import { BrowserRouter as Router } from 'react-router-dom'

const theme = createTheme({
  /** Put your mantine theme override here */
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme='light'>
      <Notifications position='bottom-right' />
      <ModalsProvider>
        <AuthProvider>
          <DataProvider>
            <Router>
              <App />
            </Router>
          </DataProvider>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode >,
)
