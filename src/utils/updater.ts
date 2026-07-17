import { check } from '@tauri-apps/plugin-updater'

async function runCheck(attempt: number) {
  try {
    return await check()
  } catch (error) {
    if (attempt === 3) {
      throw error
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    return runCheck(attempt + 1)
  }
}

export function checkForUpdate() {
  return runCheck(1)
}
