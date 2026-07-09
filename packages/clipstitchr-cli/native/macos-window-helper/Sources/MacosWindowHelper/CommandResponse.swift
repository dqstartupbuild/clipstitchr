import Foundation

struct CommandResponse {
  let id: String
  let ok: Bool
  let result: Any?
  let error: String?

  func write() {
    var body: [String: Any] = [
      "id": id,
      "ok": ok
    ]

    if let result {
      body["result"] = result
    }

    if let error {
      body["error"] = error
    }

    do {
      let data = try JSONSerialization.data(withJSONObject: body)
      FileHandle.standardOutput.write(data)
      FileHandle.standardOutput.write(Data("\n".utf8))
    } catch {
      FileHandle.standardError.write(Data("Failed to write JSON response.\n".utf8))
    }
  }
}
