import React, { useState, useEffect, useRef } from 'react';

interface ActionLog {
  id: string;
  message: string;
  timestamp: Date;
}

const NexusDashboard: React.FC = () => {
  const [latestScreenshot, setLatestScreenshot] = useState<string>('');
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulate receiving agent responses
  useEffect(() => {
    const handleAgentResponse = (response: string) => {
      try {
        const data = JSON.parse(response);
        
        if (data.screenshot) {
          setLatestScreenshot(data.screenshot);
        }
        
        if (data.success && data.message) {
          setActionLogs(prev => [...prev, {
            id: Date.now().toString(),
            message: data.message,
            timestamp: new Date()
          }]);
        }
        
        if (data.error) {
          setActionLogs(prev => [...prev, {
            id: Date.now().toString(),
            message: `Error: ${data.error}`,
            timestamp: new Date()
          }]);
        }
      } catch (e) {
        console.error('Error parsing agent response:', e);
      }
    };

    // In a real app, this would be a Tauri event listener
    // window.tauri.invoke('listen_to_agent_responses', { handler: handleAgentResponse });
    
    // Simulate some responses for demo
    const demoResponses = [
      { success: true, message: 'Moving mouse to 500,600', screenshot: 'screenshot_1.png' },
      { success: true, message: 'Clicking Log In', screenshot: 'screenshot_2.png' },
      { success: true, message: 'Typing password...', screenshot: 'screenshot_3.png' },
      { success: true, message: 'Pressing Enter', screenshot: 'screenshot_4.png' },
    ];
    
    const interval = setInterval(() => {
      if (demoResponses.length > 0) {
        const response = demoResponses.shift();
        if (response) {
          handleAgentResponse(JSON.stringify(response));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // In a real app, this would send to the Rust backend
    // window.tauri.invoke('send_action_to_agent', { action_json: JSON.stringify({ type: 'type_text', params: { text: inputValue } }) });
    
    setActionLogs(prev => [...prev, {
      id: Date.now().toString(),
      message: `Goal: ${inputValue}`,
      timestamp: new Date()
    }]);
    
    setInputValue('');
    setIsProcessing(false);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLogs]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Panel - Screenshot */}
      <div className="w-2/3 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Bot View</h2>
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {latestScreenshot ? (
            <img 
              src={latestScreenshot} 
              alt="Bot screenshot" 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-gray-500">No screenshot available</div>
          )}
        </div>
      </div>

      {/* Right Panel - Control Panel */}
      <div className="w-1/3 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Control Panel</h2>
        
        {/* Goal Input */}
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a high-level goal (e.g., 'Log into Shopify')"
              className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Action Logs */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
          <h3 className="font-semibold mb-3">Action Log</h3>
          <div className="space-y-2">
            {actionLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No actions yet. Enter a goal to start.</p>
            ) : (
              actionLogs.map((log) => (
                <div key={log.id} className="text-sm p-2 bg-gray-700 rounded">
                  <div className="flex justify-between">
                    <span>{log.message}</span>
                    <span className="text-gray-400 text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusDashboard;