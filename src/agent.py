import sys
import json
import pyautogui
import mss
import time

def mouse_move(x, y):
    pyautogui.moveTo(x, y)

def mouse_click():
    pyautogui.click()

def type_text(text):
    pyautogui.typewrite(text)

def press_key(key):
    pyautogui.press(key)

def take_screenshot(filename):
    with mss.mss() as sct:
        sct.shot(filename=filename)
    return filename

def execute_action(action):
    try:
        action_type = action.get('type')
        params = action.get('params', {})
        
        if action_type == 'mouse_move':
            mouse_move(params['x'], params['y'])
        elif action_type == 'mouse_click':
            mouse_click()
        elif action_type == 'type_text':
            type_text(params['text'])
        elif action_type == 'press_key':
            press_key(params['key'])
        elif action_type == 'take_screenshot':
            filename = params.get('filename', 'screenshot.png')
            take_screenshot(filename)
            return {'success': True, 'filename': filename}
        else:
            return {'success': False, 'error': f'Unknown action type: {action_type}'}
        
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    print('NexusBot agent started')
    sys.stdout.flush()
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            action = json.loads(line.strip())
            
            # Execute the action
            result = execute_action(action)
            
            # Take screenshot after action
            screenshot_file = f"screenshot_{int(time.time())}.png"
            try:
                take_screenshot(screenshot_file)
                result['screenshot'] = screenshot_file
            except Exception as e:
                result['screenshot_error'] = str(e)
            
            # Send response back
            response = json.dumps(result)
            print(response)
            sys.stdout.flush()
            
        except Exception as e:
            error_response = {'success': False, 'error': str(e)}
            print(json.dumps(error_response))
            sys.stdout.flush()