import AppKit
import CoreGraphics
import Foundation

struct InputEvents {
  static func click(window: WindowInfo, x: Double, y: Double, button: String, clickCount: Int) {
    activate(window: window)
    let point = windowPoint(window: window, x: x, y: y)
    let mouseButton = readMouseButton(button)
    postMouse(type: mouseMovedType(button: mouseButton), point: point, button: mouseButton)

    for _ in 0..<clickCount {
      postMouse(type: mouseDownType(button: mouseButton), point: point, button: mouseButton)
      usleep(60_000)
      postMouse(type: mouseUpType(button: mouseButton), point: point, button: mouseButton)
      usleep(80_000)
    }
  }

  static func drag(window: WindowInfo, points: [[String: Double]]) throws {
    guard let first = points.first, points.count >= 2 else {
      throw HelperError("Drag needs at least two points.")
    }

    activate(window: window)
    let start = windowPoint(window: window, x: first["x"] ?? 0, y: first["y"] ?? 0)

    postMouse(type: .mouseMoved, point: start, button: .left)
    postMouse(type: .leftMouseDown, point: start, button: .left)

    for point in points.dropFirst() {
      postMouse(
        type: .leftMouseDragged,
        point: windowPoint(window: window, x: point["x"] ?? 0, y: point["y"] ?? 0),
        button: .left
      )
      usleep(20_000)
    }

    if let last = points.last {
      postMouse(
        type: .leftMouseUp,
        point: windowPoint(window: window, x: last["x"] ?? 0, y: last["y"] ?? 0),
        button: .left
      )
    }
  }

  static func keypress(keys: [String]) {
    let parsed = parseKeys(keys)

    for keyCode in parsed.keyCodes {
      postKey(keyCode: keyCode, flags: parsed.flags, keyDown: true)
      usleep(30_000)
      postKey(keyCode: keyCode, flags: parsed.flags, keyDown: false)
    }
  }

  static func move(window: WindowInfo, x: Double, y: Double) {
    let point = windowPoint(window: window, x: x, y: y)

    postMouse(type: .mouseMoved, point: point, button: .left)
  }

  static func scroll(window: WindowInfo, x: Double, y: Double, scrollX: Double, scrollY: Double) {
    activate(window: window)
    move(window: window, x: x, y: y)

    let event = CGEvent(
      scrollWheelEvent2Source: nil,
      units: .pixel,
      wheelCount: 2,
      wheel1: Int32(-scrollY),
      wheel2: Int32(-scrollX),
      wheel3: 0
    )

    event?.post(tap: .cghidEventTap)
  }

  static func typeText(_ text: String) {
    if text.isEmpty {
      return
    }

    postUnicode(text)
  }

  static func wait(milliseconds: Int) {
    usleep(useconds_t(max(0, milliseconds) * 1000))
  }

  private static func activate(window: WindowInfo) {
    NSRunningApplication(processIdentifier: window.pid)?.activate(options: [
      .activateIgnoringOtherApps
    ])
    usleep(120_000)
  }

  private static func mouseDownType(button: CGMouseButton) -> CGEventType {
    button == .right ? .rightMouseDown : button == .center ? .otherMouseDown : .leftMouseDown
  }

  private static func mouseMovedType(button: CGMouseButton) -> CGEventType {
    .mouseMoved
  }

  private static func mouseUpType(button: CGMouseButton) -> CGEventType {
    button == .right ? .rightMouseUp : button == .center ? .otherMouseUp : .leftMouseUp
  }

  private static func parseKeys(_ keys: [String]) -> (flags: CGEventFlags, keyCodes: [CGKeyCode]) {
    var flags = CGEventFlags()
    var keyCodes: [CGKeyCode] = []

    for key in keys {
      switch key.uppercased() {
      case "ALT", "OPTION":
        flags.insert(.maskAlternate)
      case "CMD", "COMMAND", "META":
        flags.insert(.maskCommand)
      case "CTRL", "CONTROL":
        flags.insert(.maskControl)
      case "SHIFT":
        flags.insert(.maskShift)
      default:
        if let keyCode = keyCode(for: key) {
          keyCodes.append(keyCode)
        }
      }
    }

    return (flags, keyCodes)
  }

  private static func postKey(keyCode: CGKeyCode, flags: CGEventFlags, keyDown: Bool) {
    let event = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: keyDown)
    event?.flags = flags
    event?.post(tap: .cghidEventTap)
  }

  private static func postMouse(type: CGEventType, point: CGPoint, button: CGMouseButton) {
    let event = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: button)
    event?.post(tap: .cghidEventTap)
  }

  private static func postUnicode(_ text: String) {
    let chars = Array(text.utf16)
    let keyDown = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true)
    let keyUp = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false)

    chars.withUnsafeBufferPointer { buffer in
      keyDown?.keyboardSetUnicodeString(stringLength: chars.count, unicodeString: buffer.baseAddress)
      keyUp?.keyboardSetUnicodeString(stringLength: chars.count, unicodeString: buffer.baseAddress)
    }

    keyDown?.post(tap: .cghidEventTap)
    keyUp?.post(tap: .cghidEventTap)
  }

  private static func readMouseButton(_ button: String) -> CGMouseButton {
    switch button.lowercased() {
    case "right":
      return .right
    case "middle", "center":
      return .center
    default:
      return .left
    }
  }

  private static func windowPoint(window: WindowInfo, x: Double, y: Double) -> CGPoint {
    CGPoint(x: window.bounds.origin.x + x, y: window.bounds.origin.y + y)
  }

  private static func keyCode(for key: String) -> CGKeyCode? {
    let normalized = key.uppercased()

    if normalized.count == 1, let scalar = normalized.unicodeScalars.first {
      let character = Character(scalar)
      return letterAndDigitKeyCodes[character]
    }

    return namedKeyCodes[normalized]
  }

  private static let letterAndDigitKeyCodes: [Character: CGKeyCode] = [
    "A": 0, "S": 1, "D": 2, "F": 3, "H": 4, "G": 5, "Z": 6, "X": 7,
    "C": 8, "V": 9, "B": 11, "Q": 12, "W": 13, "E": 14, "R": 15,
    "Y": 16, "T": 17, "1": 18, "2": 19, "3": 20, "4": 21, "6": 22,
    "5": 23, "9": 25, "7": 26, "8": 28, "0": 29, "O": 31, "U": 32,
    "I": 34, "P": 35, "L": 37, "J": 38, "K": 40, "N": 45, "M": 46
  ]

  private static let namedKeyCodes: [String: CGKeyCode] = [
    "ARROWDOWN": 125,
    "ARROWLEFT": 123,
    "ARROWRIGHT": 124,
    "ARROWUP": 126,
    "BACKSPACE": 51,
    "DELETE": 51,
    "END": 119,
    "ENTER": 36,
    "ESC": 53,
    "ESCAPE": 53,
    "HOME": 115,
    "PAGEDOWN": 121,
    "PAGEUP": 116,
    "RETURN": 36,
    "SPACE": 49,
    "TAB": 48
  ]
}
