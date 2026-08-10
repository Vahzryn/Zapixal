async function run() {
  try {
    const url = await import('@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url');
    console.log(url);
  } catch (e) {
    console.log("Failed to import");
  }
}
run();
