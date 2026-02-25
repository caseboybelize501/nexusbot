use std::process::{Command, Stdio};
use std::io::{Write, BufRead, BufReader};
use std::sync::Arc;
use tauri::State;
use tauri::Manager;

#[derive(Debug)]
pub struct AgentState {
    pub child: Option<std::process::Child>,
}

#[tauri::command]
pub fn spawn_python_agent(state: State<'_, AgentState>) -> Result<(), String> {
    let mut child = Command::new("python")
        .arg("src/agent.py")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to spawn agent: {}", e))?;
    
    // Start a background thread to read stdout
    let handle = child.stdout.take().unwrap();
    let app_handle = state.app_handle.clone();
    
    std::thread::spawn(move || {
        let reader = BufReader::new(handle);
        for line in reader.lines() {
            match line {
                Ok(response) => {
                    // Emit event to frontend
                    let _ = app_handle.emit_all("agent-response", response);
                }
                Err(e) => {
                    eprintln!("Error reading from agent: {}", e);
                    break;
                }
            }
        }
    });
    
    // Store the child process in state
    state.child = Some(child);
    
    Ok(())
}

#[tauri::command]
pub fn send_action_to_agent(state: State<'_, AgentState>, action_json: String) -> Result<(), String> {
    if let Some(ref mut child) = state.child {
        if let Some(ref mut stdin) = child.stdin {
            if let Err(e) = writeln!(stdin, "{}", action_json) {
                return Err(format!("Failed to write to agent stdin: {}", e));
            }
            stdin.flush().map_err(|e| format!("Failed to flush stdin: {}", e))?;
        }
    } else {
        return Err("Agent not started".to_string());
    }
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AgentState {
            child: None,
        })
        .invoke_handler(tauri::generate_handler![
            spawn_python_agent,
            send_action_to_agent,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}