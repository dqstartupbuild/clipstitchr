import Foundation

struct CommandRequest {
  let command: String
  let id: String
  let params: [String: Any]

  static func parse(_ line: String) throws -> CommandRequest {
    let data = Data(line.utf8)
    let value = try JSONSerialization.jsonObject(with: data)

    guard let raw = value as? [String: Any] else {
      throw HelperError("Request must be a JSON object.")
    }

    guard let id = raw["id"] as? String, !id.isEmpty else {
      throw HelperError("Request needs an id.")
    }

    guard let command = raw["command"] as? String, !command.isEmpty else {
      throw HelperError("Request needs a command.")
    }

    return CommandRequest(
      command: command,
      id: id,
      params: raw["params"] as? [String: Any] ?? [:]
    )
  }
}
