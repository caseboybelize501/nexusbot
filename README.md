# NexusBot - Autonomous Desktop RPA Agent

NexusBot is a desktop automation agent that combines Python for execution and Rust/Tauri for the desktop interface.

## Features

- **Python Execution Agent**: Core automation logic using pyautogui and mss
- **Rust IPC Manager**: Tauri backend for process management and communication
- **React Dashboard UI**: Real-time monitoring and control interface

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Rust Backend  │    │   Python Agent  │
│                 │    │                 │    │                 │
│  Control Panel  │───▶│  Process Mgmt   │───▶│  Automation     │
│  Screenshot     │    │  IPC Communication│   │  Commands       │
│  Action Log     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Python Agent (`src/main.py`)
- Uses `pyautogui` for GUI automation
- Uses `mss` for screen capture
- Communicates via stdin/stdout

### 2. Rust Backend (`src-tauri/main.rs`)
- Manages Python subprocess
- Handles IPC communication
- Provides Tauri API for UI

### 3. React UI (`src/App.tsx`)
- Real-time screenshot display
- Goal input and action logging
- Responsive control panel

## Installation

1. Install Rust and Tauri CLI:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   npm install -g @tauri-apps/cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Usage

1. Enter a high-level goal in the input field
2. Click Submit to start automation
3. Watch the action log update in real-time
4. View the current screenshot in the left panel

## License

MIT