# Windows Tauri build checklist
SUMMARY: Always verify that Visual Studio C++ Build Tools and a Windows SDK are installed before attempting a native Tauri build on Windows.
READ WHEN: before building or testing any Tauri desktop application on Windows.
RECHECK WHEN: when the Windows Rust toolchain or Tauri prerequisites change.

---

Run `pnpm tauri info` before native verification. A working Rust MSVC toolchain alone is not sufficient: Tauri and Rust build scripts also need `link.exe`, the Visual C++ libraries, and a Windows SDK.

Install Visual Studio Build Tools with the **Desktop development with C++** workload and a Windows SDK when `tauri info` reports that MSVC and SDK components cannot be detected.

On Windows with `winget`, the minimal official installation can be requested with:

```powershell
winget install --exact --id Microsoft.VisualStudio.2022.BuildTools --source winget --override "--wait --quiet --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

New shells may not see the compiler automatically. Import `Microsoft.VisualStudio.DevShell.dll` from the selected Visual Studio installation and call `Enter-VsDevShell` before running Cargo or Tauri.

Typical failure:

```text
error: linker `link.exe` not found
```
