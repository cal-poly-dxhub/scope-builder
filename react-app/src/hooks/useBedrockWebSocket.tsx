import { useState, useRef, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';


const useBedrockWebSocket = () => {
  const [connectionID, setConnectionID] = useState<string | null>(null);
  const didUnmount = useRef(false);
  const restEndpoint = 'https://b0pcz6pe68.execute-api.us-west-2.amazonaws.com/prod/api/async/search'
  const wssEndpoint = 'wss://rabqnoi31j.execute-api.us-west-2.amazonaws.com/prod/';
  const restAPIKey = import.meta.env.VITE_REST_X_API_KEY;
  const wssAPIKey = import.meta.env.VITE_WSS_X_API_KEY;
  const [connect, setConnect] = useState<boolean>(true)
  

  const startBedrockProcess = async (userInput: string) => {
    const message = {"user_input": userInput,
    "search_size": 10,
    "bedrock_mode": "STREAM"
    }
    try {
      // console.log("apikey:", restAPIKey)
      const response = await axios.post(restEndpoint, message, {headers: {'x-api-key': restAPIKey}});
      // console.log(response)
      console.log(response.data)
      console.log(response.data.executionArn)
      setConnectionID(response.data.executionArn)
      // setConnectionID(response.data.webSocketEndpoint);
    } catch (error) {
      console.error('Error starting Bedrock process:', error);
    }
  };
  

  
  
  
  const { lastJsonMessage, readyState } = useWebSocket(connectionID && wssEndpoint ? `${wssEndpoint}?execution_arn=${connectionID}` : null, {
    // queryParams: {connectionID},
    onOpen: () => console.log('Websocket opened'),
    onError : () => console.log("Websocket error"),
    // shouldReconnect: (closeEvent) => !didUnmount.current,
    // reconnectAttempts: 3,
    // reconnectInterval: 3000 //ms,
  }, connect);
  
  useEffect(() =>{
    
    //unsubscribe as soon as I recieve a message
    if (lastJsonMessage?.Payload?.body){
      setConnect(false);
      setConnectionID(null);
      setConnect(true);
    }
  },[lastJsonMessage])
  
  const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
  
  

  return { startBedrockProcess, lastJsonMessage, connectionStatus};

};
export default useBedrockWebSocket;