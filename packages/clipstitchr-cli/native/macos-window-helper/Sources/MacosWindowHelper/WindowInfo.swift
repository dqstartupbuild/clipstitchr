import CoreGraphics
import Foundation

struct WindowInfo {
  let appName: String
  let bounds: CGRect
  let id: UInt32
  let pid: pid_t
  let title: String

  var displayName: String {
    if title.isEmpty {
      return appName
    }

    return "\(appName) - \(title)"
  }

  func toDictionary() -> [String: Any] {
    [
      "appName": appName,
      "bounds": [
        "height": bounds.height,
        "width": bounds.width,
        "x": bounds.origin.x,
        "y": bounds.origin.y
      ],
      "id": id,
      "pid": pid,
      "title": title
    ]
  }
}
