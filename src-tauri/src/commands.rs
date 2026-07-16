use std::{
    fs::File,
    io::{Read, Seek, SeekFrom},
    path::PathBuf,
};

use serde::{Deserialize, Serialize};
use tauri::AppHandle;

use crate::utils::{get_cache_file_path, get_file_contents, save_file_contents, validate_file};

#[tauri::command(async)]
pub fn read_file(
    path: String,
    offset: Option<usize,>,
    size: Option<usize,>,
) -> Result<Vec<u8,>, String,> {
    let mut file = File::open(path,).map_err(|err| err.to_string(),)?;
    let file_size = file.metadata().map_err(|err| err.to_string(),)?.len() as usize;

    let offset_val = offset.unwrap_or(0,);
    let size_val = size.unwrap_or(file_size,);
    let end_offset = std::cmp::min(offset_val + size_val, file_size,);

    let mut buffer = vec![0; size_val];

    file.seek(SeekFrom::Start(offset_val as u64,),)
        .map_err(|err| err.to_string(),)?;

    let mut bytes_read = 0;
    while bytes_read < size_val {
        let read_len = file
            .read(&mut buffer[bytes_read..end_offset],)
            .map_err(|err| err.to_string(),)?;
        if read_len == 0 {
            break;
        }
        bytes_read += read_len;
    }

    buffer.truncate(bytes_read,);
    Ok(buffer,)
}

#[derive(Serialize, Deserialize,)]
#[serde(rename_all = "camelCase")]
pub enum FileInput {
    Content(Vec<u8,>,),
    Path(String,),
}

#[derive(Serialize, Deserialize,)]
pub struct FileTypeInfo {
    #[serde(rename = "mimeType")]
    mime_type: String,
    extension: String,
}

#[tauri::command(async)]
pub fn get_file_type(file: FileInput,) -> Result<FileTypeInfo, String,> {
    let kind: infer::Type = match file {
        FileInput::Content(content,) => match infer::get(&content,) {
            Some(file_type,) => file_type,
            None => return Err("无法识别文件类型".into(),),
        },
        FileInput::Path(path,) => match infer::get_from_path(path,) {
            Ok(file_type,) => file_type.expect("无法识别文件类型",),
            Err(err,) => return Err(err.to_string(),),
        },
    };
    Ok(FileTypeInfo {
        mime_type: kind.mime_type().to_string(),
        extension: kind.extension().to_string(),
    },)
}

#[derive(Serialize, Deserialize,)]
#[serde(rename_all = "camelCase")]
pub enum FileSource {
    Str(String,),
    Binary(Vec<u8,>,),
}

#[derive(Serialize, Deserialize,)]
pub struct UploadFile {
    size: usize,
    sha256: String,
}

#[tauri::command]
pub async fn create_cache_file(
    app_handle: AppHandle,
    file_source: FileSource,
    validate_type: Option<String,>,
) -> Result<UploadFile, String,> {
    let contents = match file_source {
        FileSource::Str(s,) => get_file_contents(&s,)
            .await
            .map_err(|err| format!("获取文件失败: {}", err),)?,
        FileSource::Binary(b,) => b,
    };

    if let Err(err,) = validate_file(&contents, validate_type, None,) {
        return Err(format!("文件校验失败：{}", err),);
    }

    let cache_dir = get_cache_file_path(app_handle,);
    let size = contents.len();
    let sha256 = save_file_contents(contents, cache_dir, None,)
        .await
        .map_err(|err| format!("保存文件失败: {}", err),)?;
    Ok(UploadFile {
        size,
        sha256,
    },)
}

#[tauri::command]
pub async fn write_file(
    contents: Vec<u8,>, path: PathBuf, overwrite: bool,
) -> Result<(), String,> {
    if overwrite || !path.exists() {
        tokio::fs::write(path, contents,)
            .await
            .map_err(|err| format!("写入文件失败: {}", err),)?;
        Ok((),)
    } else {
        Err("文件已存在".into(),)
    }
}

#[tauri::command]
pub async fn copy_file(source: PathBuf, target: PathBuf,) -> Result<(), String,> {
    tokio::fs::copy(&source, &target,)
        .await
        .map_err(|err| format!("复制文件失败: {}", err),)?;
    Ok((),)
}

use tauri::State;
use tokio::{net::TcpListener, sync::Mutex};
use tokio_stream::wrappers::TcpListenerStream;
use warp::Filter;

use crate::state::AppState;

#[tauri::command]
pub async fn start_assets_server(
    app_handle: AppHandle,
    state: State<'_, Mutex<AppState,>,>,
    host: String,
    port: u16,
) -> Result<(), String,> {
    let cache_dir = get_cache_file_path(app_handle,);

    let cors = warp::cors().allow_any_origin().allow_methods(vec!["GET"],);

    let route = warp::path("mfm",)
        .or(warp::path("meow",))
        .unify()
        .or(warp::path("matcha",))
        .unify()
        .and(warp::path("cache",),)
        .and(warp::fs::dir(cache_dir,),)
        .with(cors,);

    let mut state = state.lock().await;

    state.stop_server();

    let addr = format!("{}:{}", host, port);
    match TcpListener::bind(&addr,).await {
        Ok(listener,) => {
            let new_handle = tauri::async_runtime::spawn(async move {
                let stream = TcpListenerStream::new(listener,);
                warp::serve(route,).run_incoming(stream,).await;
            },);

            state.set_handle(new_handle,);
            Ok((),)
        }
        Err(e,) => Err(e.to_string(),),
    }
}
