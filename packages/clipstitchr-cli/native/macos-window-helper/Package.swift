// swift-tools-version: 5.9

import PackageDescription

let package = Package(
  name: "macos-window-helper",
  platforms: [.macOS(.v13)],
  products: [
    .executable(name: "macos-window-helper", targets: ["MacosWindowHelper"])
  ],
  targets: [
    .executableTarget(name: "MacosWindowHelper")
  ]
)
