### WEB projeto 01

## How to run this project

Do not just open index.html and expect the project to work, it doesn't for the following reasons:

- Module imports: The project uses ECMAScript modules (ES modules) for importing libraries and other modules. Browsers enforce CORS (Cross-Origin Resource Sharing) policy when using ES modules in a local file system context (file:// protocol), causing the imports to fail. This is a security feature in modern browsers to prevent unauthorized access to local files.

- Fetch API: The project uses the Fetch API to load MIDI and MP3 files. The Fetch API follows the same-origin policy and might not work with local files (file:// protocol), causing the requests to fail.

```sh
npm install
```

```sh
npm run dev
```

or

```sh
python3 -m http.server 8000
```

or

```sh
python3 server.py
```

### Use one of this methods to run the project!

## Build for production

The project is not ready yet, but you can do it running the following command

```sh
npm run build
```

## License

Licensed under either of

- Apache License, Version 2.0
  ([LICENSE-APACHE](LICENSE-APACHE) available at http://www.apache.org/licenses/LICENSE-2.0)
- MIT license
  ([LICENSE-MIT](LICENSE-MIT) available at http://opensource.org/licenses/MIT)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
