const pdfUrl = 'https://ishraq-qureshi.github.io/pdf-annotation/assets/pdfs/sample.pdf';
const canvasContainer = document.getElementById("pdfCanvas");
let pdfDoc = null;
let annotationType;
let isDrawing = false;
let startX, startY, endX, endY;

let annotationCanvas, annotationContext;

let annotations = {
  measure: [],
  highlights: [],
  addText: [],
}

/**
 * Render PDF into canvas & create an Annotation canvas
 * @param url Pdf File
 * @param canvasContainer Canvas container where all canvas will be created 
 * 
 */
const renderPDF = async (url, canvasContainer) => {

  const loadingTask = pdfjsLib.getDocument(url);
  pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let annotationCanvasWidth = 0;
  let annotationCanvasHeight = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
	  const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    annotationCanvasWidth = viewport.width;
    annotationCanvasHeight = annotationCanvasHeight + viewport.height;
    canvasContainer.append(canvas);    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext);	  
  }

  annotationCanvas = document.createElement('canvas');
  annotationContext = annotationCanvas.getContext('2d');
  annotationCanvas.height = annotationCanvasHeight;
  annotationCanvas.width = annotationCanvasWidth;
  annotationCanvas.setAttribute("id", "pdfAnnotations");
  canvasContainer.append(annotationCanvas);

};

const setAnnotationType = (type) => {
  annotationType = type;  
  annotationCanvas.removeEventListener('mousedown', handleMouseDown);
  annotationCanvas.removeEventListener('mousemove', handleMouseMove);
  annotationCanvas.removeEventListener('mouseup', handleMouseUp);
  annotationCanvas.removeEventListener('mouseup', handleTextHighlight);

  if (annotationType === 'highlight') {    
    annotationCanvas.addEventListener('mouseup', handleTextHighlight);
  } else if (annotationType === 'measure') {    
    annotationCanvas.addEventListener('mousedown', handleMouseDown);
    annotationCanvas.addEventListener('mousemove', handleMouseMove);
    annotationCanvas.addEventListener('mouseup', handleMouseUp);
  }

};

const handleTextHighlight = (event) => {
  // Logic for text highlighting
  // You may refer to previous examples for this function
};

const handleMouseDown = (event) => {
  if (event.target.tagName !== 'CANVAS') return;
  isDrawing = true;  
  const rect = event.target.getBoundingClientRect();
  startX = (event.clientX - rect.left) * (event.target.width / rect.width);
  startY = (event.clientY - rect.top) * (event.target.height / rect.height);
  annotationContext.beginPath();
  annotationContext.moveTo(startX, startY);
};

const handleMouseMove = async (event) => {
  if (!isDrawing) return;
  if (event.target.tagName !== 'CANVAS') return;
  const rect = event.target.getBoundingClientRect();
  endX = (event.clientX - rect.left) * (event.target.width / rect.width);
  endY = (event.clientY - rect.top) * (event.target.height / rect.height);
  drawMeasureAnnotations();
  annotationContext.beginPath();
  annotationContext.moveTo(startX, startY);
  annotationContext.lineTo(endX, endY);
  annotationContext.stroke();

  const pixelDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const inchDistance = pixelDistance / annotationContext.canvas.width * 8.5; // Assuming 8.5 inches for canvas width

  const measurement = inchDistance.toFixed(2) + ' inches';

  annotationContext.font = '14px Arial';
  annotationContext.fillStyle = 'black';
  annotationContext.fillText(measurement, startX, startY - 10);
};

const handleMouseUp = (event) => {
  if (event.target.tagName !== 'CANVAS') return;
  isDrawing = false;  
  annotations.measure.push({ startX, startY, endX, endY })

  drawMeasureAnnotations();  
};

const drawMeasureAnnotations = () => {
  annotationContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);

  annotationContext.strokeStyle = 'black';
  annotationContext.lineWidth = 1;

  for (const annotation of annotations.measure) {
    annotationContext.beginPath();
    annotationContext.moveTo(annotation.startX, annotation.startY);
    annotationContext.lineTo(annotation.endX, annotation.endY);
    annotationContext.stroke();

    const pixelDistance = Math.sqrt((annotation.endX - annotation.startX) ** 2 + (annotation.endY - annotation.startY) ** 2);
    const inchDistance = pixelDistance / annotationContext.canvas.width * 8.5; // Assuming 8.5 inches for canvas width

    const measurement = inchDistance.toFixed(2) + ' inches';

    annotationContext.font = '14px Arial';
    annotationContext.fillStyle = 'black';
    annotationContext.fillText(measurement, annotation.startX, annotation.startY - 10);
  }
};

const downloadPDF = () => {
  // Logic to download the annotated PDF
  // This will involve converting the canvas to a PDF or saving the annotations in some way
};

renderPDF(pdfUrl, canvasContainer);