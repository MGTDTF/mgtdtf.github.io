document.addEventListener("DOMContentLoaded", function() {
    const pdfContainer = document.getElementById('pdf-container');
    const pdfNative = document.getElementById('pdf-native');
    const pdfJs = document.getElementById('pdf-js');
    const homepage = document.getElementById('homepage-container');
    let currentPdfUrl = null;  // Variable to store the current PDF URL
    let useNativeViewer = false; // Toggle for viewer type

    // Load the XML file and generate the menu
    fetch('/xml/pdf.xml')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const aside = document.getElementById('menu');
            const menuList = document.createElement('ul'); // Create a new unordered list for the menu

            // Function to create a menu item
            const createMenuItem = (title, url) => {
                const menuItem = document.createElement('li'); // Create a new list item
                const link = document.createElement('a'); // Create a new link
                link.href = `/?pdf=${url}`; // Set the href with the URL parameter
                link.textContent = title; // Set the link text
                link.onclick = function (event) {
                    event.preventDefault(); // Prevent the default link behavior
                    currentPdfUrl = url; // Store the current PDF URL
                    loadFile(url);
                    toggleMenu();
                };

                menuItem.appendChild(link); // Append the link to the list item
                return menuItem;
            };

            // Add the "Home" menu item
            const homeMenuItem = createMenuItem("Home", "home");
            homeMenuItem.querySelector('a').onclick = function(event) {
                event.preventDefault(); // Prevent default link behavior
                window.location.href = '/'; // Redirect to home page or reload
            };
            menuList.appendChild(homeMenuItem); // Add the "Home" item at the top of the menu


            // Function to create the expandable menu
            const createMenu = (menuElement) => {
                const menuContainer = document.createElement('li'); // Create a new list item for the menu heading
                const title = menuElement.getElementsByTagName('title')[0].textContent;
                const childItems = menuElement.getElementsByTagName('item');

                // Create a heading for the menu
                const menuHeading = document.createElement('span');
                menuHeading.textContent = `+ ${title}`; // Add '+' to indicate expandable item
                menuHeading.style.cursor = 'pointer';

                // Create a sublist for the child items
                const childList = document.createElement('ul');
                for (let j = 0; j < childItems.length; j++) {
                    const childTitle = childItems[j].getElementsByTagName('title')[0].textContent;
                    const childUrl = childItems[j].getElementsByTagName('url')[0].textContent;
                    childList.appendChild(createMenuItem(childTitle, childUrl)); // Append child items
                }
                childList.style.display = 'none'; // Hide child list by default

                menuHeading.onclick = function() {
                    if (childList.style.display === 'none') {
                        childList.style.display = 'block'; // Show child items
                        this.textContent = `- ${title}`; // Change '+' to '-' when expanded
                    } else {
                        childList.style.display = 'none'; // Hide child items
                        this.textContent = `+ ${title}`; // Change '-' back to '+'
                    }
                };

                menuContainer.appendChild(menuHeading); // Append the heading
                menuContainer.appendChild(childList); // Append the child list
                return menuContainer;
            };

            // Process the XML data to create the menu
            const pdfNode = data.getElementsByTagName('pdf')[0];
            const children = pdfNode.childNodes;

            // Loop through the child nodes of the <pdf> element
            for (let i = 0; i < children.length; i++) {
                const child = children[i];

                // Check if the child is a <menu> or <item>
                if (child.nodeName === 'menu') {
                    menuList.appendChild(createMenu(child)); // Append the menu
                } else if (child.nodeName === 'item') {
                    const title = child.getElementsByTagName('title')[0].textContent;
                    const url = child.getElementsByTagName('url')[0].textContent;
                    menuList.appendChild(createMenuItem(title, url)); // Append the item
                }
            }

            aside.appendChild(menuList); // Append the menu list to the aside element
        })
        .catch(error => {
            console.error('Error loading XML:', error);
        });

    // Toggle PDF viewer type
    const toggleViewButton = document.getElementById('toggleViewButton');
    toggleViewButton.addEventListener('click', () => {
        useNativeViewer = !useNativeViewer;
        toggleViewButton.classList.toggle('nativePdfViewer');
        toggleViewButton.textContent = useNativeViewer ? "Switch to PDF.js View" : "Switch to Native PDF View";
        if (currentPdfUrl) {
            loadPdfContent(currentPdfUrl);
        }
    });

    // Centralized function to toggle visibility of containers
    function toggleDisplay({ showHomepage = false, showPdfContainer = false, showPdfNative = false, showPdfJs = false }) {
        homepage.style.display = showHomepage ? 'block' : 'none';
        pdfContainer.style.display = showPdfContainer ? 'block' : 'none';
        pdfNative.style.display = showPdfNative ? 'block' : 'none';
        pdfJs.style.display = showPdfJs ? 'block' : 'none';
    }

    // Function to handle file loading
    function loadFile(url) {
        const fileExtension = url.split('.').pop().toLowerCase();
    
        // Check if the URL is an external website
        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.open(url, '_blank'); // Open the website in a new tab
        } else if (fileExtension === 'html') {
            loadHtmlContent(url);
        } else if (fileExtension === 'pdf') {
            loadPdfContent(url);
        } else {
            console.error('Unsupported file type or URL:', url);
        }
    }
    



    // Function to load HTML content
    function loadHtmlContent(url) {
        console.debug('Loading HTML file:', url);
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(htmlContent => {
                homepage.innerHTML = htmlContent;
                homepage.style.backgroundImage = 'none';
                homepage.style.width = '100%';
                console.log("about to execute scripts");
                executeScripts(homepage);
                toggleDisplay({ showHomepage: true });
            })
            .catch(error => console.error('Error loading HTML file:', error));
    }

    function hidePdfContainers() {
        const pdfContainer = document.getElementById('pdf-container');
        const pdfNative = document.getElementById('pdf-native');
        const pdfJs = document.getElementById('pdf-js');

        if (pdfContainer) pdfContainer.style.display = 'none';
        if (pdfNative) pdfNative.style.display = 'none';
        if (pdfJs) pdfJs.style.display = 'none';
    }


    // Function to execute scripts in loaded HTML
    function executeScripts(element) {
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
            script.remove();
        });
    }


    // Function to load PDF content
    function loadPdfContent(url) {
        currentPdfUrl = url; // Store the URL globally
        toggleDisplay({ showPdfContainer: true, showPdfNative: useNativeViewer, showPdfJs: !useNativeViewer });
        if (useNativeViewer) {
            loadNativePDF(url);
        } else {
            loadPDF(url);
        }
    }
    
    // Function to load native PDF
    function loadNativePDF(pdfPath) {
        pdfNative.innerHTML = ''; // Clear previous content
        const iframe = document.createElement('iframe');
        iframe.src = pdfPath;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        pdfNative.appendChild(iframe);
    }




    // PDF rendering and loading functions
    let pdfDoc = null;
    let currentPage = 1;
    let isRendering = false;
    let canvas = document.getElementById('pdf-canvas');
    let ctx = canvas.getContext('2d');
    
    // Load the PDF
    function loadPDF(url) {
        pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
            if (homepage) {
                homepage.style.display = "none"; // Hide the element
            }
            pdfDoc = pdfDoc_;
            document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
            renderPage(currentPage); // Render the first page
        });
    }
    
    // Render a page
    function renderPage(pageNumber) {
        isRendering = true; // Prevent multiple renders at once
        pdfDoc.getPage(pageNumber).then(function (page) {
            let viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
            canvas.height = viewport.height;
            canvas.width = viewport.width;
    
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
    
            page.render(renderContext).promise.then(function () {
                isRendering = false; // Mark rendering as complete
                document.getElementById('page-info').textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
            });
        });
    }
    
    // Add navigation event listeners
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1 && !isRendering) {
            currentPage--;
            renderPage(currentPage);
        }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < pdfDoc.numPages && !isRendering) {
            currentPage++;
            renderPage(currentPage);
        }
    }); 
});
