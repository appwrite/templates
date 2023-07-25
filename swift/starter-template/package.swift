import PackageDescription

let package = Package(
    name: "swift-5.5",
    dependencies: [
        .package(url: "https://github.com/appwrite/sdk-for-swift", .upToNextMajor(from: "1.0.0")),
    ],
    targets: [
        .executableTarget(
            name: "swift-5.5",
            dependencies: [
                .product(name: "Appwrite", package: "sdk-for-swift")
            ]),
    ]
)