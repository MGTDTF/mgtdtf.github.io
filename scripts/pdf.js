const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = urlParams.get('file');

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';

async function loadPDF() {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1); // Load the first page

    const scale = 1.5; // Scale for zooming
    const viewport = page.getViewport({ scale });

    // Prepare canvas using PDF page dimensions
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render PDF page into canvas context
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    await page.render(renderContext).promise;
}

loadPDF();