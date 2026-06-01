use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ScreenInfo {
    pub width: i32,
    pub height: i32,
    pub taskbar_y: i32,
}

#[tauri::command]
pub fn get_screen_info(window: tauri::Window) -> Result<ScreenInfo, String> {
    if let Some(monitor) = window.available_monitors().ok().and_then(|m| m.into_iter().next()) {
        let size = monitor.size(); // physical
        let scale = monitor.scale_factor();
        Ok(ScreenInfo {
            width: (size.width as f64 / scale) as i32,
            height: (size.height as f64 / scale) as i32,
            taskbar_y: (size.height as f64 * 0.94 / scale) as i32,
        })
    } else {
        Ok(ScreenInfo { width: 1920, height: 1080, taskbar_y: 1015 })
    }
}

/// 逻辑坐标移动窗口
#[tauri::command]
pub fn move_window_to(window: tauri::Window, x: i32, y: i32) -> Result<(), String> {
    window.set_position(tauri::Position::Logical(
        tauri::LogicalPosition::new(x as f64, y as f64),
    )).map_err(|e| e.to_string())
}
