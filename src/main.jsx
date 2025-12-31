import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {store, persistor} from "./redux/Store";
import {ChakraProvider} from '@chakra-ui/react'
import WebSocketProvider from "./socket/WebSocketProvider.jsx";
import {PersistGate} from "redux-persist/integration/react";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ChakraProvider resetCSS={false}>
                <WebSocketProvider>
                    <Provider store={store}>
                        <PersistGate persistor={persistor}>
                            <App/>
                        </PersistGate>
                    </Provider>
                </WebSocketProvider>
            </ChakraProvider>
        </BrowserRouter>
    </StrictMode>,
)
