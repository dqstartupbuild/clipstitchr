import CoreGraphics
import Foundation

struct WindowListing {
  static func listWindows() -> [WindowInfo] {
    guard
      let windows = CGWindowListCopyWindowInfo(
        [.optionOnScreenOnly, .excludeDesktopElements],
        kCGNullWindowID
      ) as? [[String: Any]]
    else {
      return []
    }

    return windows.compactMap(readWindowInfo).filter { window in
      window.bounds.width >= 80 && window.bounds.height >= 80
    }
  }

  static func findWindow(id: UInt32) -> WindowInfo? {
    listWindows().first { $0.id == id }
  }

  static func findWindow(match: String) -> WindowInfo? {
    let lowered = match.lowercased()

    return listWindows().first { window in
      window.displayName.lowercased().contains(lowered)
    }
  }

  private static func readWindowInfo(_ raw: [String: Any]) -> WindowInfo? {
    let layer = raw[kCGWindowLayer as String] as? Int ?? 0

    guard layer == 0 else {
      return nil
    }

    guard let id = raw[kCGWindowNumber as String] as? UInt32 else {
      return nil
    }

    guard let boundsRaw = raw[kCGWindowBounds as String] as? [String: Any] else {
      return nil
    }

    guard
      let x = boundsRaw["X"] as? CGFloat,
      let y = boundsRaw["Y"] as? CGFloat,
      let width = boundsRaw["Width"] as? CGFloat,
      let height = boundsRaw["Height"] as? CGFloat
    else {
      return nil
    }

    let appName = raw[kCGWindowOwnerName as String] as? String ?? "Unknown app"
    let title = raw[kCGWindowName as String] as? String ?? ""
    let pid = raw[kCGWindowOwnerPID as String] as? pid_t ?? 0

    if appName.isEmpty && title.isEmpty {
      return nil
    }

    return WindowInfo(
      appName: appName,
      bounds: CGRect(x: x, y: y, width: width, height: height),
      id: id,
      pid: pid,
      title: title
    )
  }
}
