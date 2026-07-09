import Foundation

final class WindowStore {
  private var selectedWindowId: UInt32?

  func selectedWindow() throws -> WindowInfo {
    guard let selectedWindowId else {
      throw HelperError("Select a window first.")
    }

    guard let window = WindowListing.findWindow(id: selectedWindowId) else {
      throw HelperError("Selected window is no longer visible.")
    }

    return window
  }

  func select(id: UInt32) throws -> WindowInfo {
    guard let window = WindowListing.findWindow(id: id) else {
      throw HelperError("Window was not found.")
    }

    selectedWindowId = id
    return window
  }

  func select(match: String) throws -> WindowInfo {
    guard let window = WindowListing.findWindow(match: match) else {
      throw HelperError("No visible window matched \(match).")
    }

    selectedWindowId = window.id
    return window
  }
}
