import ApplicationServices
import Foundation

struct PermissionStatus {
  static func read(prompt: Bool) -> [String: Any] {
    let screenRecording = prompt
      ? CGRequestScreenCaptureAccess()
      : CGPreflightScreenCaptureAccess()
    let accessibilityOptions = [
      kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: prompt
    ] as CFDictionary
    let accessibility = AXIsProcessTrustedWithOptions(accessibilityOptions)

    return [
      "accessibility": accessibility,
      "screenRecording": screenRecording
    ]
  }
}
