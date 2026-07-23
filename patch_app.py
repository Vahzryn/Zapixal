with open("src/App.tsx", "r") as f:
    content = f.read()

old_convert_all = """  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];

      // Update item state to processing
      setItems((prev) =>
        prev.map((item) =>
          item.id === currentItem.id
            ? { ...item, status: 'processing', progress: 30 }
            : item
        )
      );

      try {
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
      }
    }
    setIsProcessing(false);
    setViewState('success');
  };"""

new_convert_all = """  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    // Limit concurrency to keep UI responsive
    const concurrencyLimit = 3; 
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
          await new Promise(r => setTimeout(r, 10));

          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id
                ? { ...item, status: 'processing', progress: 30 }
                : item
            )
          );

          try {
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
            processNext();
          }
        }
      };

      processNext();
    });
  };"""

content = content.replace(old_convert_all, new_convert_all)

with open("src/App.tsx", "w") as f:
    f.write(content)
