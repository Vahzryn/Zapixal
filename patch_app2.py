import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# find handleConvertAll definition to the end of the function
pattern = r"const handleConvertAll = async \(\) => \{.*?setViewState\('success'\);\n  \};"

new_func = """const handleConvertAll = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    // Limit concurrency to keep UI responsive
    const concurrencyLimit = 2; 
    let activeTasks = 0;
    let currentIndex = 0;

    return new Promise<void>((resolve) => {
      const processNext = async () => {
        if (currentIndex >= items.length && activeTasks === 0) {
          setIsProcessing(false);
          setViewState('success');
          resolve();
          return;
        }

        while (activeTasks < concurrencyLimit && currentIndex < items.length) {
          const itemIndex = currentIndex++;
          activeTasks++;
          
          const currentItem = items[itemIndex];
          
          // Yield to main thread briefly before heavy work
          await new Promise(r => setTimeout(r, 20));

          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id
                ? { ...item, status: 'processing', progress: 30 }
                : item
            )
          );

          try {
            // Give UI time to update the progress bar to 30%
            await new Promise(r => setTimeout(r, 20));
            const result = await convertSingleImage(currentItem, settings);
            
            setItems((prev) =>
              prev.map((item) =>
                item.id === currentItem.id
                  ? {
                      ...item,
                      status: 'completed',
                      progress: 100,
                      convertedBlob: result.blob,
                      convertedSize: result.convertedSize,
                      convertedUrl: result.convertedUrl,
                      convertedDimensions: result.dimensions,
                      convertedFormat: settings.targetFormat,
                    }
                  : item
              )
            );
          } catch (error: any) {
            console.error(`Error converting ${currentItem.name}:`, error);
            setItems((prev) =>
              prev.map((item) =>
                item.id === currentItem.id
                  ? {
                      ...item,
                      status: 'error',
                      progress: 0,
                      errorMessage: error.message || 'Conversion failed',
                    }
                  : item
              )
            );
          } finally {
            activeTasks--;
            // Yield before starting next
            setTimeout(processNext, 20);
          }
        }
      };

      processNext();
    });
  };"""

content = re.sub(pattern, new_func, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)

