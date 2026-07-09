import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct ScreenshotCapture {
  static func capture(window: WindowInfo) throws -> [String: Any] {
    guard
      let image = CGWindowListCreateImage(
        .null,
        .optionIncludingWindow,
        CGWindowID(window.id),
        [.boundsIgnoreFraming, .nominalResolution]
      )
    else {
      throw HelperError("Could not capture the selected window.")
    }

    let data = NSMutableData()

    guard
      let destination = CGImageDestinationCreateWithData(
        data,
        UTType.png.identifier as CFString,
        1,
        nil
      )
    else {
      throw HelperError("Could not create PNG screenshot.")
    }

    CGImageDestinationAddImage(destination, image, nil)

    guard CGImageDestinationFinalize(destination) else {
      throw HelperError("Could not finish PNG screenshot.")
    }

    return [
      "base64": (data as Data).base64EncodedString(),
      "height": image.height,
      "window": window.toDictionary(),
      "width": image.width
    ]
  }
}
