// swift-tools-version:6.2
import PackageDescription

let package = Package(
    name: "swift-function",
    dependencies: [
        .package(url: "https://github.com/appwrite/sdk-for-swift", .upToNextMajor(from: "13.2.2")),
    ],
    targets: [
        .executableTarget(
            name: "swift-function",
            dependencies: [
                .product(name: "Appwrite", package: "sdk-for-swift")
            ]),
    ]
)