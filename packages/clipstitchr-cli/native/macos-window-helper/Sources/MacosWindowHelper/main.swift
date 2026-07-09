import Foundation

let handler = CommandHandler()

while let line = readLine(strippingNewline: true) {
  do {
    handler.handle(try CommandRequest.parse(line)).write()
  } catch {
    CommandResponse(
      id: "unknown",
      ok: false,
      result: nil,
      error: String(describing: error)
    ).write()
  }
}
