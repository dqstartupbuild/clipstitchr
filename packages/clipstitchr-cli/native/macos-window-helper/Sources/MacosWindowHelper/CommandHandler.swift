import Foundation

final class CommandHandler {
  private let store = WindowStore()

  func handle(_ request: CommandRequest) -> CommandResponse {
    do {
      return CommandResponse(
        id: request.id,
        ok: true,
        result: try run(request),
        error: nil
      )
    } catch {
      return CommandResponse(
        id: request.id,
        ok: false,
        result: nil,
        error: String(describing: error)
      )
    }
  }

  private func run(_ request: CommandRequest) throws -> Any {
    switch request.command {
    case "capture_window":
      return try ScreenshotCapture.capture(window: store.selectedWindow())
    case "check_permissions":
      return PermissionStatus.read(prompt: bool(request.params, "prompt", defaultValue: false))
    case "click":
      InputEvents.click(
        window: try store.selectedWindow(),
        x: number(request.params, "x"),
        y: number(request.params, "y"),
        button: string(request.params, "button", defaultValue: "left"),
        clickCount: 1
      )
      return ["ok": true]
    case "double_click":
      InputEvents.click(
        window: try store.selectedWindow(),
        x: number(request.params, "x"),
        y: number(request.params, "y"),
        button: string(request.params, "button", defaultValue: "left"),
        clickCount: 2
      )
      return ["ok": true]
    case "drag":
      try InputEvents.drag(window: store.selectedWindow(), points: points(request.params))
      return ["ok": true]
    case "keypress":
      InputEvents.keypress(keys: stringArray(request.params, "keys"))
      return ["ok": true]
    case "list_windows":
      return ["windows": WindowListing.listWindows().map { $0.toDictionary() }]
    case "move":
      InputEvents.move(
        window: try store.selectedWindow(),
        x: number(request.params, "x"),
        y: number(request.params, "y")
      )
      return ["ok": true]
    case "scroll":
      InputEvents.scroll(
        window: try store.selectedWindow(),
        x: number(request.params, "x"),
        y: number(request.params, "y"),
        scrollX: number(request.params, "scrollX", defaultValue: 0),
        scrollY: number(request.params, "scrollY", defaultValue: 0)
      )
      return ["ok": true]
    case "select_window":
      let window = try selectWindow(request.params)
      return ["window": window.toDictionary()]
    case "type_text":
      InputEvents.typeText(string(request.params, "text"))
      return ["ok": true]
    case "wait":
      InputEvents.wait(milliseconds: int(request.params, "milliseconds", defaultValue: 2000))
      return ["ok": true]
    default:
      throw HelperError("Unsupported command \(request.command).")
    }
  }

  private func selectWindow(_ params: [String: Any]) throws -> WindowInfo {
    if let id = params["windowId"] as? UInt32 {
      return try store.select(id: id)
    }

    if let id = params["windowId"] as? Int {
      return try store.select(id: UInt32(id))
    }

    if let match = params["match"] as? String, !match.isEmpty {
      return try store.select(match: match)
    }

    throw HelperError("select_window needs windowId or match.")
  }

  private func bool(_ params: [String: Any], _ key: String, defaultValue: Bool) -> Bool {
    params[key] as? Bool ?? defaultValue
  }

  private func int(_ params: [String: Any], _ key: String, defaultValue: Int) -> Int {
    params[key] as? Int ?? defaultValue
  }

  private func number(_ params: [String: Any], _ key: String, defaultValue: Double? = nil) -> Double {
    if let value = params[key] as? Double {
      return value
    }

    if let value = params[key] as? Int {
      return Double(value)
    }

    if let defaultValue {
      return defaultValue
    }

    return 0
  }

  private func points(_ params: [String: Any]) throws -> [[String: Double]] {
    guard let rawPoints = params["path"] as? [[String: Any]] else {
      throw HelperError("drag needs a path.")
    }

    return rawPoints.map { point in
      [
        "x": number(point, "x"),
        "y": number(point, "y")
      ]
    }
  }

  private func string(_ params: [String: Any], _ key: String, defaultValue: String? = nil) -> String {
    if let value = params[key] as? String {
      return value
    }

    return defaultValue ?? ""
  }

  private func stringArray(_ params: [String: Any], _ key: String) -> [String] {
    params[key] as? [String] ?? []
  }
}
