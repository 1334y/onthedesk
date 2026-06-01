#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_screen_info,
            commands::move_window_to,
        ])
        .setup(|app| {
            let win = app.get_webview_window("main").unwrap();

            if let Some(monitor) = win.available_monitors().ok().and_then(|m| m.into_iter().next()) {
                let s = monitor.size();
                let pos = monitor.position();
                let scale = monitor.scale_factor();
                let lw = (s.width as f64 / scale) as i32;
                let lh = (s.height as f64 / scale) as i32;
                let lx = (pos.x as f64 / scale) as i32;
                let ly = (pos.y as f64 / scale) as i32;
                let _ = win.set_position(tauri::Position::Logical(
                    tauri::LogicalPosition::new(((lw - 227) / 2 + lx) as f64, ((lh - 175 - 60 + ly)) as f64),
                ));
            }

            let _ = win.set_always_on_top(true);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running clawd");
}
