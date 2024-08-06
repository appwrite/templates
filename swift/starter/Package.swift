// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "swift-function",
    dependencies: [
        .package(url: "https://github.com/appwrite/sdk-for-swift", .upToNextMajor(from: "5.0.2")),
    ],
    targets: [
        .executableTarget(
            name: "swift-function",
            dependencies: [
                .product(name: "Appwrite", package: "sdk-for-swift")
            ]),
    ]
)