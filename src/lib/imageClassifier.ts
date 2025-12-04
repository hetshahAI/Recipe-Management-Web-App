// Lightweight wrapper to load TF.js and MobileNet from CDN and classify images in-browser.
// This keeps model loading lazy and avoids bundling heavy libs.

async function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src=\"${url}\"]`)) return resolve();
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(s);
  });
}

let _modelPromise: Promise<any> | null = null;

export async function loadMobileNet() {
  if (_modelPromise) return _modelPromise;

  _modelPromise = (async () => {
    // Load TensorFlow.js first
    if (!(window as any).tf) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js');
    }
    // Then MobileNet model UMD bundle
    if (!(window as any).mobilenet) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');
    }
    // mobilenet exposes a `mobilenet` global with load()
    const mobilenet = (window as any).mobilenet;
    if (!mobilenet) throw new Error('mobilenet not available');
    const model = await mobilenet.load();
    return model;
  })();

  return _modelPromise;
}

export async function classifyDataUrl(dataUrl: string) {
  const model = await loadMobileNet();
  return new Promise<Array<{ label: string; confidence: number }>>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const results = await model.classify(img);
        // results are like [{className: 'cheeseburger', probability: 0.9}, ...]
        resolve(results.map((r: any) => ({ label: r.className as string, confidence: r.probability as number })));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(new Error('Failed to load image for classification'));
    img.src = dataUrl;
  });
}

export default classifyDataUrl;
